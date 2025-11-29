using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
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
        private readonly IDatabaseConnection _db;

        public UserRepository(IDatabaseConnection db)
        {
            _db = db;
        }

        public async Task<User> GetByIdAsync(int id)
        {
            using var connection = _db.CreateConnection();
            var query = "SELECT * FROM Users WHERE Id = @Id";
            return await connection.QueryFirstOrDefaultAsync<User>(query, new { Id = id });
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            using var connection = _db.CreateConnection();
            var query = "SELECT * FROM Users ORDER BY CreatedAt DESC";
            return await connection.QueryAsync<User>(query);
        }

        public async Task<int> CreateAsync(User entity)
        {
            using var connection = _db.CreateConnection();
            var query = @"INSERT INTO Users (Email, PasswordHash, FirstName, LastName, PhoneNumber, Role, IsEmailVerified, EmailVerificationToken, IsActive, CreatedAt, UpdatedAt)
                         VALUES (@Email, @PasswordHash, @FirstName, @LastName, @PhoneNumber, @Role::user_role, @IsEmailVerified, @EmailVerificationToken, @IsActive, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                         RETURNING Id";
            return await connection.ExecuteScalarAsync<int>(query, entity);
        }

        public async Task<bool> UpdateAsync(User entity)
        {
            using var connection = _db.CreateConnection();
            var query = @"UPDATE Users SET Email = @Email, FirstName = @FirstName, LastName = @LastName,
                         PhoneNumber = @PhoneNumber, Role = @Role::user_role, IsActive = @IsActive, UpdatedAt = CURRENT_TIMESTAMP
                         WHERE Id = @Id";
            var result = await connection.ExecuteAsync(query, entity);
            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var connection = _db.CreateConnection();
            var query = "DELETE FROM Users WHERE Id = @Id";
            var result = await connection.ExecuteAsync(query, new { Id = id });
            return result > 0;
        }

        public async Task<User> GetByEmailAsync(string email)
        {
            using var connection = _db.CreateConnection();
            var query = "SELECT * FROM Users WHERE Email = @Email";
            return await connection.QueryFirstOrDefaultAsync<User>(query, new { Email = email });
        }

        public async Task<User> GetByRefreshTokenAsync(string refreshToken)
        {
            using var connection = _db.CreateConnection();
            var query = "SELECT * FROM Users WHERE RefreshToken = @RefreshToken AND RefreshTokenExpiry > CURRENT_TIMESTAMP";
            return await connection.QueryFirstOrDefaultAsync<User>(query, new { RefreshToken = refreshToken });
        }

        public async Task<bool> UpdateRefreshTokenAsync(int userId, string refreshToken, DateTime expiry)
        {
            using var connection = _db.CreateConnection();
            var query = "UPDATE Users SET RefreshToken = @RefreshToken, RefreshTokenExpiry = @Expiry WHERE Id = @UserId";
            var result = await connection.ExecuteAsync(query, new { UserId = userId, RefreshToken = refreshToken, Expiry = expiry });
            return result > 0;
        }

        public async Task<bool> UpdatePasswordAsync(int userId, string passwordHash)
        {
            using var connection = _db.CreateConnection();
            var query = "UPDATE Users SET PasswordHash = @PasswordHash, PasswordResetToken = NULL, PasswordResetTokenExpiry = NULL WHERE Id = @UserId";
            var result = await connection.ExecuteAsync(query, new { UserId = userId, PasswordHash = passwordHash });
            return result > 0;
        }

        public async Task<bool> VerifyEmailAsync(int userId)
        {
            using var connection = _db.CreateConnection();
            var query = "UPDATE Users SET IsEmailVerified = true, EmailVerificationToken = NULL WHERE Id = @UserId";
            var result = await connection.ExecuteAsync(query, new { UserId = userId });
            return result > 0;
        }

        public async Task<IEnumerable<User>> GetUsersByRoleAsync(string role)
        {
            using var connection = _db.CreateConnection();
            var query = "SELECT * FROM Users WHERE Role = @Role::user_role ORDER BY CreatedAt DESC";
            return await connection.QueryAsync<User>(query, new { Role = role });
        }
    }
}