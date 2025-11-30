export interface Product {
  id: number;
  vendorId: number;
  categoryId: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  isFeatured: boolean;
  isDigital: boolean;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  brand?: string;
  imageUrl?: string;
  imageData?: string;  // Base64 encoded image data
  imageMimeType?: string;
  vendor?: VendorInfo;
  category?: Category;
  images?: ProductImage[];
  attributes?: ProductAttribute[];
  variations?: ProductVariation[];
}

export interface ProductList {
  id: number;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  primaryImage?: string;
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  vendorName?: string;
  categoryName?: string;
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  altText?: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface ProductAttribute {
  id: number;
  attributeName: string;
  attributeValue: string;
  displayOrder: number;
}

export interface ProductVariation {
  id: number;
  variationName: string;
  sku: string;
  price: number;
  quantity: number;
  attributes?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentCategoryId?: number;
  displayOrder: number;
  isActive: boolean;
  subCategories?: Category[];
}

export interface VendorInfo {
  id: number;
  storeName: string;
  logoUrl?: string;
  rating: number;
  totalSales: number;
  isApproved: boolean;
}

export interface ProductSearch {
  keyword?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  vendorId?: number;
  isFeatured?: boolean;
  sortBy?: string;
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}