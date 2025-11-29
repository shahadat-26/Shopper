using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
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
        private readonly ShopperDbContext _context;

        public AddressRepository(ShopperDbContext context)
        {
            _context = context;
        }

        public async Task<Address> GetByIdAsync(int id)
        {
            return await _context.Addresses.FindAsync(id);
        }

        public async Task<IEnumerable<Address>> GetAllAsync()
        {
            return await _context.Addresses
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        public async Task<int> CreateAsync(Address entity)
        {
            entity.CreatedAt = DateTime.UtcNow;
            entity.UpdatedAt = DateTime.UtcNow;

            _context.Addresses.Add(entity);

            await _context.SaveChangesAsync();

            return entity.Id;
        }

        public async Task<bool> UpdateAsync(Address entity)
        {
            entity.UpdatedAt = DateTime.UtcNow;

            _context.Addresses.Update(entity);

            var result = await _context.SaveChangesAsync();

            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var address = await _context.Addresses.FindAsync(id);

            if (address == null)
                return false;

            _context.Addresses.Remove(address);

            var result = await _context.SaveChangesAsync();

            return result > 0;
        }

        public async Task<IEnumerable<Address>> GetUserAddressesAsync(int userId)
        {
            return await _context.Addresses
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.IsDefault)
                .ThenByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        public async Task<Address> GetDefaultAddressAsync(int userId)
        {
            return await _context.Addresses
                .Where(a => a.UserId == userId && a.IsDefault)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> SetDefaultAddressAsync(int userId, int addressId)
        {
            var userAddresses = await _context.Addresses
                .Where(a => a.UserId == userId)
                .ToListAsync();

            foreach (var address in userAddresses)
            {
                address.IsDefault = false;
            }

            var targetAddress = await _context.Addresses
                .Where(a => a.Id == addressId && a.UserId == userId)
                .FirstOrDefaultAsync();

            if (targetAddress == null)
                return false;

            targetAddress.IsDefault = true;

            var result = await _context.SaveChangesAsync();

            return result > 0;
        }
    }
}
