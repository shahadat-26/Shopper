using ShopperBackend.DTOs;
using ShopperBackend.Repositories;
using ShopperBackend.Models;
using ShopperBackend.Data;
using Dapper;

namespace ShopperBackend.Services
{
    public class VendorService : IVendorService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IProductRepository _productRepository;
        private readonly IDatabaseConnection _db;

        public VendorService(IOrderRepository orderRepository, IProductRepository productRepository, IDatabaseConnection db)
        {
            _orderRepository = orderRepository;
            _productRepository = productRepository;
            _db = db;
        }

        public async Task<IEnumerable<OrderDto>> GetVendorOrdersAsync(int vendorId)
        {
            var orders = await _orderRepository.GetVendorOrdersAsync(vendorId);
            return orders.Select(o => new OrderDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                UserId = o.UserId,
                TotalAmount = o.TotalAmount,
                Status = o.Status,
                PaymentMethod = o.PaymentMethod,
                PaymentStatus = o.PaymentStatus,
                ShippingAddressId = o.ShippingAddressId,
                BillingAddressId = o.BillingAddressId,
                Notes = o.Notes,
                CreatedAt = o.CreatedAt,
                Items = o.OrderItems?.Select(oi => new OrderItemDto
                {
                    Id = oi.Id,
                    ProductId = oi.ProductId,
                    ProductName = oi.Product?.Name ?? "",
                    Quantity = oi.Quantity,
                    Price = oi.Price,
                    Subtotal = oi.Subtotal
                }).ToList() ?? new List<OrderItemDto>()
            });
        }

        public async Task UpdateOrderStatusAsync(int orderId, int vendorId, string status)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            if (order != null && order.OrderItems.Any(oi => oi.Product?.VendorId == vendorId))
            {
                order.Status = status;
                order.UpdatedAt = DateTime.UtcNow;
                await _orderRepository.UpdateAsync(order);
            }
        }

        public async Task<VendorAnalyticsDto> GetVendorAnalyticsAsync(int vendorId)
        {
            var products = await _productRepository.GetByVendorIdAsync(vendorId);
            var orders = await _orderRepository.GetVendorOrdersAsync(vendorId);

            var topProducts = products
                .OrderByDescending(p => p.SalesCount)
                .Take(5)
                .Select(p => new TopProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Sold = p.SalesCount,
                    Revenue = p.SalesCount * p.Price
                })
                .ToList();

            var revenueByMonth = orders
                .Where(o => o.CreatedAt >= DateTime.UtcNow.AddMonths(-6))
                .GroupBy(o => new { o.CreatedAt.Year, o.CreatedAt.Month })
                .Select(g => new MonthlyRevenueDto
                {
                    Name = $"{g.Key.Year}-{g.Key.Month:D2}",
                    Revenue = g.Sum(o => o.TotalAmount)
                })
                .OrderBy(m => m.Name)
                .ToList();

            return new VendorAnalyticsDto
            {
                TopProducts = topProducts,
                RevenueByMonth = revenueByMonth,
                TotalRevenue = orders.Sum(o => o.TotalAmount),
                TotalOrders = orders.Count(),
                TotalProducts = products.Count()
            };
        }

        public async Task<VendorDashboardDto> GetDashboardStatsAsync(int vendorId)
        {
            var products = await _productRepository.GetByVendorIdAsync(vendorId);
            var orders = await _orderRepository.GetVendorOrdersAsync(vendorId);

            return new VendorDashboardDto
            {
                TotalProducts = products.Count(),
                ActiveProducts = products.Count(p => p.IsActive),
                PendingOrders = orders.Count(o => o.Status == "Pending" || o.Status == "Processing"),
                TotalRevenue = orders.Sum(o => o.TotalAmount),
                TotalOrders = orders.Count(),
                RecentProducts = products.Take(5).Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    Quantity = p.Quantity,
                    ImageUrl = p.ImageUrl,
                    IsActive = p.IsActive
                }).ToList(),
                RecentOrders = orders.Take(5).Select(o => new OrderDto
                {
                    Id = o.Id,
                    OrderNumber = o.OrderNumber,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status,
                    CreatedAt = o.CreatedAt
                }).ToList()
            };
        }

        public async Task<Vendor> GetVendorByUserIdAsync(int userId)
        {
            using var connection = _db.CreateConnection();
            var query = @"
                SELECT Id, UserId, StoreName, StoreDescription,
                       IsApproved, CreatedAt, UpdatedAt
                FROM Vendors
                WHERE UserId = @UserId";

            return await connection.QueryFirstOrDefaultAsync<Vendor>(query, new { UserId = userId });
        }
    }
}