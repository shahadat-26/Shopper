using System;

namespace ShopperBackend.Models
{
    public class CartItem
    {
        public int Id { get; set; }
        public int CartId { get; set; }
        public int ProductId { get; set; }
        public int? VariationId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public ShoppingCart Cart { get; set; }
        public Product Product { get; set; }
        public ProductVariation Variation { get; set; }
    }
}