using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dapper;
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
        private readonly IDatabaseConnection _db;

        public CategoryRepository(IDatabaseConnection db)
        {
            _db = db;
        }

        public async Task<Category> GetByIdAsync(int id)
        {
            using var connection = _db.CreateConnection();
            var query = "SELECT * FROM Categories WHERE Id = @Id";
            return await connection.QueryFirstOrDefaultAsync<Category>(query, new { Id = id });
        }

        public async Task<IEnumerable<Category>> GetAllAsync()
        {
            using var connection = _db.CreateConnection();
            var query = "SELECT * FROM Categories ORDER BY DisplayOrder, Name";
            return await connection.QueryAsync<Category>(query);
        }

        public async Task<int> CreateAsync(Category entity)
        {
            using var connection = _db.CreateConnection();
            var query = @"INSERT INTO Categories (Name, Slug, Description, ImageUrl, ParentCategoryId, DisplayOrder, IsActive, CreatedAt, UpdatedAt)
                         VALUES (@Name, @Slug, @Description, @ImageUrl, @ParentCategoryId, @DisplayOrder, @IsActive, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                         RETURNING Id";
            return await connection.ExecuteScalarAsync<int>(query, entity);
        }

        public async Task<bool> UpdateAsync(Category entity)
        {
            using var connection = _db.CreateConnection();
            var query = @"UPDATE Categories SET Name = @Name, Slug = @Slug, Description = @Description,
                         ImageUrl = @ImageUrl, ParentCategoryId = @ParentCategoryId, DisplayOrder = @DisplayOrder,
                         IsActive = @IsActive, UpdatedAt = CURRENT_TIMESTAMP WHERE Id = @Id";
            var result = await connection.ExecuteAsync(query, entity);
            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var connection = _db.CreateConnection();
            var query = "UPDATE Categories SET IsActive = false WHERE Id = @Id";
            var result = await connection.ExecuteAsync(query, new { Id = id });
            return result > 0;
        }

        public async Task<Category> GetBySlugAsync(string slug)
        {
            using var connection = _db.CreateConnection();
            var query = "SELECT * FROM Categories WHERE Slug = @Slug AND IsActive = true";
            return await connection.QueryFirstOrDefaultAsync<Category>(query, new { Slug = slug });
        }

        public async Task<IEnumerable<Category>> GetActiveCategories()
        {
            using var connection = _db.CreateConnection();
            var query = "SELECT * FROM Categories WHERE IsActive = true ORDER BY DisplayOrder, Name";
            return await connection.QueryAsync<Category>(query);
        }

        public async Task<IEnumerable<Category>> GetSubCategoriesAsync(int parentId)
        {
            using var connection = _db.CreateConnection();
            var query = "SELECT * FROM Categories WHERE ParentCategoryId = @ParentId AND IsActive = true ORDER BY DisplayOrder, Name";
            return await connection.QueryAsync<Category>(query, new { ParentId = parentId });
        }
    }
}