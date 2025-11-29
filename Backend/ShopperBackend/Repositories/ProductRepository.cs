using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ShopperBackend.Data;
using ShopperBackend.DTOs;
using ShopperBackend.Models;

namespace ShopperBackend.Repositories
{
    public interface IProductRepository : IRepository<Product>
    {
        Task<Product> GetBySlugAsync(string slug);
        Task<IEnumerable<Product>> GetByVendorIdAsync(int vendorId);
        Task<IEnumerable<Product>> GetByCategoryIdAsync(int categoryId);
        Task<IEnumerable<Product>> GetFeaturedProductsAsync(int limit = 10);
        Task<IEnumerable<Product>> SearchProductsAsync(ProductSearchDto searchDto);
        Task<int> GetTotalCountAsync(ProductSearchDto searchDto);
        Task<bool> UpdateQuantityAsync(int productId, int quantity);
        Task<bool> IncrementViewCountAsync(int productId);
    }

    public class ProductRepository : IProductRepository
    {
        private readonly ShopperDbContext _context;

        public ProductRepository(ShopperDbContext context)
        {
            _context = context;
        }

        public async Task<Product> GetByIdAsync(int id)
        {
            return await _context.Products
                .Include(p => p.Vendor)
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<IEnumerable<Product>> GetAllAsync()
        {
            return await _context.Products
                .Where(p => p.IsActive)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<int> CreateAsync(Product entity)
        {
            entity.CreatedAt = DateTime.UtcNow;
            entity.UpdatedAt = DateTime.UtcNow;

            _context.Products.Add(entity);

            await _context.SaveChangesAsync();

            return entity.Id;
        }

        public async Task<bool> UpdateAsync(Product entity)
        {
            entity.UpdatedAt = DateTime.UtcNow;

            _context.Products.Update(entity);

            var result = await _context.SaveChangesAsync();

            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
                return false;

            _context.Products.Remove(product);

            var result = await _context.SaveChangesAsync();

            return result > 0;
        }

        public async Task<Product> GetBySlugAsync(string slug)
        {
            return await _context.Products
                .Include(p => p.Vendor)
                .Include(p => p.Category)
                .Where(p => p.Slug == slug && p.IsActive)
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<Product>> GetByVendorIdAsync(int vendorId)
        {
            return await _context.Products
                .Where(p => p.VendorId == vendorId && p.IsActive)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetByCategoryIdAsync(int categoryId)
        {
            return await _context.Products
                .Where(p => p.CategoryId == categoryId && p.IsActive)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetFeaturedProductsAsync(int limit = 10)
        {
            return await _context.Products
                .Where(p => p.IsFeatured && p.IsActive)
                .OrderByDescending(p => p.CreatedAt)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> SearchProductsAsync(ProductSearchDto searchDto)
        {
            var query = _context.Products.Where(p => p.IsActive);

            if (!string.IsNullOrEmpty(searchDto.Keyword))
            {
                var keyword = searchDto.Keyword.ToLower();
                query = query.Where(p =>
                    p.Name.ToLower().Contains(keyword) ||
                    p.Description.ToLower().Contains(keyword));
            }

            if (searchDto.CategoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == searchDto.CategoryId.Value);
            }

            if (searchDto.MinPrice.HasValue)
            {
                query = query.Where(p => p.Price >= searchDto.MinPrice.Value);
            }

            if (searchDto.MaxPrice.HasValue)
            {
                query = query.Where(p => p.Price <= searchDto.MaxPrice.Value);
            }

            if (searchDto.VendorId.HasValue)
            {
                query = query.Where(p => p.VendorId == searchDto.VendorId.Value);
            }

            if (searchDto.IsFeatured.HasValue)
            {
                query = query.Where(p => p.IsFeatured == searchDto.IsFeatured.Value);
            }

            query = searchDto.SortBy switch
            {
                "price_asc" => query.OrderBy(p => p.Price),
                "price_desc" => query.OrderByDescending(p => p.Price),
                "name" => query.OrderBy(p => p.Name),
                "newest" => query.OrderByDescending(p => p.CreatedAt),
                "rating" => query.OrderByDescending(p => p.Rating),
                _ => query.OrderByDescending(p => p.CreatedAt)
            };

            var results = await query
                .Skip((searchDto.Page - 1) * searchDto.PageSize)
                .Take(searchDto.PageSize)
                .ToListAsync();

            return results;
        }

        public async Task<int> GetTotalCountAsync(ProductSearchDto searchDto)
        {
            var query = _context.Products.Where(p => p.IsActive);

            if (!string.IsNullOrEmpty(searchDto.Keyword))
            {
                var keyword = searchDto.Keyword.ToLower();
                query = query.Where(p =>
                    p.Name.ToLower().Contains(keyword) ||
                    p.Description.ToLower().Contains(keyword));
            }

            if (searchDto.CategoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == searchDto.CategoryId.Value);
            }

            if (searchDto.MinPrice.HasValue)
            {
                query = query.Where(p => p.Price >= searchDto.MinPrice.Value);
            }

            if (searchDto.MaxPrice.HasValue)
            {
                query = query.Where(p => p.Price <= searchDto.MaxPrice.Value);
            }

            if (searchDto.VendorId.HasValue)
            {
                query = query.Where(p => p.VendorId == searchDto.VendorId.Value);
            }

            if (searchDto.IsFeatured.HasValue)
            {
                query = query.Where(p => p.IsFeatured == searchDto.IsFeatured.Value);
            }

            return await query.CountAsync();
        }

        public async Task<bool> UpdateQuantityAsync(int productId, int quantity)
        {
            var product = await _context.Products.FindAsync(productId);

            if (product == null)
                return false;

            product.Quantity = quantity;

            var result = await _context.SaveChangesAsync();

            return result > 0;
        }

        public async Task<bool> IncrementViewCountAsync(int productId)
        {
            var product = await _context.Products.FindAsync(productId);

            if (product == null)
                return false;

            product.ViewCount = product.ViewCount + 1;

            var result = await _context.SaveChangesAsync();

            return result > 0;
        }
    }
}
