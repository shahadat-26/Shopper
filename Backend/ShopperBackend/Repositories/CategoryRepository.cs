using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ShopperBackend.Data;
using ShopperBackend.Models;

namespace ShopperBackend.Repositories
{
    public interface ICategoryRepository : IRepository<Category>
    {
        Task<Category> GetBySlugAsync(string slug);
        Task<IEnumerable<Category>> GetActiveCategories();
        Task<IEnumerable<Category>> GetSubCategoriesAsync(int parentId);
    }

    public class CategoryRepository : ICategoryRepository
    {
        private readonly ShopperDbContext _context;

        public CategoryRepository(ShopperDbContext context)
        {
            _context = context;
        }

        public async Task<Category> GetByIdAsync(int id)
        {
            return await _context.Categories.FindAsync(id);
        }

        public async Task<IEnumerable<Category>> GetAllAsync()
        {
            return await _context.Categories
                .OrderBy(c => c.DisplayOrder)
                .ThenBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<int> CreateAsync(Category entity)
        {
            entity.CreatedAt = DateTime.UtcNow;
            entity.UpdatedAt = DateTime.UtcNow;

            _context.Categories.Add(entity);

            await _context.SaveChangesAsync();

            return entity.Id;
        }

        public async Task<bool> UpdateAsync(Category entity)
        {
            entity.UpdatedAt = DateTime.UtcNow;

            _context.Categories.Update(entity);

            var result = await _context.SaveChangesAsync();

            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
                return false;

            category.IsActive = false;

            var result = await _context.SaveChangesAsync();

            return result > 0;
        }

        public async Task<Category> GetBySlugAsync(string slug)
        {
            return await _context.Categories
                .Where(c => c.Slug == slug && c.IsActive)
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<Category>> GetActiveCategories()
        {
            return await _context.Categories
                .Where(c => c.IsActive)
                .OrderBy(c => c.DisplayOrder)
                .ThenBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<Category>> GetSubCategoriesAsync(int parentId)
        {
            return await _context.Categories
                .Where(c => c.ParentCategoryId == parentId && c.IsActive)
                .OrderBy(c => c.DisplayOrder)
                .ThenBy(c => c.Name)
                .ToListAsync();
        }
    }
}
