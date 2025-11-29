using System;
using System.ComponentModel.DataAnnotations;

namespace ShopperBackend.DTOs
{
    public class VendorDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string StoreName { get; set; }
        public string StoreDescription { get; set; }
        public string LogoUrl { get; set; }
        public string BannerUrl { get; set; }
        public string BusinessEmail { get; set; }
        public string BusinessPhone { get; set; }
        public decimal Rating { get; set; }
        public int TotalSales { get; set; }
        public bool IsApproved { get; set; }
        public UserDto User { get; set; }
    }

    public class CreateVendorDto
    {
        [Required]
        public string StoreName { get; set; }

        public string StoreDescription { get; set; }
        public string BusinessEmail { get; set; }
        public string BusinessPhone { get; set; }
        public string TaxNumber { get; set; }
    }

    public class UpdateVendorDto
    {
        [Required]
        public string StoreName { get; set; }

        public string StoreDescription { get; set; }
        public string BusinessEmail { get; set; }
        public string BusinessPhone { get; set; }
        public string TaxNumber { get; set; }
        public string LogoUrl { get; set; }
        public string BannerUrl { get; set; }
    }

    public class VendorListDto
    {
        public int Id { get; set; }
        public string StoreName { get; set; }
        public string LogoUrl { get; set; }
        public decimal Rating { get; set; }
        public int TotalSales { get; set; }
        public bool IsApproved { get; set; }
    }

    public class ApproveVendorDto
    {
        [Required]
        public bool IsApproved { get; set; }

        public decimal CommissionRate { get; set; } = 10;
    }

    public class VendorDashboardDto
    {
        public decimal TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
        public int TotalProducts { get; set; }
        public int PendingOrders { get; set; }
        public decimal Rating { get; set; }
        public int TotalReviews { get; set; }
        public int ActiveProducts { get; set; }
        public List<ProductDto> RecentProducts { get; set; }
        public List<OrderDto> RecentOrders { get; set; }
    }

    public class VendorAnalyticsDto
    {
        public List<TopProductDto> TopProducts { get; set; }
        public List<MonthlyRevenueDto> RevenueByMonth { get; set; }
        public decimal TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
        public int TotalProducts { get; set; }
    }

    public class TopProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Sold { get; set; }
        public decimal Revenue { get; set; }
    }

    public class MonthlyRevenueDto
    {
        public string Name { get; set; }
        public decimal Revenue { get; set; }
    }
}