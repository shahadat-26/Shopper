using System;
using System.Collections.Generic;

namespace ShopperBackend.Models
{
    public class Vendor
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string StoreName { get; set; }
        public string? StoreDescription { get; set; }
        public string? LogoUrl { get; set; }
        public string? BannerUrl { get; set; }
        public string? BusinessEmail { get; set; }
        public string? BusinessPhone { get; set; }
        public string? TaxNumber { get; set; }
        public decimal CommissionRate { get; set; }
        public bool IsApproved { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public decimal Rating { get; set; }
        public int TotalSales { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public User User { get; set; }
        public ICollection<Product> Products { get; set; }
    }
}