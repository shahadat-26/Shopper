using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
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
        private readonly IDatabaseConnection _db;

        public ProductRepository(IDatabaseConnection db)
        {
            _db = db;
        }

        public async Task<Product> GetByIdAsync(int id)
        {
            using var connection = _db.CreateConnection();
            var query = @"SELECT p.*, v.*, c.* FROM Products p
                         LEFT JOIN Vendors v ON p.VendorId = v.Id
                         LEFT JOIN Categories c ON p.CategoryId = c.Id
                         WHERE p.Id = @Id";

            var products = await connection.QueryAsync<Product, Vendor, Category, Product>(
                query,
                (product, vendor, category) =>
                {
                    product.Vendor = vendor;
                    product.Category = category;
                    return product;
                },
                new { Id = id },
                splitOn: "Id,Id"
            );

            return products.FirstOrDefault();
        }

        public async Task<IEnumerable<Product>> GetAllAsync()
        {
            using var connection = _db.CreateConnection();
            var query = "SELECT * FROM Products WHERE IsActive = true ORDER BY CreatedAt DESC";
            return await connection.QueryAsync<Product>(query);
        }

        public async Task<int> CreateAsync(Product entity)
        {
            using var connection = _db.CreateConnection();
            var query = @"INSERT INTO Products (VendorId, CategoryId, Name, Slug, Description, ShortDescription, SKU, Brand, ImageUrl, ImageData, ImageMimeType, Price, CompareAtPrice, Cost,
                         Quantity, LowStockThreshold, Weight, Length, Width, Height, IsFeatured, IsDigital, IsActive, MetaTitle, MetaDescription, MetaKeywords)
                         VALUES (@VendorId, @CategoryId, @Name, @Slug, @Description, @ShortDescription, @SKU, @Brand, @ImageUrl, @ImageData, @ImageMimeType, @Price, @CompareAtPrice, @Cost,
                         @Quantity, @LowStockThreshold, @Weight, @Length, @Width, @Height, @IsFeatured, @IsDigital, @IsActive, @MetaTitle, @MetaDescription, @MetaKeywords)
                         RETURNING Id";
            return await connection.ExecuteScalarAsync<int>(query, entity);
        }

        public async Task<bool> UpdateAsync(Product entity)
        {
            using var connection = _db.CreateConnection();
            var query = @"UPDATE Products SET CategoryId = @CategoryId, Name = @Name, Description = @Description, ShortDescription = @ShortDescription,
                         SKU = @SKU, Brand = @Brand, ImageUrl = @ImageUrl, ImageData = @ImageData, ImageMimeType = @ImageMimeType,
                         Price = @Price, CompareAtPrice = @CompareAtPrice, Cost = @Cost, Quantity = @Quantity, LowStockThreshold = @LowStockThreshold,
                         Weight = @Weight, Length = @Length, Width = @Width, Height = @Height, IsFeatured = @IsFeatured, IsDigital = @IsDigital,
                         IsActive = @IsActive, MetaTitle = @MetaTitle, MetaDescription = @MetaDescription, MetaKeywords = @MetaKeywords, UpdatedAt = @UpdatedAt
                         WHERE Id = @Id";
            var result = await connection.ExecuteAsync(query, entity);
            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var connection = _db.CreateConnection();
            var query = "DELETE FROM Products WHERE Id = @Id";
            var result = await connection.ExecuteAsync(query, new { Id = id });
            return result > 0;
        }

        public async Task<Product> GetBySlugAsync(string slug)
        {
            using var connection = _db.CreateConnection();
            var query = @"SELECT p.*, v.*, c.* FROM Products p
                         LEFT JOIN Vendors v ON p.VendorId = v.Id
                         LEFT JOIN Categories c ON p.CategoryId = c.Id
                         WHERE p.Slug = @Slug AND p.IsActive = true";

            var products = await connection.QueryAsync<Product, Vendor, Category, Product>(
                query,
                (product, vendor, category) =>
                {
                    product.Vendor = vendor;
                    product.Category = category;
                    return product;
                },
                new { Slug = slug },
                splitOn: "Id,Id"
            );

            return products.FirstOrDefault();
        }

        public async Task<IEnumerable<Product>> GetByVendorIdAsync(int vendorId)
        {
            using var connection = _db.CreateConnection();
            var query = "SELECT * FROM Products WHERE VendorId = @VendorId AND IsActive = true ORDER BY CreatedAt DESC";
            return await connection.QueryAsync<Product>(query, new { VendorId = vendorId });
        }

        public async Task<IEnumerable<Product>> GetByCategoryIdAsync(int categoryId)
        {
            using var connection = _db.CreateConnection();
            var query = "SELECT * FROM Products WHERE CategoryId = @CategoryId AND IsActive = true ORDER BY CreatedAt DESC";
            return await connection.QueryAsync<Product>(query, new { CategoryId = categoryId });
        }

        public async Task<IEnumerable<Product>> GetFeaturedProductsAsync(int limit = 10)
        {
            using var connection = _db.CreateConnection();
            var query = "SELECT * FROM Products WHERE IsFeatured = true AND IsActive = true ORDER BY CreatedAt DESC LIMIT @Limit";
            return await connection.QueryAsync<Product>(query, new { Limit = limit });
        }

        public async Task<IEnumerable<Product>> SearchProductsAsync(ProductSearchDto searchDto)
        {
            using var connection = _db.CreateConnection();
            var query = @"SELECT * FROM Products WHERE IsActive = true";
            var parameters = new DynamicParameters();

            if (!string.IsNullOrEmpty(searchDto.Keyword))
            {
                query += " AND (LOWER(Name) LIKE @Keyword OR LOWER(Description) LIKE @Keyword)";
                parameters.Add("Keyword", $"%{searchDto.Keyword.ToLower()}%");
            }

            if (searchDto.CategoryId.HasValue)
            {
                query += " AND CategoryId = @CategoryId";
                parameters.Add("CategoryId", searchDto.CategoryId.Value);
            }

            if (searchDto.MinPrice.HasValue)
            {
                query += " AND Price >= @MinPrice";
                parameters.Add("MinPrice", searchDto.MinPrice.Value);
            }

            if (searchDto.MaxPrice.HasValue)
            {
                query += " AND Price <= @MaxPrice";
                parameters.Add("MaxPrice", searchDto.MaxPrice.Value);
            }

            if (searchDto.VendorId.HasValue)
            {
                query += " AND VendorId = @VendorId";
                parameters.Add("VendorId", searchDto.VendorId.Value);
            }

            if (searchDto.IsFeatured.HasValue)
            {
                query += " AND IsFeatured = @IsFeatured";
                parameters.Add("IsFeatured", searchDto.IsFeatured.Value);
            }

            query += searchDto.SortBy switch
            {
                "price_asc" => " ORDER BY Price ASC",
                "price_desc" => " ORDER BY Price DESC",
                "name" => " ORDER BY Name ASC",
                "newest" => " ORDER BY CreatedAt DESC",
                "rating" => " ORDER BY Rating DESC",
                _ => " ORDER BY CreatedAt DESC"
            };

            query += " LIMIT @PageSize OFFSET @Offset";
            parameters.Add("PageSize", searchDto.PageSize);
            parameters.Add("Offset", (searchDto.Page - 1) * searchDto.PageSize);

            return await connection.QueryAsync<Product>(query, parameters);
        }

        public async Task<int> GetTotalCountAsync(ProductSearchDto searchDto)
        {
            using var connection = _db.CreateConnection();
            var query = @"SELECT COUNT(*) FROM Products WHERE IsActive = true";
            var parameters = new DynamicParameters();

            if (!string.IsNullOrEmpty(searchDto.Keyword))
            {
                query += " AND (LOWER(Name) LIKE @Keyword OR LOWER(Description) LIKE @Keyword)";
                parameters.Add("Keyword", $"%{searchDto.Keyword.ToLower()}%");
            }

            if (searchDto.CategoryId.HasValue)
            {
                query += " AND CategoryId = @CategoryId";
                parameters.Add("CategoryId", searchDto.CategoryId.Value);
            }

            if (searchDto.MinPrice.HasValue)
            {
                query += " AND Price >= @MinPrice";
                parameters.Add("MinPrice", searchDto.MinPrice.Value);
            }

            if (searchDto.MaxPrice.HasValue)
            {
                query += " AND Price <= @MaxPrice";
                parameters.Add("MaxPrice", searchDto.MaxPrice.Value);
            }

            if (searchDto.VendorId.HasValue)
            {
                query += " AND VendorId = @VendorId";
                parameters.Add("VendorId", searchDto.VendorId.Value);
            }

            if (searchDto.IsFeatured.HasValue)
            {
                query += " AND IsFeatured = @IsFeatured";
                parameters.Add("IsFeatured", searchDto.IsFeatured.Value);
            }

            return await connection.ExecuteScalarAsync<int>(query, parameters);
        }

        public async Task<bool> UpdateQuantityAsync(int productId, int quantity)
        {
            using var connection = _db.CreateConnection();
            var query = "UPDATE Products SET Quantity = @Quantity WHERE Id = @ProductId";
            var result = await connection.ExecuteAsync(query, new { ProductId = productId, Quantity = quantity });
            return result > 0;
        }

        public async Task<bool> IncrementViewCountAsync(int productId)
        {
            using var connection = _db.CreateConnection();
            var query = "UPDATE Products SET ViewCount = ViewCount + 1 WHERE Id = @ProductId";
            var result = await connection.ExecuteAsync(query, new { ProductId = productId });
            return result > 0;
        }
    }
}