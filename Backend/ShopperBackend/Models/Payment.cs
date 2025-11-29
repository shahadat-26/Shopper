using System;

namespace ShopperBackend.Models
{
    public class Payment
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public string TransactionId { get; set; }
        public string PaymentMethod { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public string Status { get; set; }
        public string GatewayResponse { get; set; }
        public DateTime? PaidAt { get; set; }
        public string FailureReason { get; set; }
        public decimal? RefundAmount { get; set; }
        public DateTime? RefundedAt { get; set; }
        public string RefundReason { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public Order Order { get; set; }
    }
}