using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ShopperBackend.DTOs
{
    public class ProductDto
    {
        public int Id { get; set; }
        public int VendorId { get; set; }
        public int CategoryId { get; set; }
        public string Name { get; set; }
        public string Slug { get; set; }
        public string Description { get; set; }
        public string ShortDescription { get; set; }
        public string SKU { get; set; }
        public string ImageUrl { get; set; }
        public string ImageData { get; set; }  // Base64 string for frontend
        public string ImageMimeType { get; set; }
        public decimal Price { get; set; }
        public decimal? CompareAtPrice { get; set; }
        public int Quantity { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsDigital { get; set; }
        public bool IsActive { get; set; }
        public decimal Rating { get; set; }
        public int ReviewCount { get; set; }
        public VendorListDto Vendor { get; set; }
        public CategoryDto Category { get; set; }
        public List<ProductImageDto> Images { get; set; }
        public List<ProductAttributeDto> Attributes { get; set; }
        public List<ProductVariationDto> Variations { get; set; }
    }

    public class ProductListDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Slug { get; set; }
        public decimal Price { get; set; }
        public decimal? CompareAtPrice { get; set; }
        public string PrimaryImage { get; set; }
        public decimal Rating { get; set; }
        public int ReviewCount { get; set; }
        public bool IsActive { get; set; }
        public string VendorName { get; set; }
        public string CategoryName { get; set; }
    }

    public class CreateProductDto
    {
        public int? VendorId { get; set; }

        [Required]
        public int CategoryId { get; set; }

        [Required]
        public string Name { get; set; }

        public string Description { get; set; }
        public string ShortDescription { get; set; }

        public string SKU { get; set; }

        public string Brand { get; set; }
        public string ImageUrl { get; set; }
        public byte[] ImageData { get; set; }
        public string ImageMimeType { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }

        public decimal? CompareAtPrice { get; set; }
        public decimal? Cost { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int Quantity { get; set; }

        public int LowStockThreshold { get; set; } = 5;
        public decimal? Weight { get; set; }
        public decimal? Length { get; set; }
        public decimal? Width { get; set; }
        public decimal? Height { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsDigital { get; set; }
        public bool IsActive { get; set; } = true;
        public string MetaTitle { get; set; }
        public string MetaDescription { get; set; }
        public string MetaKeywords { get; set; }
        public List<CreateProductImageDto> Images { get; set; }
        public List<CreateProductAttributeDto> Attributes { get; set; }
    }

    public class UpdateProductDto
    {
        [Required]
        public int CategoryId { get; set; }

        [Required]
        public string Name { get; set; }

        public string SKU { get; set; }
        public string Brand { get; set; }
        public string ImageUrl { get; set; }
        public byte[] ImageData { get; set; }
        public string ImageMimeType { get; set; }

        public string Description { get; set; }
        public string ShortDescription { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }

        public decimal? CompareAtPrice { get; set; }
        public decimal? Cost { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int Quantity { get; set; }

        public int LowStockThreshold { get; set; }
        public decimal? Weight { get; set; }
        public decimal? Length { get; set; }
        public decimal? Width { get; set; }
        public decimal? Height { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsDigital { get; set; }
        public bool IsActive { get; set; }
        public string MetaTitle { get; set; }
        public string MetaDescription { get; set; }
        public string MetaKeywords { get; set; }
    }

    public class ProductImageDto
    {
        public int Id { get; set; }
        public string ImageUrl { get; set; }
        public string AltText { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsPrimary { get; set; }
    }

    public class CreateProductImageDto
    {
        [Required]
        public string ImageUrl { get; set; }

        public string AltText { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsPrimary { get; set; }
    }

    public class ProductAttributeDto
    {
        public int Id { get; set; }
        public string AttributeName { get; set; }
        public string AttributeValue { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class CreateProductAttributeDto
    {
        [Required]
        public string AttributeName { get; set; }

        [Required]
        public string AttributeValue { get; set; }

        public int DisplayOrder { get; set; }
    }

    public class ProductVariationDto
    {
        public int Id { get; set; }
        public string VariationName { get; set; }
        public string SKU { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string Attributes { get; set; }
    }

    public class CreateProductVariationDto
    {
        [Required]
        public string VariationName { get; set; }

        [Required]
        public string SKU { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int Quantity { get; set; }

        public string Attributes { get; set; }
    }

    public class ProductSearchDto
    {
        public string? Keyword { get; set; }
        public int? CategoryId { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public int? VendorId { get; set; }
        public bool? IsFeatured { get; set; }
        public string? SortBy { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}