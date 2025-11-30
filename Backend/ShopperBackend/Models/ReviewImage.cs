using System;

namespace ShopperBackend.Models
{
    public class ReviewImage
    {
        public int Id { get; set; }
        public int ReviewId { get; set; }
        public string ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }

        public Review Review { get; set; }
    }
}