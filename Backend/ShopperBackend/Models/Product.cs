using System;
using System.Collections.Generic;

namespace ShopperBackend.Models
{
    public class Product
    {
        public int Id { get; set; }
        public int VendorId { get; set; }
        public int CategoryId { get; set; }
        public string Name { get; set; }
        public string Slug { get; set; }
        public string Description { get; set; }
        public string ShortDescription { get; set; }
        public string SKU { get; set; }
        public string ImageUrl { get; set; }
        public byte[] ImageData { get; set; }
        public string ImageMimeType { get; set; }
        public string Brand { get; set; }
        public decimal Price { get; set; }
        public decimal? CompareAtPrice { get; set; }
        public decimal? Cost { get; set; }
        public int Quantity { get; set; }
        public int LowStockThreshold { get; set; }
        public decimal? Weight { get; set; }
        public decimal? Length { get; set; }
        public decimal? Width { get; set; }
        public decimal? Height { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsDigital { get; set; }
        public bool IsActive { get; set; }
        public int ViewCount { get; set; }
        public int SalesCount { get; set; }
        public decimal Rating { get; set; }
        public int ReviewCount { get; set; }
        public string MetaTitle { get; set; }
        public string MetaDescription { get; set; }
        public string MetaKeywords { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public Vendor Vendor { get; set; }
        public Category Category { get; set; }
        public ICollection<ProductImage> Images { get; set; }
        public ICollection<ProductAttribute> Attributes { get; set; }
        public ICollection<ProductVariation> Variations { get; set; }
        public ICollection<Review> Reviews { get; set; }
    }
}