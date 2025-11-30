import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { WishlistService } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-navy-900">My Wishlist</h1>
          <p class="text-gray-600 mt-2">{{ wishlistItems().length }} items in your wishlist</p>
        </div>

        <div *ngIf="wishlistItems().length === 0" class="bg-white rounded-lg shadow-sm p-12 text-center">
          <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p class="text-gray-600 mb-6">Save your favorite items here for later!</p>
          <a routerLink="/products"
             class="inline-block bg-navy-600 text-white px-6 py-3 rounded-lg hover:bg-navy-700 transition-colors">
            Continue Shopping
          </a>
        </div>

        <div *ngIf="wishlistItems().length > 0" class="bg-white rounded-lg shadow-sm">
          <div class="p-6 border-b">
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-semibold text-navy-900">Saved Items</h2>
              <button (click)="clearWishlist()"
                      class="text-red-600 hover:text-red-700 text-sm font-medium">
                Clear All
              </button>
            </div>
          </div>

          <div class="divide-y">
            <div *ngFor="let item of wishlistItems()"
                 class="p-6 hover:bg-gray-50 transition-colors">
              <div class="flex items-center space-x-4">
                <img [routerLink]="['/products', item.id]"
                     [src]="item.imageUrl"
                     [alt]="item.name"
                     class="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-75">

                <div class="flex-1">
                  <h3 [routerLink]="['/products', item.id]"
                      class="text-lg font-semibold text-navy-900 hover:text-navy-600 cursor-pointer">
                    {{ item.name }}
                  </h3>
                  <p class="text-gray-600 text-sm mt-1 line-clamp-2">{{ item.description }}</p>

                  <div class="mt-3 flex items-center space-x-4">
                    <span class="text-xl font-bold text-navy-900">৳{{ item.price.toFixed(2) }}</span>
                    <span *ngIf="item.compareAtPrice" class="text-gray-400 line-through">
                      ৳{{ item.compareAtPrice.toFixed(2) }}
                    </span>
                    <span *ngIf="getDiscountPercentage(item) > 0"
                          class="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold">
                      {{ getDiscountPercentage(item) }}% OFF
                    </span>
                  </div>

                  <div class="mt-4 flex items-center space-x-3">
                    <button (click)="moveToCart(item)"
                            [disabled]="item.quantity === 0"
                            class="bg-navy-600 text-white px-4 py-2 rounded hover:bg-navy-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                      {{ item.quantity === 0 ? 'Out of Stock' : 'Move to Cart' }}
                    </button>
                    <button (click)="removeFromWishlist(item)"
                            class="text-red-600 hover:text-red-700 px-4 py-2 border border-red-600 rounded hover:bg-red-50 transition-colors">
                      Remove
                    </button>
                  </div>
                </div>

                <div class="text-right">
                  <span *ngIf="item.quantity > 0" class="text-green-600 text-sm">
                    ✓ In Stock ({{ item.quantity }} available)
                  </span>
                  <span *ngIf="item.quantity === 0" class="text-red-600 text-sm">
                    Out of Stock
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="p-6 bg-gray-50">
            <div class="flex justify-between items-center">
              <a routerLink="/products"
                 class="text-navy-600 hover:text-navy-700 font-medium">
                ← Continue Shopping
              </a>
              <button (click)="moveAllToCart()"
                      [disabled]="!hasItemsInStock()"
                      class="bg-navy-600 text-white px-6 py-3 rounded-lg hover:bg-navy-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                Move All to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  `]
})
export class WishlistComponent {
  wishlistItems = signal<Product[]>([]);

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private router: Router
  ) {
    this.loadWishlist();
  }

  loadWishlist() {
    this.wishlistItems.set(this.wishlistService.getWishlistItems());
  }

  moveToCart(item: Product) {
    this.cartService.addToCart(item, 1);
    this.wishlistService.removeFromWishlist(item.id);
    this.loadWishlist();
  }

  moveAllToCart() {
    const itemsInStock = this.wishlistItems().filter(item => item.quantity > 0);
    itemsInStock.forEach(item => {
      this.cartService.addToCart(item, 1);
      this.wishlistService.removeFromWishlist(item.id);
    });
    this.loadWishlist();
  }

  removeFromWishlist(item: Product) {
    this.wishlistService.removeFromWishlist(item.id);
    this.loadWishlist();
  }

  clearWishlist() {
    if (confirm('Are you sure you want to clear your entire wishlist?')) {
      this.wishlistService.clearWishlist();
      this.loadWishlist();
    }
  }

  hasItemsInStock(): boolean {
    return this.wishlistItems().some(item => item.quantity > 0);
  }

  getDiscountPercentage(item: Product): number {
    if (!item.compareAtPrice) return 0;
    return Math.round(((item.compareAtPrice - item.price) / item.compareAtPrice) * 100);
  }
}