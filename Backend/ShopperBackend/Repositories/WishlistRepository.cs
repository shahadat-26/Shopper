using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ShopperBackend.Data;
using ShopperBackend.Models;

namespace ShopperBackend.Repositories
{
    public interface IWishlistRepository
    {
        Task<IEnumerable<Wishlist>> GetUserWishlistAsync(int userId);
        Task<bool> AddToWishlistAsync(int userId, int productId);
        Task<bool> RemoveFromWishlistAsync(int userId, int productId);
        Task<bool> IsInWishlistAsync(int userId, int productId);
        Task<bool> ClearWishlistAsync(int userId);
    }

    public class WishlistRepository : IWishlistRepository
    {
        private readonly ShopperDbContext _context;

        public WishlistRepository(ShopperDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Wishlist>> GetUserWishlistAsync(int userId)
        {
            return await _context.Wishlists
                .Include(w => w.Product)
                .Where(w => w.UserId == userId)
                .OrderByDescending(w => w.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> AddToWishlistAsync(int userId, int productId)
        {
            var exists = await _context.Wishlists
                .AnyAsync(w => w.UserId == userId && w.ProductId == productId);

            if (exists)
                return false;

            var wishlistItem = new Wishlist
            {
                UserId = userId,
                ProductId = productId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Wishlists.Add(wishlistItem);

            var result = await _context.SaveChangesAsync();

            return result > 0;
        }

        public async Task<bool> RemoveFromWishlistAsync(int userId, int productId)
        {
            var wishlistItem = await _context.Wishlists
                .Where(w => w.UserId == userId && w.ProductId == productId)
                .FirstOrDefaultAsync();

            if (wishlistItem == null)
                return false;

            _context.Wishlists.Remove(wishlistItem);

            var result = await _context.SaveChangesAsync();

            return result > 0;
        }

        public async Task<bool> IsInWishlistAsync(int userId, int productId)
        {
            return await _context.Wishlists
                .AnyAsync(w => w.UserId == userId && w.ProductId == productId);
        }

        public async Task<bool> ClearWishlistAsync(int userId)
        {
            var wishlistItems = await _context.Wishlists
                .Where(w => w.UserId == userId)
                .ToListAsync();

            if (!wishlistItems.Any())
                return true;

            _context.Wishlists.RemoveRange(wishlistItems);

            var result = await _context.SaveChangesAsync();

            return result > 0;
        }
    }
}
