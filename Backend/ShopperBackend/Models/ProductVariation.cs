using System;

namespace ShopperBackend.Models
{
    public class ProductVariation
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string VariationName { get; set; }
        public string SKU { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string Attributes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public Product Product { get; set; }
    }
}