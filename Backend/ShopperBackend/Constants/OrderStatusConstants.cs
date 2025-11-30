namespace ShopperBackend.Constants
{
    public static class OrderStatus
    {
        public const string Pending = "Pending";
        public const string Confirmed = "Confirmed";
        public const string Processing = "Processing";
        public const string Shipped = "Shipped";
        public const string Delivered = "Delivered";
        public const string Cancelled = "Cancelled";
        public const string Refunded = "Refunded";

        // Allowed transitions - defines what statuses can transition to what
        public static readonly Dictionary<string, string[]> AllowedTransitions = new()
        {
            [Pending] = new[] { Confirmed, Cancelled },
            [Confirmed] = new[] { Processing, Cancelled },
            [Processing] = new[] { Shipped, Cancelled },
            [Shipped] = new[] { Delivered },
            [Delivered] = new[] { Refunded },
            [Cancelled] = Array.Empty<string>(),  // Terminal state
            [Refunded] = Array.Empty<string>()    // Terminal state
        };

        public static bool CanTransitionTo(string fromStatus, string toStatus)
        {
            if (string.IsNullOrEmpty(fromStatus) || string.IsNullOrEmpty(toStatus))
                return false;

            if (!AllowedTransitions.TryGetValue(fromStatus, out var allowedStatuses))
                return false;

            return allowedStatuses.Contains(toStatus);
        }

        public static bool IsCancellable(string status)
        {
            return status == Pending || status == Confirmed || status == Processing;
        }

        public static bool IsTerminalState(string status)
        {
            return status == Delivered || status == Cancelled || status == Refunded;
        }
    }

    public static class PaymentStatus
    {
        public const string Pending = "Pending";
        public const string Paid = "Paid";
        public const string Failed = "Failed";
        public const string Refunded = "Refunded";
    }

    public static class PaymentMethod
    {
        public const string CashOnDelivery = "CashOnDelivery";
        public const string CreditCard = "CreditCard";
        public const string DebitCard = "DebitCard";
        public const string UPI = "UPI";
        public const string NetBanking = "NetBanking";
    }
}