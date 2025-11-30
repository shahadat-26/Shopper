using System;
using System.Collections.Generic;

namespace ShopperBackend.Models
{
    public class Review
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int UserId { get; set; }
        public int? OrderItemId { get; set; }
        public int Rating { get; set; }
        public string Title { get; set; }
        public string Comment { get; set; }
        public bool IsVerifiedPurchase { get; set; }
        public int HelpfulCount { get; set; }
        public bool IsApproved { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public Product Product { get; set; }
        public User User { get; set; }
        public OrderItem OrderItem { get; set; }
        public ICollection<ReviewImage> Images { get; set; }
    }
}