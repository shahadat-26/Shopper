using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ShopperBackend.DTOs;
using ShopperBackend.Helpers;
using ShopperBackend.Models;
using ShopperBackend.Repositories;

namespace ShopperBackend.Services
{
    public interface IProductService
    {
        Task<ProductDto> GetProductByIdAsync(int id);
        Task<ProductDto> GetProductBySlugAsync(string slug);
        Task<PaginatedResult<ProductListDto>> GetProductsAsync(ProductSearchDto searchDto);
        Task<IEnumerable<ProductListDto>> GetFeaturedProductsAsync();
        Task<IEnumerable<ProductListDto>> GetProductsByVendorAsync(int vendorId);
        Task<IEnumerable<ProductDto>> GetVendorProductsAsync(int vendorId);
        Task<IEnumerable<ProductListDto>> GetProductsByCategoryAsync(int categoryId);
        Task<ProductDto> CreateProductAsync(CreateProductDto createDto);
        Task<ProductDto> CreateProductAsync(int vendorId, CreateProductDto createDto);
        Task<ProductDto> UpdateProductAsync(int id, UpdateProductDto updateDto);
        Task<ProductDto> UpdateProductAsync(int id, int vendorId, UpdateProductDto updateDto);
        Task DeleteProductAsync(int id);
        Task<bool> DeleteProductAsync(int id, int vendorId);
    }

    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;

        public ProductService(IProductRepository productRepository)
        {
            _productRepository = productRepository;
        }

        public async Task<ProductDto> GetProductByIdAsync(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null || !product.IsActive)
            {
                throw new Exception("Product not found");
            }

            await _productRepository.IncrementViewCountAsync(id);

