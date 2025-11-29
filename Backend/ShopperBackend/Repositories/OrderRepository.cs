using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using ShopperBackend.Data;
using ShopperBackend.Models;

namespace ShopperBackend.Repositories
{
    public interface IOrderRepository : IRepository<Order>
    {
        Task<Order> GetByOrderNumberAsync(string orderNumber);
        Task<IEnumerable<Order>> GetUserOrdersAsync(int userId);
        Task<IEnumerable<Order>> GetVendorOrdersAsync(int vendorId);
        Task<IEnumerable<OrderItem>> GetOrderItemsAsync(int orderId);
        Task<int> CreateOrderItemAsync(OrderItem item);
        Task<bool> UpdateOrderStatusAsync(int orderId, string status);
        Task<bool> UpdatePaymentStatusAsync(int orderId, string status);
    }

    public class OrderRepository : IOrderRepository
    {
        private readonly IDatabaseConnection _db;

        public OrderRepository(IDatabaseConnection db)
        {
            _db = db;
        }

        public async Task<Order> GetByIdAsync(int id)
        {
            using var connection = _db.CreateConnection();
            var query = @"SELECT o.*, u.*, sa.*, ba.* FROM Orders o
                         LEFT JOIN Users u ON o.UserId = u.Id
                         LEFT JOIN Addresses sa ON o.ShippingAddressId = sa.Id
                         LEFT JOIN Addresses ba ON o.BillingAddressId = ba.Id
                         WHERE o.Id = @Id";

            var orders = await connection.QueryAsync<Order, User, Address, Address, Order>(
                query,
                (order, user, shipping, billing) =>
                {
                    order.User = user;
                    order.ShippingAddress = shipping;
                    order.BillingAddress = billing;
                    return order;
                },
                new { Id = id },
                splitOn: "Id,Id,Id"
            );

            return orders.FirstOrDefault();
        }

        public async Task<IEnumerable<Order>> GetAllAsync()
        {
            using var connection = _db.CreateConnection();
            var query = "SELECT * FROM Orders ORDER BY CreatedAt DESC";
            return await connection.QueryAsync<Order>(query);
        }

        public async Task<int> CreateAsync(Order entity)
        {
            using var connection = _db.CreateConnection();
            var query = @"INSERT INTO Orders (UserId, OrderNumber, Status, SubTotal, TaxAmount, ShippingAmount,
                         DiscountAmount, TotalAmount, CouponId, PaymentMethod, PaymentStatus, Notes,
                         ShippingAddressId, BillingAddressId, CreatedAt, UpdatedAt)
                         VALUES (@UserId, @OrderNumber, @Status::order_status, @SubTotal, @TaxAmount, @ShippingAmount,
                         @DiscountAmount, @TotalAmount, @CouponId, @PaymentMethod::payment_method, @PaymentStatus::payment_status, @Notes,
                         @ShippingAddressId, @BillingAddressId, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                         RETURNING Id";
            return await connection.ExecuteScalarAsync<int>(query, entity);
        }

        public async Task<bool> UpdateAsync(Order entity)
        {
            using var connection = _db.CreateConnection();
            var query = @"UPDATE Orders SET Status = @Status::order_status, PaymentStatus = @PaymentStatus::payment_status,
                         TrackingNumber = @TrackingNumber, EstimatedDelivery = @EstimatedDelivery,
                         UpdatedAt = CURRENT_TIMESTAMP WHERE Id = @Id";
            var result = await connection.ExecuteAsync(query, entity);
            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var connection = _db.CreateConnection();
            var query = "DELETE FROM Orders WHERE Id = @Id";
            var result = await connection.ExecuteAsync(query, new { Id = id });
            return result > 0;
        }

        public async Task<Order> GetByOrderNumberAsync(string orderNumber)
        {
            using var connection = _db.CreateConnection();
            var query = @"SELECT o.*, u.*, sa.*, ba.* FROM Orders o
                         LEFT JOIN Users u ON o.UserId = u.Id
                         LEFT JOIN Addresses sa ON o.ShippingAddressId = sa.Id
                         LEFT JOIN Addresses ba ON o.BillingAddressId = ba.Id
                         WHERE o.OrderNumber = @OrderNumber";

            var orders = await connection.QueryAsync<Order, User, Address, Address, Order>(
                query,
                (order, user, shipping, billing) =>
                {
                    order.User = user;
                    order.ShippingAddress = shipping;
                    order.BillingAddress = billing;
                    return order;
                },
                new { OrderNumber = orderNumber },
                splitOn: "Id,Id,Id"
            );

            return orders.FirstOrDefault();
        }

        public async Task<IEnumerable<Order>> GetUserOrdersAsync(int userId)
        {
            using var connection = _db.CreateConnection();
            var query = "SELECT * FROM Orders WHERE UserId = @UserId ORDER BY CreatedAt DESC";
            return await connection.QueryAsync<Order>(query, new { UserId = userId });
        }

        public async Task<IEnumerable<Order>> GetVendorOrdersAsync(int vendorId)
        {
            using var connection = _db.CreateConnection();
            var query = @"SELECT DISTINCT o.* FROM Orders o
                         INNER JOIN OrderItems oi ON o.Id = oi.OrderId
                         WHERE oi.VendorId = @VendorId
                         ORDER BY o.CreatedAt DESC";

            var orders = await connection.QueryAsync<Order>(query, new { VendorId = vendorId });

            foreach (var order in orders)
            {
                order.OrderItems = (await GetOrderItemsAsync(order.Id)).ToList();
            }

            return orders;
        }

        public async Task<IEnumerable<OrderItem>> GetOrderItemsAsync(int orderId)
        {
            using var connection = _db.CreateConnection();
            var query = @"SELECT oi.*, p.* FROM OrderItems oi
                         LEFT JOIN Products p ON oi.ProductId = p.Id
                         WHERE oi.OrderId = @OrderId";

            return await connection.QueryAsync<OrderItem, Product, OrderItem>(
                query,
                (item, product) =>
                {
                    item.Product = product;
                    return item;
                },
                new { OrderId = orderId },
                splitOn: "Id"
            );
        }

        public async Task<int> CreateOrderItemAsync(OrderItem item)
        {
            using var connection = _db.CreateConnection();
            var query = @"INSERT INTO OrderItems (OrderId, ProductId, VariationId, VendorId, ProductName,
                         ProductSKU, Quantity, Price, Discount, Tax, Total, Status, CreatedAt, UpdatedAt)
                         VALUES (@OrderId, @ProductId, @VariationId, @VendorId, @ProductName,
                         @ProductSKU, @Quantity, @Price, @Discount, @Tax, @Total, @Status::order_status,
                         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                         RETURNING Id";
            return await connection.ExecuteScalarAsync<int>(query, item);
        }

        public async Task<bool> UpdateOrderStatusAsync(int orderId, string status)
        {
            using var connection = _db.CreateConnection();
            var query = "UPDATE Orders SET Status = @Status::order_status, UpdatedAt = CURRENT_TIMESTAMP WHERE Id = @OrderId";
            var result = await connection.ExecuteAsync(query, new { OrderId = orderId, Status = status });
            return result > 0;
        }

        public async Task<bool> UpdatePaymentStatusAsync(int orderId, string status)
        {
            using var connection = _db.CreateConnection();
            var query = "UPDATE Orders SET PaymentStatus = @Status::payment_status, UpdatedAt = CURRENT_TIMESTAMP WHERE Id = @OrderId";
            var result = await connection.ExecuteAsync(query, new { OrderId = orderId, Status = status });
            return result > 0;
        }
    }
}