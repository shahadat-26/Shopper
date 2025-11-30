import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { ProductList, Category, ProductSearch } from '../../models/product.model';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="bg-navy-900 text-white py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold">Shop All Products</h1>
          <p class="mt-2 text-navy-200">Discover amazing products from our collection</p>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex gap-8">
          <div class="hidden lg:block w-64 flex-shrink-0">
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Filters</h3>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  [(ngModel)]="searchKeyword"
                  (ngModelChange)="onSearchChange()"
                  placeholder="Search products..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-navy-500 focus:border-navy-500"
                >
              </div>

              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-900 mb-3">Categories</h4>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      [checked]="!selectedCategoryId()"
                      (change)="selectCategory(null)"
                      class="h-4 w-4 text-navy-600 focus:ring-navy-500"
                    >
                    <span class="ml-2 text-sm text-gray-700">All Categories</span>
                  </label>
                  @for (category of categories; track category.id) {
                    <label class="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        [value]="category.id"
                        [checked]="selectedCategoryId() === category.id"
                        (change)="selectCategory(category.id)"
                        class="h-4 w-4 text-navy-600 focus:ring-navy-500"
                      >
                      <span class="ml-2 text-sm text-gray-700">{{ category.name }}</span>
                    </label>
                  }
                </div>
              </div>

              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-900 mb-3">Price Range</h4>
                <div class="space-y-2">
                  <input
                    type="number"
                    [(ngModel)]="minPrice"
                    (ngModelChange)="applyFilters()"
                    placeholder="Min price"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-navy-500 focus:border-navy-500"
                  >
                  <input
                    type="number"
                    [(ngModel)]="maxPrice"
                    (ngModelChange)="applyFilters()"
                    placeholder="Max price"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-navy-500 focus:border-navy-500"
                  >
                </div>
              </div>

              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-900 mb-3">Sort By</h4>
                <select
                  [(ngModel)]="sortBy"
                  (ngModelChange)="applyFilters()"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-navy-500 focus:border-navy-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name">Name: A-Z</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              <button
                (click)="clearFilters()"
                class="w-full px-4 py-2 text-sm text-navy-600 border border-navy-600 rounded-md hover:bg-navy-50"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          <div class="flex-1">
            <div class="lg:hidden mb-4">
              <button
                (click)="toggleMobileFilters()"
                class="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>
            </div>

            <div class="flex justify-between items-center mb-6">
              <p class="text-gray-700">
                Showing {{ products().length }} of {{ totalCount() }} products
              </p>
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-600">View:</span>
                <button
                  (click)="setViewMode('grid')"
                  [class.text-navy-600]="viewMode() === 'grid'"
                  class="p-2 hover:bg-gray-100 rounded"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  (click)="setViewMode('list')"
                  [class.text-navy-600]="viewMode() === 'list'"
                  class="p-2 hover:bg-gray-100 rounded"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            @if (loading()) {
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                @for (i of [1,2,3,4,5,6]; track i) {
                  <div class="animate-pulse">
                    <div class="bg-gray-200 h-64 rounded-lg mb-4"></div>
                    <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                }
              </div>
            }

            @if (!loading() && viewMode() === 'grid') {
              @if (products().length > 0) {
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  @for (product of products(); track product.id) {
                    <div class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                      <a [routerLink]="['/products', product.slug]" class="block">
                        <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
                          <img
                            [src]="product.primaryImage || product.imageUrl || 'https://via.placeholder.com/300'"
                            [alt]="product.name"
                            class="h-64 w-full object-cover object-center hover:opacity-90 transition"
                          >
                        </div>
                        <div class="p-4">
                          <h3 class="text-sm font-medium text-gray-900 line-clamp-2">{{ product.name }}</h3>
                          <div class="mt-2 flex items-center">
                            @for (star of [1,2,3,4,5]; track star) {
                              <svg
                                class="h-4 w-4"
                                [class.text-yellow-400]="star <= Math.round(product.rating)"
                                [class.text-gray-200]="star > Math.round(product.rating)"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            }
                            <span class="ml-2 text-sm text-gray-500">({{ product.reviewCount }})</span>
                          </div>
                          <div class="mt-3 flex items-center justify-between">
                            <div>
                              <p class="text-lg font-semibold text-navy-900">\${{ product.price }}</p>
                              @if (product.compareAtPrice) {
                                <p class="text-sm text-gray-500 line-through">\${{ product.compareAtPrice }}</p>
                              }
                            </div>
                          </div>
                        </div>
                      </a>
                      <div class="px-4 pb-4">
                        <button
                          (click)="addToCart(product)"
                          class="w-full bg-navy-600 text-white py-2 px-4 rounded-md hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-500"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="text-center py-12">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 class="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                  <p class="mt-1 text-sm text-gray-500">Try adjusting your filters</p>
                </div>
              }
            }

            @if (!loading() && viewMode() === 'list') {
              @if (products().length > 0) {
                <div class="space-y-4">
                  @for (product of products(); track product.id) {
                    <div class="bg-white rounded-lg shadow p-4 flex gap-4">
                      <img
                        [src]="product.primaryImage || product.imageUrl || 'https://via.placeholder.com/150'"
                        [alt]="product.name"
                        class="w-32 h-32 object-cover rounded-lg"
                      >
                      <div class="flex-1">
                        <a [routerLink]="['/products', product.slug]" class="text-lg font-medium text-gray-900 hover:text-navy-600">
                          {{ product.name }}
                        </a>
                        <div class="mt-1 flex items-center">
                          @for (star of [1,2,3,4,5]; track star) {
                            <svg
                              class="h-4 w-4"
                              [class.text-yellow-400]="star <= Math.round(product.rating)"
                              [class.text-gray-200]="star > Math.round(product.rating)"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          }
                          <span class="ml-2 text-sm text-gray-500">({{ product.reviewCount }} reviews)</span>
                        </div>
                        <div class="mt-2 flex items-center justify-between">
                          <div class="flex items-center gap-3">
                            <span class="text-xl font-bold text-navy-900">\${{ product.price }}</span>
                            @if (product.compareAtPrice) {
                              <span class="text-sm text-gray-500 line-through">\${{ product.compareAtPrice }}</span>
                            }
                          </div>
                          <button
                            (click)="addToCart(product)"
                            class="bg-navy-600 text-white py-2 px-6 rounded-md hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-500"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="text-center py-12">
                  <h3 class="text-sm font-medium text-gray-900">No products found</h3>
                  <p class="mt-1 text-sm text-gray-500">Try adjusting your filters</p>
                </div>
              }
            }

            @if (totalPages() > 1) {
              <div class="mt-8 flex justify-center">
                <nav class="flex items-center gap-1">
                  <button
                    (click)="goToPage(currentPage() - 1)"
                    [disabled]="currentPage() === 1"
                    class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  @for (page of getPageNumbers(); track page) {
                    <button
                      (click)="goToPage(page)"
                      [class.bg-navy-600]="page === currentPage()"
                      [class.text-white]="page === currentPage()"
                      [class.bg-white]="page !== currentPage()"
                      [class.text-gray-700]="page !== currentPage()"
                      class="px-4 py-2 text-sm font-medium border border-gray-300 hover:bg-gray-50"
                    >
                      {{ page }}
                    </button>
                  }

                  <button
                    (click)="goToPage(currentPage() + 1)"
                    [disabled]="currentPage() === totalPages()"
                    class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  products = signal<ProductList[]>([]);
  categories: Category[] = [
    { id: 1, name: 'Electronics', slug: 'electronics', displayOrder: 1, isActive: true },
    { id: 2, name: 'Fashion', slug: 'fashion', displayOrder: 2, isActive: true },
    { id: 3, name: 'Home & Garden', slug: 'home-garden', displayOrder: 3, isActive: true },
    { id: 6, name: 'Smartphones', slug: 'smartphones', displayOrder: 4, isActive: true },
    { id: 7, name: 'Laptops', slug: 'laptops', displayOrder: 5, isActive: true },
    { id: 8, name: 'Men Fashion', slug: 'men-fashion', displayOrder: 6, isActive: true },
    { id: 9, name: 'Women Fashion', slug: 'women-fashion', displayOrder: 7, isActive: true }
  ];

  loading = signal(false);
  viewMode = signal<'grid' | 'list'>('grid');
  showMobileFilters = signal(false);

  searchKeyword = '';
  selectedCategoryId = signal<number | null>(null);
  minPrice: number | null = null;
  maxPrice: number | null = null;
  sortBy = 'newest';

  currentPage = signal(1);
  pageSize = 12;
  totalCount = signal(0);
  totalPages = signal(0);

  hasProducts = computed(() => this.products().length > 0);
  hasMultiplePages = computed(() => this.totalPages() > 1);
  isFirstPage = computed(() => this.currentPage() === 1);
  isLastPage = computed(() => this.currentPage() === this.totalPages());

  Math = Math;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        const category = this.categories.find(c => c.slug === params['category']);
        if (category) {
          this.selectedCategoryId.set(category.id);
        }
      }
      if (params['search']) {
        this.searchKeyword = params['search'];
      }
      this.loadProducts();
    });
  }

  loadProducts() {
    this.loading.set(true);

    const searchParams = this.buildSearchParams();

    this.productService.searchProducts(searchParams).subscribe({
      next: (result) => this.handleProductsLoaded(result),
      error: () => this.handleProductsError()
    });
  }

  private buildSearchParams(): ProductSearch {
    return {
      keyword: this.searchKeyword || undefined,
      categoryId: this.selectedCategoryId() || undefined,
      minPrice: this.minPrice || undefined,
      maxPrice: this.maxPrice || undefined,
      sortBy: this.sortBy,
      page: this.currentPage(),
      pageSize: this.pageSize
    };
  }

  private handleProductsLoaded(result: any) {
    this.products.set(result.items);
    this.totalCount.set(result.totalCount);
    this.totalPages.set(result.totalPages);
    this.loading.set(false);
  }

  private handleProductsError() {
    this.loading.set(false);
    this.products.set([]);
  }

  onSearchChange() {
    this.currentPage.set(1);
    this.applyFilters();
  }

  selectCategory(categoryId: number | null) {
    this.selectedCategoryId.set(categoryId);
    this.currentPage.set(1);
    this.applyFilters();
  }

  applyFilters() {
    this.loadProducts();
  }

  clearFilters() {
    this.resetAllFilters();
    this.loadProducts();
  }

  private resetAllFilters() {
    this.searchKeyword = '';
    this.selectedCategoryId.set(null);
    this.minPrice = null;
    this.maxPrice = null;
    this.sortBy = 'newest';
    this.currentPage.set(1);
  }

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode.set(mode);
  }

  toggleMobileFilters() {
    this.showMobileFilters.update(v => !v);
  }

  addToCart(product: ProductList) {
    this.cartService.addItemToLocalCart({
      id: 0,
      productId: product.id,
      quantity: 1,
      price: product.price,
      total: product.price,
      product: product
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push(-1);
        pages.push(total);
      } else if (current >= total - 2) {
        pages.push(1);
        pages.push(-1);
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push(-1);
        pages.push(total);
      }
    }

    return pages;
  }
}