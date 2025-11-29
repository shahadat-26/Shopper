using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ShopperBackend.DTOs;
using ShopperBackend.Models;
using ShopperBackend.Repositories;

namespace ShopperBackend.Services
{
    public interface IOrderService
    {
        Task<OrderDto> CreateCODOrderAsync(int userId, CreateOrderDto createDto);
        Task<OrderDto> GetOrderByIdAsync(int orderId);
        Task<OrderDto> GetOrderByNumberAsync(string orderNumber);
        Task<IEnumerable<OrderDto>> GetUserOrdersAsync(int userId);
        Task<bool> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusDto statusDto);
        Task<bool> CancelOrderAsync(int orderId, int userId, CancelOrderDto cancelDto);
    }

    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IProductRepository _productRepository;
        private readonly IAddressRepository _addressRepository;
        private readonly IProductService _productService;

        public OrderService(IOrderRepository orderRepository, IProductRepository productRepository, IAddressRepository addressRepository, IProductService productService)
        {
            _orderRepository = orderRepository;
            _productRepository = productRepository;
            _addressRepository = addressRepository;
            _productService = productService;
        }

        public async Task<OrderDto> CreateCODOrderAsync(int userId, CreateOrderDto createDto)
        {
            var shippingAddress = await _addressRepository.GetByIdAsync(createDto.ShippingAddressId);
            if (shippingAddress == null || shippingAddress.UserId != userId)
            {
                throw new Exception("Invalid shipping address");
            }

            var billingAddress = await _addressRepository.GetByIdAsync(createDto.BillingAddressId);
            if (billingAddress == null || billingAddress.UserId != userId)
            {
                throw new Exception("Invalid billing address");
            }

            var order = new Order
            {
                UserId = userId,
                OrderNumber = GenerateOrderNumber(),
                Status = "Pending",
                SubTotal = 0,
                TaxAmount = 0,
                ShippingAmount = 50,
                DiscountAmount = 0,
                TotalAmount = 0,
                PaymentMethod = "CashOnDelivery",
                PaymentStatus = "Pending",
                Notes = createDto.Notes,
                ShippingAddressId = createDto.ShippingAddressId,
                BillingAddressId = createDto.BillingAddressId,
                EstimatedDelivery = DateTime.UtcNow.AddDays(5),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            decimal subTotal = 0;
            var orderItems = new List<OrderItem>();

            foreach (var cartItem in createDto.CartItems)
            {
                var product = await _productRepository.GetByIdAsync(cartItem.ProductId);
                if (product == null || !product.IsActive)
                {
                    throw new Exception($"Product {cartItem.ProductId} is not available");
                }

                if (product.Quantity < cartItem.Quantity)
                {
                    throw new Exception($"Insufficient stock for {product.Name}");
                }

                var itemTotal = product.Price * cartItem.Quantity;
                subTotal += itemTotal;

                orderItems.Add(new OrderItem
                {
                    ProductId = product.Id,
                    VendorId = product.VendorId,
                    ProductName = product.Name,
                    ProductSKU = product.SKU,
                    Quantity = cartItem.Quantity,
                    Price = product.Price,
                    Discount = 0,
                    Tax = 0,
                    Total = itemTotal
                });

                await _productRepository.UpdateQuantityAsync(product.Id, product.Quantity - cartItem.Quantity);
            }

            order.SubTotal = subTotal;
            order.TaxAmount = subTotal * 0.1m;
            order.TotalAmount = subTotal + order.TaxAmount + order.ShippingAmount - order.DiscountAmount;

            order.Id = await _orderRepository.CreateAsync(order);

            foreach (var item in orderItems)
            {
                item.OrderId = order.Id;
                await _orderRepository.CreateOrderItemAsync(item);
            }

            order.OrderItems = orderItems;
            order.ShippingAddress = shippingAddress;
            order.BillingAddress = billingAddress;

            return await MapToDtoAsync(order);
        }

        public async Task<OrderDto> GetOrderByIdAsync(int orderId)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            if (order == null)
            {
                throw new Exception("Order not found");
            }

            order.OrderItems = (await _orderRepository.GetOrderItemsAsync(orderId)).ToList();
            return await MapToDtoAsync(order);
        }

        public async Task<OrderDto> GetOrderByNumberAsync(string orderNumber)
        {
            var order = await _orderRepository.GetByOrderNumberAsync(orderNumber);
            if (order == null)
            {
                throw new Exception("Order not found");
            }

            order.OrderItems = (await _orderRepository.GetOrderItemsAsync(order.Id)).ToList();
            return await MapToDtoAsync(order);
        }

        public async Task<IEnumerable<OrderDto>> GetUserOrdersAsync(int userId)
        {
            var orders = await _orderRepository.GetUserOrdersAsync(userId);
            var orderDtos = new List<OrderDto>();

            foreach (var order in orders)
            {
                order.OrderItems = (await _orderRepository.GetOrderItemsAsync(order.Id)).ToList();

                if (order.ShippingAddressId.HasValue)
                {
                    order.ShippingAddress = await _addressRepository.GetByIdAsync(order.ShippingAddressId.Value);
                }
                if (order.BillingAddressId.HasValue)
                {
                    order.BillingAddress = await _addressRepository.GetByIdAsync(order.BillingAddressId.Value);
                }

                orderDtos.Add(await MapToDtoAsync(order));
            }

            return orderDtos;
        }

        public async Task<bool> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusDto statusDto)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            if (order == null)
            {
                throw new Exception("Order not found");
            }

            return await _orderRepository.UpdateOrderStatusAsync(orderId, statusDto.Status);
        }

        public async Task<bool> CancelOrderAsync(int orderId, int userId, CancelOrderDto cancelDto)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            if (order == null || order.UserId != userId)
            {
                throw new Exception("Order not found or unauthorized");
            }

            if (order.Status != "Pending" && order.Status != "Confirmed")
            {
                throw new Exception("Order cannot be cancelled");
            }

            order.Status = "Cancelled";
            order.CancelledAt = DateTime.UtcNow;
            order.CancellationReason = cancelDto.Reason;

            var items = await _orderRepository.GetOrderItemsAsync(orderId);
            foreach (var item in items)
            {
                var product = await _productRepository.GetByIdAsync(item.ProductId);
                if (product != null)
                {
                    await _productRepository.UpdateQuantityAsync(product.Id, product.Quantity + item.Quantity);
                }
            }

            return await _orderRepository.UpdateAsync(order);
        }

        private string GenerateOrderNumber()
        {
            return $"ORD{DateTime.UtcNow:yyyyMMddHHmmss}{new Random().Next(1000, 9999)}";
        }

        private async Task<OrderDto> MapToDtoAsync(Order order)
        {
            var itemTasks = order.OrderItems?.Select(MapOrderItemToDtoAsync) ?? new List<Task<OrderItemDto>>();
            var items = await Task.WhenAll(itemTasks);

            return new OrderDto
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                UserId = order.UserId,  // Added missing UserId
                Status = order.Status,
                SubTotal = order.SubTotal,
                TaxAmount = order.TaxAmount,
                ShippingAmount = order.ShippingAmount,
                DiscountAmount = order.DiscountAmount,
                TotalAmount = order.TotalAmount,
                PaymentMethod = order.PaymentMethod,
                PaymentStatus = order.PaymentStatus,
                TrackingNumber = order.TrackingNumber,
                EstimatedDelivery = order.EstimatedDelivery,
                Notes = order.Notes,  // Added missing Notes
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt,  // Added missing UpdatedAt
                User = order.User != null ? new UserDto
                {
                    Id = order.User.Id,
                    Email = order.User.Email,
                    FirstName = order.User.FirstName,
                    LastName = order.User.LastName,
                    PhoneNumber = order.User.PhoneNumber,
                    Role = order.User.Role,
                    IsEmailVerified = order.User.IsEmailVerified,
                    IsActive = order.User.IsActive,
                    CreatedAt = order.User.CreatedAt
                } : null,
                ShippingAddress = order.ShippingAddress != null ? MapAddressToDto(order.ShippingAddress) : null,
                BillingAddress = order.BillingAddress != null ? MapAddressToDto(order.BillingAddress) : null,
                Items = items.ToList()
            };
        }

        private AddressDto MapAddressToDto(Address address)
        {
            return new AddressDto
            {
                Id = address.Id,
                AddressLine1 = address.AddressLine1,
                AddressLine2 = address.AddressLine2,
                City = address.City,
                State = address.State,
                Country = address.Country,
                PostalCode = address.PostalCode,
                IsDefault = address.IsDefault,
                AddressType = address.AddressType
            };
        }

        private async Task<OrderItemDto> MapOrderItemToDtoAsync(OrderItem item)
        {
            var product = await _productRepository.GetByIdAsync(item.ProductId);
            ProductListDto productDto = null;

            if (product != null)
            {
                string primaryImage = null;
                if (product.ImageData != null && product.ImageMimeType != null)
                {
                    primaryImage = $"data:{product.ImageMimeType};base64,{Convert.ToBase64String(product.ImageData)}";
                }
                else if (!string.IsNullOrEmpty(product.ImageUrl))
                {
                    primaryImage = product.ImageUrl;
                }

                productDto = new ProductListDto
                {
                    Id = product.Id,
                    Name = product.Name,
                    PrimaryImage = primaryImage
                };
            }

            return new OrderItemDto
            {
                Id = item.Id,
                ProductId = item.ProductId,
                ProductName = item.ProductName,
                ProductSKU = item.ProductSKU,
                Quantity = item.Quantity,
                Price = item.Price,
                Discount = item.Discount,
                Tax = item.Tax,
                Total = item.Total,
                Status = "Pending",
                Product = productDto
            };
        }
    }
}