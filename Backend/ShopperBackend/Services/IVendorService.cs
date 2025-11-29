using ShopperBackend.DTOs;
using ShopperBackend.Models;

namespace ShopperBackend.Services
{
    public interface IVendorService
    {
        Task<IEnumerable<OrderDto>> GetVendorOrdersAsync(int vendorId);
        Task UpdateOrderStatusAsync(int orderId, int vendorId, string status);
        Task<VendorAnalyticsDto> GetVendorAnalyticsAsync(int vendorId);
        Task<VendorDashboardDto> GetDashboardStatsAsync(int vendorId);
        Task<Vendor> GetVendorByUserIdAsync(int userId);
    }
}