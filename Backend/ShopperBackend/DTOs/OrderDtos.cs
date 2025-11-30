using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ShopperBackend.DTOs
{
    public class OrderDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; }
        public int UserId { get; set; }
        public string Status { get; set; }
        public decimal SubTotal { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal ShippingAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public string PaymentMethod { get; set; }
        public string PaymentStatus { get; set; }
        public int? ShippingAddressId { get; set; }
        public int? BillingAddressId { get; set; }
        public string TrackingNumber { get; set; }
        public string Notes { get; set; }
        public DateTime? EstimatedDelivery { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public UserDto User { get; set; }
        public AddressDto ShippingAddress { get; set; }
        public AddressDto BillingAddress { get; set; }
        public List<OrderItemDto> Items { get; set; }
    }

    public class OrderListDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; }
        public string Status { get; set; }
        public decimal TotalAmount { get; set; }
        public string PaymentStatus { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CustomerName { get; set; }
        public int ItemCount { get; set; }
    }

    public class OrderItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public string ProductSKU { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal? Discount { get; set; }
        public decimal? Tax { get; set; }
        public decimal? Subtotal { get; set; }
        public decimal Total { get; set; }
        public string Status { get; set; }
        public ProductListDto Product { get; set; }
    }

    public class CreateOrderDto
    {
        [Required]
        public int ShippingAddressId { get; set; }

        [Required]
        public int BillingAddressId { get; set; }

        [Required]
        public string PaymentMethod { get; set; }

        public string CouponCode { get; set; }
        public string Notes { get; set; }

        [Required]
        public List<OrderCartItemDto> CartItems { get; set; }
    }

    public class OrderCartItemDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }


    public class UpdateOrderStatusDto
    {
        [Required]
        public string Status { get; set; }

        public string? TrackingNumber { get; set; }
        public DateTime? EstimatedDelivery { get; set; }
    }

    public class CancelOrderDto
    {
        [Required]
        [JsonPropertyName("reason")]
        public string Reason { get; set; }
    }

    public class OrderFilterDto
    {
        public string Status { get; set; }
        public string PaymentStatus { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? VendorId { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}