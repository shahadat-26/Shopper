using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
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
        private readonly IDatabaseConnection _db;

        public WishlistRepository(IDatabaseConnection db)
        {
            _db = db;
        }

        public async Task<IEnumerable<Wishlist>> GetUserWishlistAsync(int userId)
        {
            using var connection = _db.CreateConnection();
            var query = @"SELECT w.*, p.* FROM Wishlists w
                         INNER JOIN Products p ON w.ProductId = p.Id
                         WHERE w.UserId = @UserId
                         ORDER BY w.CreatedAt DESC";

            var wishlists = await connection.QueryAsync<Wishlist, Product, Wishlist>(
                query,
                (wishlist, product) =>
                {
                    wishlist.Product = product;
                    return wishlist;
                },
                new { UserId = userId },
                splitOn: "Id"
            );

            return wishlists;
        }

        public async Task<bool> AddToWishlistAsync(int userId, int productId)
        {
            using var connection = _db.CreateConnection();

            var checkQuery = "SELECT COUNT(*) FROM Wishlists WHERE UserId = @UserId AND ProductId = @ProductId";
            var exists = await connection.ExecuteScalarAsync<int>(checkQuery, new { UserId = userId, ProductId = productId });

            if (exists > 0) return false;

            var query = "INSERT INTO Wishlists (UserId, ProductId, CreatedAt) VALUES (@UserId, @ProductId, CURRENT_TIMESTAMP)";
            var result = await connection.ExecuteAsync(query, new { UserId = userId, ProductId = productId });
            return result > 0;
        }

        public async Task<bool> RemoveFromWishlistAsync(int userId, int productId)
        {
            using var connection = _db.CreateConnection();
            var query = "DELETE FROM Wishlists WHERE UserId = @UserId AND ProductId = @ProductId";
            var result = await connection.ExecuteAsync(query, new { UserId = userId, ProductId = productId });
            return result > 0;
        }

        public async Task<bool> IsInWishlistAsync(int userId, int productId)
        {
            using var connection = _db.CreateConnection();
            var query = "SELECT COUNT(*) FROM Wishlists WHERE UserId = @UserId AND ProductId = @ProductId";
            var count = await connection.ExecuteScalarAsync<int>(query, new { UserId = userId, ProductId = productId });
            return count > 0;
        }

        public async Task<bool> ClearWishlistAsync(int userId)
        {
            using var connection = _db.CreateConnection();
            var query = "DELETE FROM Wishlists WHERE UserId = @UserId";
            var result = await connection.ExecuteAsync(query, new { UserId = userId });
            return result > 0;
        }
    }
}