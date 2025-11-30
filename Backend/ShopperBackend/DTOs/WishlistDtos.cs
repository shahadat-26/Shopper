using System;
using System.ComponentModel.DataAnnotations;

namespace ShopperBackend.DTOs
{
    public class WishlistDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public DateTime CreatedAt { get; set; }
        public ProductListDto Product { get; set; }
    }

    public class AddToWishlistDto
    {
        [Required]
        public int ProductId { get; set; }
    }
}