            return MapToDto(product);
        }

        public async Task<ProductDto> GetProductBySlugAsync(string slug)
        {
            var product = await _productRepository.GetBySlugAsync(slug);
            if (product == null)
            {
                throw new Exception("Product not found");
            }

            await _productRepository.IncrementViewCountAsync(product.Id);

            return MapToDto(product);
        }

        public async Task<PaginatedResult<ProductListDto>> GetProductsAsync(ProductSearchDto searchDto)
        {
            var products = await _productRepository.SearchProductsAsync(searchDto);
            var totalCount = await _productRepository.GetTotalCountAsync(searchDto);

            var productDtos = products.Select(MapToListDto).ToList();

            return new PaginatedResult<ProductListDto>(productDtos, totalCount, searchDto.Page, searchDto.PageSize);
        }

        public async Task<IEnumerable<ProductListDto>> GetFeaturedProductsAsync()
        {
            var products = await _productRepository.GetFeaturedProductsAsync();
            return products.Select(MapToListDto);
        }

        public async Task<IEnumerable<ProductListDto>> GetProductsByVendorAsync(int vendorId)
        {
            var products = await _productRepository.GetByVendorIdAsync(vendorId);
            return products.Select(MapToListDto);
        }

        public async Task<IEnumerable<ProductListDto>> GetProductsByCategoryAsync(int categoryId)
        {
            var products = await _productRepository.GetByCategoryIdAsync(categoryId);
            return products.Select(MapToListDto);
        }

        public async Task<IEnumerable<ProductDto>> GetVendorProductsAsync(int vendorId)
        {
            var products = await _productRepository.GetByVendorIdAsync(vendorId);
            return products.Select(MapToDto);
        }

        public async Task<ProductDto> CreateProductAsync(CreateProductDto createDto)
        {
            var vendorId = createDto.VendorId ?? 0;
            return await CreateProductAsync(vendorId, createDto);
        }

        public async Task<ProductDto> CreateProductAsync(int vendorId, CreateProductDto createDto)
        {
            var product = new Product
            {
                VendorId = vendorId,
                CategoryId = createDto.CategoryId,
                Name = createDto.Name,
                Slug = SlugHelper.GenerateSlug(createDto.Name),
                Description = createDto.Description,
                ShortDescription = createDto.ShortDescription,
                SKU = createDto.SKU,
                Brand = createDto.Brand,
                ImageUrl = createDto.ImageUrl,
                ImageData = createDto.ImageData,
                ImageMimeType = createDto.ImageMimeType,
                Price = createDto.Price,
                CompareAtPrice = createDto.CompareAtPrice,
                Cost = createDto.Cost,
                Quantity = createDto.Quantity,
                LowStockThreshold = createDto.LowStockThreshold,
                Weight = createDto.Weight,
                Length = createDto.Length,
                Width = createDto.Width,
                Height = createDto.Height,
                IsFeatured = createDto.IsFeatured,
                IsDigital = createDto.IsDigital,
                IsActive = true,
                MetaTitle = createDto.MetaTitle,
                MetaDescription = createDto.MetaDescription,
                MetaKeywords = createDto.MetaKeywords,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            product.Id = await _productRepository.CreateAsync(product);

            return MapToDto(product);
        }

        public async Task<ProductDto> UpdateProductAsync(int id, int vendorId, UpdateProductDto updateDto)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null || product.VendorId != vendorId)
            {
                throw new Exception("Product not found or unauthorized");
            }

            product.CategoryId = updateDto.CategoryId;
            product.Name = updateDto.Name;
            product.Description = updateDto.Description;
            product.ShortDescription = updateDto.ShortDescription;
            if (updateDto.ImageData != null && updateDto.ImageMimeType != null)
            {
                product.ImageData = updateDto.ImageData;
                product.ImageMimeType = updateDto.ImageMimeType;
            }
            else if (updateDto.ImageUrl != null)
            {
                product.ImageUrl = updateDto.ImageUrl;
            }
            product.Price = updateDto.Price;
            product.CompareAtPrice = updateDto.CompareAtPrice;
            product.Cost = updateDto.Cost;
            product.Quantity = updateDto.Quantity;
            product.LowStockThreshold = updateDto.LowStockThreshold;
            product.Weight = updateDto.Weight;
            product.Length = updateDto.Length;
            product.Width = updateDto.Width;
            product.Height = updateDto.Height;
            product.IsFeatured = updateDto.IsFeatured;
            product.IsDigital = updateDto.IsDigital;
            product.IsActive = updateDto.IsActive;
            product.MetaTitle = updateDto.MetaTitle;
            product.MetaDescription = updateDto.MetaDescription;
            product.MetaKeywords = updateDto.MetaKeywords;
            product.UpdatedAt = DateTime.UtcNow;

            await _productRepository.UpdateAsync(product);

            return MapToDto(product);
        }

        public async Task<ProductDto> UpdateProductAsync(int id, UpdateProductDto updateDto)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
            {
                throw new Exception("Product not found");
            }

            return await UpdateProductAsync(id, product.VendorId, updateDto);
        }

        public async Task DeleteProductAsync(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
            {
                throw new Exception("Product not found");
            }

            await _productRepository.DeleteAsync(id);
        }

        public async Task<bool> DeleteProductAsync(int id, int vendorId)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null || product.VendorId != vendorId)
            {
                throw new Exception("Product not found or unauthorized");
            }

            return await _productRepository.DeleteAsync(id);
        }

        private ProductDto MapToDto(Product product)
        {
            return new ProductDto
            {
                Id = product.Id,
                VendorId = product.VendorId,
                CategoryId = product.CategoryId,
                Name = product.Name,
                Slug = product.Slug,
                Description = product.Description,
                ShortDescription = product.ShortDescription,
                SKU = product.SKU,
                ImageUrl = product.ImageUrl,
                ImageData = product.ImageData != null ? Convert.ToBase64String(product.ImageData) : null,
                ImageMimeType = product.ImageMimeType,
                Price = product.Price,
                CompareAtPrice = product.CompareAtPrice,
                Quantity = product.Quantity,
                IsFeatured = product.IsFeatured,
                IsDigital = product.IsDigital,
                IsActive = product.IsActive,
                Rating = product.Rating,
                ReviewCount = product.ReviewCount,
                Vendor = product.Vendor != null ? new VendorListDto
                {
                    Id = product.Vendor.Id,
                    StoreName = product.Vendor.StoreName,
                    LogoUrl = product.Vendor.LogoUrl,
                    Rating = product.Vendor.Rating,
                    TotalSales = product.Vendor.TotalSales,
                    IsApproved = product.Vendor.IsApproved
                } : null,
                Category = product.Category != null ? new CategoryDto
                {
                    Id = product.Category.Id,
                    Name = product.Category.Name,
                    Slug = product.Category.Slug,
                    Description = product.Category.Description,
                    ImageUrl = product.Category.ImageUrl,
                    ParentCategoryId = product.Category.ParentCategoryId,
                    DisplayOrder = product.Category.DisplayOrder,
                    IsActive = product.Category.IsActive
                } : null
            };
        }

        private ProductListDto MapToListDto(Product product)
        {
            string primaryImage = null;

            // If product has ImageData, convert to base64
            if (product.ImageData != null && product.ImageMimeType != null)
            {
                primaryImage = $"data:{product.ImageMimeType};base64,{Convert.ToBase64String(product.ImageData)}";
            }
            // Otherwise use ImageUrl if available
            else if (!string.IsNullOrEmpty(product.ImageUrl))
            {
                primaryImage = product.ImageUrl;
            }

            return new ProductListDto
            {
                Id = product.Id,
                Name = product.Name,
                Slug = product.Slug,
                Price = product.Price,
                CompareAtPrice = product.CompareAtPrice,
                PrimaryImage = primaryImage,
                Rating = product.Rating,
                ReviewCount = product.ReviewCount,
                IsActive = product.IsActive
            };
        }
    }
}