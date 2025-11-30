using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ShopperBackend.DTOs
{
    public class CartDto
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public List<CartItemDto> Items { get; set; }
        public decimal SubTotal { get; set; }
        public int ItemCount { get; set; }
    }

    public class CartItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int? VariationId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal Total { get; set; }
        public ProductListDto Product { get; set; }
        public ProductVariationDto Variation { get; set; }
    }

    public class AddToCartDto
    {
        [Required]
        public int ProductId { get; set; }

        public int? VariationId { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }

    public class UpdateCartItemDto
    {
        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }

    public class CartSummaryDto
    {
        public decimal SubTotal { get; set; }
        public decimal Tax { get; set; }
        public decimal Shipping { get; set; }
        public decimal Discount { get; set; }
        public decimal Total { get; set; }
        public string CouponCode { get; set; }
    }
}