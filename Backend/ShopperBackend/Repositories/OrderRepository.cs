using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
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
        private readonly ShopperDbContext _context;

        public OrderRepository(ShopperDbContext context)
        {
            _context = context;
        }

        public async Task<Order> GetByIdAsync(int id)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.ShippingAddress)
                .Include(o => o.BillingAddress)
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<IEnumerable<Order>> GetAllAsync()
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.ShippingAddress)
                .Include(o => o.BillingAddress)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        public async Task<int> CreateAsync(Order entity)
        {
            entity.CreatedAt = DateTime.UtcNow;
            entity.UpdatedAt = DateTime.UtcNow;

            _context.Orders.Add(entity);

            await _context.SaveChangesAsync();

            return entity.Id;
        }

        public async Task<bool> UpdateAsync(Order entity)
        {
            entity.UpdatedAt = DateTime.UtcNow;

            _context.Orders.Update(entity);

            var result = await _context.SaveChangesAsync();

            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var order = await _context.Orders.FindAsync(id);

            if (order == null)
                return false;

            _context.Orders.Remove(order);

            var result = await _context.SaveChangesAsync();

            return result > 0;
        }

        public async Task<Order> GetByOrderNumberAsync(string orderNumber)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.ShippingAddress)
                .Include(o => o.BillingAddress)
                .Where(o => o.OrderNumber == orderNumber)
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<Order>> GetUserOrdersAsync(int userId)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Include(o => o.ShippingAddress)
                .Include(o => o.BillingAddress)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Order>> GetVendorOrdersAsync(int vendorId)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems.Where(oi => oi.VendorId == vendorId))
                    .ThenInclude(oi => oi.Product)
                .Include(o => o.ShippingAddress)
                .Include(o => o.BillingAddress)
                .Where(o => o.OrderItems.Any(oi => oi.VendorId == vendorId))
                .OrderByDescending(o => o.CreatedAt)
                .Distinct()
                .ToListAsync();
        }

        public async Task<IEnumerable<OrderItem>> GetOrderItemsAsync(int orderId)
        {
            var items = await _context.OrderItems
                .Include(oi => oi.Product)
                .Where(oi => oi.OrderId == orderId)
                .ToListAsync();

            foreach (var item in items)
            {
                if (item.Price == 0 && item.Product != null)
                {
                    item.Price = item.Product.Price;
                }

                if (!item.Subtotal.HasValue || item.Subtotal == 0)
                {
                    item.Subtotal = item.Price * item.Quantity;
                }
            }

            return items;
        }

        public async Task<int> CreateOrderItemAsync(OrderItem item)
        {
            item.CreatedAt = DateTime.UtcNow;
            item.UpdatedAt = DateTime.UtcNow;

            _context.OrderItems.Add(item);

            await _context.SaveChangesAsync();

            return item.Id;
        }

        public async Task<bool> UpdateOrderStatusAsync(int orderId, string status)
        {
            var order = await _context.Orders.FindAsync(orderId);

            if (order == null)
                return false;

            order.Status = status;
            order.UpdatedAt = DateTime.UtcNow;

            var result = await _context.SaveChangesAsync();

            return result > 0;
        }

        public async Task<bool> UpdatePaymentStatusAsync(int orderId, string status)
        {
            var order = await _context.Orders.FindAsync(orderId);

            if (order == null)
                return false;

            order.PaymentStatus = status;
            order.UpdatedAt = DateTime.UtcNow;

            var result = await _context.SaveChangesAsync();

            return result > 0;
        }
    }
}
