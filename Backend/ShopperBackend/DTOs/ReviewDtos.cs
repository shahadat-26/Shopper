using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ShopperBackend.DTOs
{
    public class ReviewDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int Rating { get; set; }
        public string Title { get; set; }
        public string Comment { get; set; }
        public bool IsVerifiedPurchase { get; set; }
        public int HelpfulCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public UserDto User { get; set; }
        public List<string> Images { get; set; }
    }

    public class CreateReviewDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        public string Title { get; set; }

        [Required]
        public string Comment { get; set; }

        public List<string> Images { get; set; }
    }

    public class UpdateReviewDto
    {
        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        public string Title { get; set; }

        [Required]
        public string Comment { get; set; }
    }

    public class ReviewSummaryDto
    {
        public decimal AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public Dictionary<int, int> RatingDistribution { get; set; }
        public int VerifiedPurchases { get; set; }
    }
}