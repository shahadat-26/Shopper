using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dapper;
using ShopperBackend.Data;
using ShopperBackend.Models;

namespace ShopperBackend.Repositories
{
    public interface IAddressRepository : IRepository<Address>
    {
        Task<IEnumerable<Address>> GetUserAddressesAsync(int userId);
        Task<Address> GetDefaultAddressAsync(int userId);
        Task<bool> SetDefaultAddressAsync(int userId, int addressId);
    }

    public class AddressRepository : IAddressRepository
    {
        private readonly IDatabaseConnection _db;

        public AddressRepository(IDatabaseConnection db)
        {
            _db = db;
        }

        public async Task<Address> GetByIdAsync(int id)
        {
            using var connection = _db.CreateConnection();
            var query = "SELECT * FROM Addresses WHERE Id = @Id";
            return await connection.QueryFirstOrDefaultAsync<Address>(query, new { Id = id });
        }

        public async Task<IEnumerable<Address>> GetAllAsync()
        {
            using var connection = _db.CreateConnection();
            var query = "SELECT * FROM Addresses ORDER BY CreatedAt DESC";
            return await connection.QueryAsync<Address>(query);
        }

        public async Task<int> CreateAsync(Address entity)
        {
            using var connection = _db.CreateConnection();
            var query = @"INSERT INTO Addresses (UserId, AddressLine1, AddressLine2, City, State, Country,
                         PostalCode, IsDefault, AddressType, CreatedAt, UpdatedAt)
                         VALUES (@UserId, @AddressLine1, @AddressLine2, @City, @State, @Country,
                         @PostalCode, @IsDefault, @AddressType, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                         RETURNING Id";
            return await connection.ExecuteScalarAsync<int>(query, entity);
        }

        public async Task<bool> UpdateAsync(Address entity)
        {
            using var connection = _db.CreateConnection();
            var query = @"UPDATE Addresses SET AddressLine1 = @AddressLine1, AddressLine2 = @AddressLine2,
                         City = @City, State = @State, Country = @Country, PostalCode = @PostalCode,
                         IsDefault = @IsDefault, AddressType = @AddressType, UpdatedAt = CURRENT_TIMESTAMP
                         WHERE Id = @Id";
            var result = await connection.ExecuteAsync(query, entity);
            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var connection = _db.CreateConnection();
            var query = "DELETE FROM Addresses WHERE Id = @Id";
            var result = await connection.ExecuteAsync(query, new { Id = id });
            return result > 0;
        }

        public async Task<IEnumerable<Address>> GetUserAddressesAsync(int userId)
        {
            using var connection = _db.CreateConnection();
            var query = "SELECT * FROM Addresses WHERE UserId = @UserId ORDER BY IsDefault DESC, CreatedAt DESC";
            return await connection.QueryAsync<Address>(query, new { UserId = userId });
        }

        public async Task<Address> GetDefaultAddressAsync(int userId)
        {
            using var connection = _db.CreateConnection();
            var query = "SELECT * FROM Addresses WHERE UserId = @UserId AND IsDefault = true LIMIT 1";
            return await connection.QueryFirstOrDefaultAsync<Address>(query, new { UserId = userId });
        }

        public async Task<bool> SetDefaultAddressAsync(int userId, int addressId)
        {
            using var connection = _db.CreateConnection();

            await connection.ExecuteAsync(
                "UPDATE Addresses SET IsDefault = false WHERE UserId = @UserId",
                new { UserId = userId });

            var result = await connection.ExecuteAsync(
                "UPDATE Addresses SET IsDefault = true WHERE Id = @AddressId AND UserId = @UserId",
                new { AddressId = addressId, UserId = userId });

            return result > 0;
        }
    }
}