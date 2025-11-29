using ShopperBackend.DTOs;
using ShopperBackend.Repositories;
using ShopperBackend.Models;
using ShopperBackend.Data;
using Microsoft.EntityFrameworkCore;

namespace ShopperBackend.Services
{
    public class VendorService : IVendorService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IProductRepository _productRepository;
        private readonly ShopperDbContext _context;

        public VendorService(IOrderRepository orderRepository, IProductRepository productRepository, ShopperDbContext context)
        {
            _orderRepository = orderRepository;
            _productRepository = productRepository;
            _context = context;
        }

        public async Task<IEnumerable<OrderDto>> GetVendorOrdersAsync(int vendorId)
        {
            var orders = await _orderRepository.GetVendorOrdersAsync(vendorId);
            return orders.Select(o => new OrderDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                UserId = o.UserId,
                SubTotal = o.SubTotal,
                TaxAmount = o.TaxAmount,
                ShippingAmount = o.ShippingAmount,
                DiscountAmount = o.DiscountAmount,
                TotalAmount = o.TotalAmount,
                Status = o.Status,
                PaymentMethod = o.PaymentMethod,
                PaymentStatus = o.PaymentStatus,
                ShippingAddressId = o.ShippingAddressId,
                BillingAddressId = o.BillingAddressId,
                TrackingNumber = o.TrackingNumber,
                Notes = o.Notes,
                CreatedAt = o.CreatedAt,
                UpdatedAt = o.UpdatedAt,
                EstimatedDelivery = o.EstimatedDelivery,
                User = o.User != null ? new UserDto
                {
                    Id = o.User.Id,
                    Email = o.User.Email,
                    FirstName = o.User.FirstName,
                    LastName = o.User.LastName,
                    PhoneNumber = o.User.PhoneNumber,
                    Role = o.User.Role,
                    IsEmailVerified = o.User.IsEmailVerified,
                    IsActive = o.User.IsActive,
                    CreatedAt = o.User.CreatedAt
                } : null,
                ShippingAddress = o.ShippingAddress != null ? new AddressDto
                {
                    Id = o.ShippingAddress.Id,
                    AddressLine1 = o.ShippingAddress.AddressLine1,
                    AddressLine2 = o.ShippingAddress.AddressLine2,
                    City = o.ShippingAddress.City,
                    State = o.ShippingAddress.State,
                    Country = o.ShippingAddress.Country,
                    PostalCode = o.ShippingAddress.PostalCode,
                    AddressType = o.ShippingAddress.AddressType,
                    IsDefault = o.ShippingAddress.IsDefault
                } : null,
                BillingAddress = o.BillingAddress != null ? new AddressDto
                {
                    Id = o.BillingAddress.Id,
                    AddressLine1 = o.BillingAddress.AddressLine1,
                    AddressLine2 = o.BillingAddress.AddressLine2,
                    City = o.BillingAddress.City,
                    State = o.BillingAddress.State,
                    Country = o.BillingAddress.Country,
                    PostalCode = o.BillingAddress.PostalCode,
                    AddressType = o.BillingAddress.AddressType,
                    IsDefault = o.BillingAddress.IsDefault
                } : null,
                Items = o.OrderItems?
                    .Where(oi => oi.VendorId == vendorId)
                    .Select(oi => new OrderItemDto
                    {
                        Id = oi.Id,
                        ProductId = oi.ProductId,
                        ProductName = oi.ProductName ?? oi.Product?.Name ?? "Unknown Product",
                        ProductSKU = oi.ProductSKU ?? oi.Product?.SKU ?? "",
                        Quantity = oi.Quantity,
                        Price = oi.Price,
                        Subtotal = oi.Price * oi.Quantity,
                        Status = "Pending"
                    }).ToList() ?? new List<OrderItemDto>()
            });
        }

        public async Task UpdateOrderStatusAsync(int orderId, int vendorId, string status)
        {
            var orderItems = await _orderRepository.GetOrderItemsAsync(orderId);
            if (orderItems != null && orderItems.Any(oi => oi.VendorId == vendorId))
            {
                await _orderRepository.UpdateOrderStatusAsync(orderId, status);
            }
        }

        public async Task<VendorAnalyticsDto> GetVendorAnalyticsAsync(int vendorId)
        {
            var products = await _productRepository.GetByVendorIdAsync(vendorId);
            var orders = await _orderRepository.GetVendorOrdersAsync(vendorId);

            foreach (var order in orders)
            {
                if (order.OrderItems == null || !order.OrderItems.Any())
                {
                    order.OrderItems = (await _orderRepository.GetOrderItemsAsync(order.Id)).ToList();
                }
            }

            var topProducts = orders
                .SelectMany(o => o.OrderItems)
                .Where(oi => oi.VendorId == vendorId)
                .GroupBy(oi => oi.ProductId)
                .Select(g => new
                {
                    ProductId = g.Key,
                    ProductName = g.First().ProductName ?? products.FirstOrDefault(p => p.Id == g.Key)?.Name ?? "Unknown",
                    TotalQuantity = g.Sum(oi => oi.Quantity),
                    TotalRevenue = g.Sum(oi => oi.Price * oi.Quantity)
                })
                .OrderByDescending(p => p.TotalQuantity)
                .Take(5)
                .Select(p => new TopProductDto
                {
                    Id = p.ProductId,
                    Name = p.ProductName,
                    Sold = p.TotalQuantity,
                    Revenue = p.TotalRevenue
                })
                .ToList();

            var revenueByMonth = orders
                .Where(o => o.CreatedAt >= DateTime.UtcNow.AddMonths(-6))
                .SelectMany(o => o.OrderItems
                    .Where(oi => oi.VendorId == vendorId)
                    .Select(oi => new { o.CreatedAt, Revenue = oi.Price * oi.Quantity }))
                .GroupBy(x => new { x.CreatedAt.Year, x.CreatedAt.Month })
                .Select(g => new MonthlyRevenueDto
                {
                    Name = $"{g.Key.Year}-{g.Key.Month:D2}",
                    Revenue = g.Sum(x => x.Revenue)
                })
                .OrderBy(m => m.Name)
                .ToList();

            var totalVendorRevenue = orders
                .SelectMany(o => o.OrderItems)
                .Where(oi => oi.VendorId == vendorId)
                .Sum(oi => oi.Price * oi.Quantity);

            return new VendorAnalyticsDto
            {
                TopProducts = topProducts.Any() ? topProducts : new List<TopProductDto>(),
                RevenueByMonth = revenueByMonth,
                TotalRevenue = totalVendorRevenue,
                TotalOrders = orders.Count(),
                TotalProducts = products.Count(),
                ActiveProducts = products.Count(p => p.IsActive),
                PendingOrders = orders.Count(o => o.Status == "Pending" || o.Status == "Processing")
            };
        }

        public async Task<VendorDashboardDto> GetDashboardStatsAsync(int vendorId)
        {
            var products = await _productRepository.GetByVendorIdAsync(vendorId);
            var orders = await _orderRepository.GetVendorOrdersAsync(vendorId);

            foreach (var order in orders)
            {
                if (order.OrderItems == null || !order.OrderItems.Any())
                {
                    order.OrderItems = (await _orderRepository.GetOrderItemsAsync(order.Id)).ToList();
                }
            }

            var totalVendorRevenue = orders
                .SelectMany(o => o.OrderItems)
                .Where(oi => oi.VendorId == vendorId)
                .Sum(oi => oi.Price * oi.Quantity);

            var recentOrderDtos = orders.OrderByDescending(o => o.CreatedAt).Take(5).Select(o => new OrderDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                UserId = o.UserId,
                SubTotal = o.SubTotal,
                TaxAmount = o.TaxAmount,
                ShippingAmount = o.ShippingAmount,
                DiscountAmount = o.DiscountAmount,
                TotalAmount = o.TotalAmount,
                Status = o.Status,
                PaymentMethod = o.PaymentMethod,
                PaymentStatus = o.PaymentStatus,
                CreatedAt = o.CreatedAt,
                UpdatedAt = o.UpdatedAt,
                Items = o.OrderItems?
                    .Where(oi => oi.VendorId == vendorId)
                    .Select(oi => new OrderItemDto
                    {
                        Id = oi.Id,
                        ProductId = oi.ProductId,
                        ProductName = oi.ProductName ?? oi.Product?.Name ?? "Unknown Product",
                        ProductSKU = oi.ProductSKU ?? oi.Product?.SKU ?? "",
                        Quantity = oi.Quantity,
                        Price = oi.Price,
                        Subtotal = oi.Price * oi.Quantity,
                        Status = "Pending"
                    }).ToList() ?? new List<OrderItemDto>()
            }).ToList();

            return new VendorDashboardDto
            {
                TotalProducts = products.Count(),
                ActiveProducts = products.Count(p => p.IsActive),
                PendingOrders = orders.Count(o => o.Status == "Pending" || o.Status == "Processing" || o.Status == "Confirmed"),
                TotalRevenue = totalVendorRevenue,
                TotalOrders = orders.Count(),
                RecentProducts = products.OrderByDescending(p => p.CreatedAt).Take(5).Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    SKU = p.SKU,
                    Description = p.Description,
                    Price = p.Price,
                    Quantity = p.Quantity,
                    ImageUrl = p.ImageUrl,
                    ImageData = p.ImageData != null ? Convert.ToBase64String(p.ImageData) : null,
                    ImageMimeType = p.ImageMimeType,
                    IsActive = p.IsActive,
                    IsFeatured = p.IsFeatured,
                    CategoryId = p.CategoryId,
                    VendorId = p.VendorId
                }).ToList(),
                RecentOrders = recentOrderDtos
            };
        }

        public async Task<Vendor> GetVendorByUserIdAsync(int userId)
        {
            return await _context.Vendors
                .Where(v => v.UserId == userId)
                .FirstOrDefaultAsync();
        }
    }
}