import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product, ProductList, ProductSearch, PaginatedResult, Category, ProductImage } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/products`;

  searchProducts(searchParams: ProductSearch): Observable<PaginatedResult<ProductList>> {
    let params = new HttpParams()
      .set('page', searchParams.page.toString())
      .set('pageSize', searchParams.pageSize.toString());

    if (searchParams.keyword) {
      params = params.set('keyword', searchParams.keyword);
    }
    if (searchParams.categoryId) {
      params = params.set('categoryId', searchParams.categoryId.toString());
    }
    if (searchParams.minPrice) {
      params = params.set('minPrice', searchParams.minPrice.toString());
    }
    if (searchParams.maxPrice) {
      params = params.set('maxPrice', searchParams.maxPrice.toString());
    }
    if (searchParams.vendorId) {
      params = params.set('vendorId', searchParams.vendorId.toString());
    }
    if (searchParams.isFeatured !== undefined) {
      params = params.set('isFeatured', searchParams.isFeatured.toString());
    }
    if (searchParams.sortBy) {
      params = params.set('sortBy', searchParams.sortBy);
    }

    return this.http.get<PaginatedResult<ProductList>>(this.apiUrl, { params });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/slug/${slug}`);
  }

  getFeaturedProducts(): Observable<ProductList[]> {
    return this.http.get<ProductList[]>(`${this.apiUrl}/featured`);
  }

  getProductsByVendor(vendorId: number): Observable<ProductList[]> {
    return this.http.get<ProductList[]>(`${this.apiUrl}/vendor/${vendorId}`);
  }

  getProductsByCategory(categoryId: number, limit?: number): Observable<ProductList[]> {
    let params = new HttpParams();
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    return this.http.get<ProductList[]>(`${this.apiUrl}/category/${categoryId}`, { params });
  }

  getProductImages(productId: number): Observable<ProductImage[]> {
    return this.http.get<ProductImage[]>(`${this.apiUrl}/${productId}/images`);
  }

  createProduct(product: any): Observable<Product> {
    return this.http.post<Product>(`${environment.apiUrl}/vendor/products`, product);
  }

  updateProduct(id: number, product: any): Observable<Product> {
    return this.http.put<Product>(`${environment.apiUrl}/vendor/products/${id}`, product);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/vendor/products/${id}`);
  }

  uploadProductImage(productId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post(`${environment.apiUrl}/vendor/products/${productId}/images`, formData);
  }
}