using System;

namespace ShopperBackend.Models
{
    public class ProductAttribute
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string AttributeName { get; set; }
        public string AttributeValue { get; set; }
        public int DisplayOrder { get; set; }
        public DateTime CreatedAt { get; set; }

        public Product Product { get; set; }
    }
}