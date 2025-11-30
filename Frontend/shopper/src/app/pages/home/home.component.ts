import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ProductList } from '../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-white">
      <!-- Hero Section -->
      <div class="relative bg-navy-900">
        <div class="absolute inset-0">
          <img class="w-full h-full object-cover" src="https://images.unsplash.com/photo-1472851294608-062f824d29cc" alt="Shopping">
          <div class="absolute inset-0 bg-navy-900 mix-blend-multiply opacity-60"></div>
        </div>
        <div class="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">Welcome to Shopper</h1>
          <p class="mt-6 text-xl text-white max-w-3xl">Discover amazing products from trusted vendors. Shop with confidence and enjoy seamless shopping experience.</p>
          <div class="mt-10">
            <a routerLink="/products" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-navy-900 bg-white hover:bg-gray-50">
              Shop Now
              <svg class="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Categories Section -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 class="text-2xl font-extrabold text-navy-900 mb-8">Shop by Category</h2>
        <div class="grid grid-cols-2 gap-y-8 gap-x-6 sm:grid-cols-3 lg:grid-cols-6">
          @for (category of categories; track category.name) {
            <a [routerLink]="['/products']" [queryParams]="{category: category.slug}" class="group">
              <div class="w-full aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
                <div class="w-full h-32 bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center group-hover:opacity-90 transition">
                  <span class="text-white text-lg font-semibold">{{ category.icon }}</span>
                </div>
              </div>
              <h3 class="mt-4 text-sm font-medium text-navy-900">{{ category.name }}</h3>
            </a>
          }
        </div>
      </div>

      <!-- Featured Products Section -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-2xl font-extrabold text-navy-900">Featured Products</h2>
          <a routerLink="/products" class="text-sm font-medium text-navy-600 hover:text-navy-500">
            View all
            <span aria-hidden="true"> &rarr;</span>
          </a>
        </div>

        @if (loading()) {
          <div class="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
            @for (i of [1,2,3,4]; track i) {
              <div class="animate-pulse">
                <div class="w-full h-64 bg-gray-200 rounded-lg"></div>
                <div class="mt-4 h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="mt-2 h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            }
          </div>
        } @else {
          <div class="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
            @for (product of featuredProducts(); track product.id) {
              <div class="group relative">
                <div class="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75 lg:h-80 lg:aspect-none">
                  <img
                    [src]="product.primaryImage || product.imageUrl || 'https://via.placeholder.com/300'"
                    [alt]="product.name"
                    class="w-full h-full object-center object-cover lg:w-full lg:h-full"
                  >
                </div>
                <div class="mt-4 flex justify-between">
                  <div>
                    <h3 class="text-sm text-gray-700">
                      <a [routerLink]="['/products', product.slug]">
                        <span aria-hidden="true" class="absolute inset-0"></span>
                        {{ product.name }}
                      </a>
                    </h3>
                    <div class="mt-1 flex items-center">
                      @for (star of [1,2,3,4,5]; track star) {
                        <svg
                          class="h-4 w-4"
                          [class.text-yellow-400]="star <= product.rating"
                          [class.text-gray-200]="star > product.rating"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      }
                      <span class="ml-1 text-sm text-gray-500">({{ product.reviewCount }})</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-medium text-navy-900">৳{{ product.price }}</p>
                    @if (product.compareAtPrice) {
                      <p class="text-sm text-gray-500 line-through">৳{{ product.compareAtPrice }}</p>
                    }
                  </div>
                </div>
                <button
                  (click)="addToCart(product, $event)"
                  class="mt-4 w-full bg-navy-600 text-white py-2 px-4 rounded-md hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-500"
                >
                  Add to Cart
                </button>
              </div>
            }
          </div>
        }
      </div>

      <!-- Features Section -->
      <div class="bg-gray-50">
        <div class="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
          <div class="max-w-3xl mx-auto text-center">
            <h2 class="text-3xl font-extrabold text-navy-900">Why Shop With Us</h2>
            <p class="mt-4 text-lg text-gray-500">We provide the best shopping experience with these amazing features</p>
          </div>
          <dl class="mt-12 space-y-10 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-8">
            @for (feature of features; track feature.name) {
              <div class="relative">
                <dt>
                  <div class="absolute h-12 w-12 bg-navy-500 text-white rounded-md flex items-center justify-center">
                    <span class="text-xl">{{ feature.icon }}</span>
                  </div>
                  <p class="ml-16 text-lg leading-6 font-medium text-navy-900">{{ feature.name }}</p>
                </dt>
                <dd class="mt-2 ml-16 text-base text-gray-500">{{ feature.description }}</dd>
              </div>
            }
          </dl>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(true);
  featuredProducts = signal<ProductList[]>([]);

  categories = [
    { name: 'Electronics', slug: 'electronics', icon: '💻' },
    { name: 'Fashion', slug: 'fashion', icon: '👕' },
    { name: 'Home', slug: 'home-garden', icon: '🏠' },
    { name: 'Books', slug: 'books', icon: '📚' },
    { name: 'Sports', slug: 'sports', icon: '⚽' },
    { name: 'Toys', slug: 'toys', icon: '🎮' }
  ];

  features = [
    {
      name: 'Free Shipping',
      description: 'Free shipping on orders over ৳5000',
      icon: '🚚'
    },
    {
      name: 'Secure Payment',
      description: 'Your payment information is safe',
      icon: '🔒'
    },
    {
      name: '24/7 Support',
      description: 'Round the clock customer support',
      icon: '💬'
    },
    {
      name: 'Easy Returns',
      description: '30-day return policy',
      icon: '↩️'
    }
  ];

  ngOnInit() {
    if (this.authService.isAuthenticated() && this.authService.isVendor()) {
      this.router.navigate(['/vendor']);
      return;
    }

    if (this.authService.isAuthenticated() && this.authService.isAdmin()) {
      this.router.navigate(['/admin']);
      return;
    }

    this.loadFeaturedProducts();
  }

  loadFeaturedProducts() {
    this.loading.set(true);
    this.productService.getFeaturedProducts().subscribe({
      next: (products) => {
        this.featuredProducts.set(products);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  addToCart(product: ProductList, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    this.cartService.addItemToLocalCart({
      id: 0,
      productId: product.id,
      quantity: 1,
      price: product.price,
      total: product.price,
      product: product
    });
  }
}