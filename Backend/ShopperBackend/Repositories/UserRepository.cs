using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ShopperBackend.Data;
using ShopperBackend.Models;

namespace ShopperBackend.Repositories
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User> GetByEmailAsync(string email);
        Task<User> GetByRefreshTokenAsync(string refreshToken);
        Task<bool> UpdateRefreshTokenAsync(int userId, string refreshToken, DateTime expiry);
        Task<bool> UpdatePasswordAsync(int userId, string passwordHash);
        Task<bool> VerifyEmailAsync(int userId);
        Task<IEnumerable<User>> GetUsersByRoleAsync(string role);
    }

    public class UserRepository : IUserRepository
    {
        private readonly ShopperDbContext _context;

        public UserRepository(ShopperDbContext context)
        {
            _context = context;
        }

        public async Task<User> GetByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _context.Users
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();
        }

        public async Task<int> CreateAsync(User entity)
        {
            entity.CreatedAt = DateTime.UtcNow;
            entity.UpdatedAt = DateTime.UtcNow;

            _context.Users.Add(entity);

            await _context.SaveChangesAsync();

            return entity.Id;
        }

        public async Task<bool> UpdateAsync(User entity)
        {
            entity.UpdatedAt = DateTime.UtcNow;

            _context.Users.Update(entity);

            var result = await _context.SaveChangesAsync();

            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return false;

            _context.Users.Remove(user);

            var result = await _context.SaveChangesAsync();

            return result > 0;
        }

        public async Task<User> GetByEmailAsync(string email)
        {
            return await _context.Users
                .Where(u => u.Email == email)
                .FirstOrDefaultAsync();
        }

        public async Task<User> GetByRefreshTokenAsync(string refreshToken)
        {
            var now = DateTime.UtcNow;

            return await _context.Users
                .Where(u => u.RefreshToken == refreshToken && u.RefreshTokenExpiry > now)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> UpdateRefreshTokenAsync(int userId, string refreshToken, DateTime expiry)
        {
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return false;

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = expiry;

            var result = await _context.SaveChangesAsync();

            return result > 0;
        }

        public async Task<bool> UpdatePasswordAsync(int userId, string passwordHash)
        {
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return false;

            user.PasswordHash = passwordHash;
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;

            var result = await _context.SaveChangesAsync();

            return result > 0;
        }

        public async Task<bool> VerifyEmailAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return false;

            user.IsEmailVerified = true;
            user.EmailVerificationToken = null;

            var result = await _context.SaveChangesAsync();

            return result > 0;
        }

        public async Task<IEnumerable<User>> GetUsersByRoleAsync(string role)
        {
            return await _context.Users
                .Where(u => u.Role == role)
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();
        }
    }
}
