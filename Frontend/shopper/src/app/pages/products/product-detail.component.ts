import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { Product, ProductImage, ProductList } from '../../models/product.model';
import { Review } from '../../models/review.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 py-8">
        <nav class="flex mb-8 text-sm">
          <a routerLink="/" class="text-gray-600 hover:text-navy-600">Home</a>
          <span class="mx-2 text-gray-400">/</span>
          <a routerLink="/products" class="text-gray-600 hover:text-navy-600">Products</a>
          <span class="mx-2 text-gray-400">/</span>
          <span class="text-navy-900">{{ product()?.name || 'Loading...' }}</span>
        </nav>

        <div *ngIf="loading()" class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600"></div>
        </div>

        <div *ngIf="error()" class="bg-red-50 text-red-600 p-4 rounded-lg">
          {{ error() }}
        </div>

        <div *ngIf="!loading() && !error() && product()" class="bg-white rounded-lg shadow-sm">
          <div class="grid md:grid-cols-2 gap-8 p-8">
            <div class="space-y-4">
              <div class="relative">
                <img [src]="selectedImage()" [alt]="product()!.name"
                     class="w-full h-96 object-cover rounded-lg">
                <button *ngIf="isInWishlist()" (click)="removeFromWishlist()"
                        class="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:shadow-lg">
                  <svg class="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"></path>
                  </svg>
                </button>
                <button *ngIf="!isInWishlist()" (click)="addToWishlist()"
                        class="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:shadow-lg">
                  <svg class="w-6 h-6 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                </button>
              </div>

              <div class="flex space-x-2 overflow-x-auto">
                <img *ngFor="let image of productImages()"
                     [src]="image.imageUrl"
                     [alt]="image.altText || product()!.name"
                     (click)="selectImage(image.imageUrl)"
                     [class.ring-2]="selectedImage() === image.imageUrl"
                     class="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-75 ring-navy-600">
              </div>
            </div>

            <div class="space-y-6">
              <div>
                <h1 class="text-3xl font-bold text-navy-900">{{ product()!.name }}</h1>
                <div class="mt-2 flex items-center space-x-4">
                  <div class="flex items-center">
                    <div class="flex items-center">
                      <span *ngFor="let star of [1,2,3,4,5]"
                            [class.text-yellow-400]="star <= averageRating()"
                            [class.text-gray-300]="star > averageRating()"
                            class="text-xl">★</span>
                    </div>
                    <span class="ml-2 text-gray-600">({{ averageRating().toFixed(1) }})</span>
                  </div>
                  <span class="text-gray-400">|</span>
                  <span class="text-gray-600">{{ totalReviews() }} reviews</span>
                  <span class="text-gray-400">|</span>
                  <span class="text-green-600">{{ product()!.quantity }} in stock</span>
                </div>
              </div>

              <div class="space-y-2">
                <div class="flex items-baseline space-x-3">
                  <span class="text-3xl font-bold text-navy-900">৳{{ product()!.price.toFixed(2) }}</span>
                  <span *ngIf="hasComparePrice()" class="text-xl text-gray-400 line-through">
                    ৳{{ product()!.compareAtPrice!.toFixed(2) }}
                  </span>
                  <span *ngIf="discountPercentage() > 0" class="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                    {{ discountPercentage() }}% OFF
                  </span>
                </div>
                <p class="text-sm text-gray-600">Inclusive of all taxes</p>
              </div>

              <div class="border-t border-b py-4 space-y-4">
                <div>
                  <h3 class="font-semibold text-gray-900 mb-2">Description</h3>
                  <p class="text-gray-600">{{ product()!.description }}</p>
                </div>
                <div *ngIf="product()!.brand">
                  <span class="font-semibold text-gray-900">Brand:</span>
                  <span class="ml-2 text-gray-600">{{ product()!.brand }}</span>
                </div>
                <div *ngIf="product()!.sku">
                  <span class="font-semibold text-gray-900">SKU:</span>
                  <span class="ml-2 text-gray-600">{{ product()!.sku }}</span>
                </div>
              </div>

              <div class="space-y-4">
                <div class="flex items-center space-x-4">
                  <label class="font-semibold text-gray-900">Quantity:</label>
                  <div class="flex items-center border rounded-lg">
                    <button (click)="decreaseQuantity()"
                            class="px-3 py-1 hover:bg-gray-100 transition-colors">-</button>
                    <input [(ngModel)]="quantity" type="number" min="1" [max]="product()!.quantity"
                           class="w-16 text-center border-x py-1 focus:outline-none">
                    <button (click)="increaseQuantity()"
                            class="px-3 py-1 hover:bg-gray-100 transition-colors">+</button>
                  </div>
                </div>

                <div class="flex space-x-4">
                  <button (click)="addToCart()"
                          [disabled]="product()!.quantity === 0"
                          class="flex-1 bg-navy-600 text-white py-3 rounded-lg hover:bg-navy-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                    {{ product()!.quantity === 0 ? 'Out of Stock' : 'Add to Cart' }}
                  </button>
                  <button (click)="buyNow()"
                          [disabled]="product()!.quantity === 0"
                          class="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                    Buy Now
                  </button>
                </div>
              </div>

              <div class="bg-gray-50 rounded-lg p-4 space-y-2">
                <div class="flex items-center space-x-2">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span class="text-sm text-gray-700">Cash on Delivery Available</span>
                </div>
                <div class="flex items-center space-x-2">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span class="text-sm text-gray-700">7 Days Return Policy</span>
                </div>
                <div class="flex items-center space-x-2">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span class="text-sm text-gray-700">Free Delivery on orders above ৳500</span>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t p-8">
            <div class="max-w-4xl mx-auto">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-navy-900">Customer Reviews</h2>
                <button *ngIf="authService.isLoggedIn() && canReview()"
                        (click)="showReviewForm = true"
                        class="bg-navy-600 text-white px-4 py-2 rounded-lg hover:bg-navy-700">
                  Write a Review
                </button>
              </div>

              <div *ngIf="showReviewForm" class="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 class="font-semibold text-lg mb-4">Write Your Review</h3>
                <form (submit)="submitReview($event)" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <div class="flex space-x-1">
                      <button *ngFor="let star of [1,2,3,4,5]"
                              type="button"
                              (click)="newReview.rating = star"
                              [class.text-yellow-400]="star <= newReview.rating"
                              [class.text-gray-300]="star > newReview.rating"
                              class="text-3xl focus:outline-none">★</button>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input [(ngModel)]="newReview.title" name="title" type="text" required
                           class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Review</label>
                    <textarea [(ngModel)]="newReview.comment" name="comment" rows="4" required
                              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500"></textarea>
                  </div>
                  <div class="flex space-x-3">
                    <button type="submit"
                            class="bg-navy-600 text-white px-4 py-2 rounded-lg hover:bg-navy-700">
                      Submit Review
                    </button>
                    <button type="button" (click)="showReviewForm = false"
                            class="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>

              <div *ngIf="reviews().length === 0" class="text-center py-8 text-gray-500">
                No reviews yet. Be the first to review this product!
              </div>

              <div class="space-y-4">
                <div *ngFor="let review of reviews()" class="bg-white border rounded-lg p-4">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center space-x-2 mb-1">
                        <div class="flex">
                          <span *ngFor="let star of [1,2,3,4,5]"
                                [class.text-yellow-400]="star <= review.rating"
                                [class.text-gray-300]="star > review.rating"
                                class="text-sm">★</span>
                        </div>
                        <span class="font-semibold">{{ review.userName }}</span>
                        <span class="text-gray-400 text-sm">{{ formatDate(review.createdAt) }}</span>
                      </div>
                      <h4 class="font-semibold text-gray-900 mb-1">{{ review.title }}</h4>
                      <p class="text-gray-600">{{ review.comment }}</p>
                      <div class="mt-3 flex items-center space-x-4 text-sm">
                        <button class="text-gray-500 hover:text-gray-700">
                          Helpful ({{ review.helpfulCount || 0 }})
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div *ngIf="reviews().length > 0 && hasMoreReviews()" class="mt-6 text-center">
                <button (click)="loadMoreReviews()"
                        class="text-navy-600 hover:text-navy-700 font-semibold">
                  Load More Reviews
                </button>
              </div>
            </div>
          </div>

          <div class="border-t p-8">
            <h2 class="text-2xl font-bold text-navy-900 mb-6">Related Products</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div *ngFor="let related of relatedProducts()"
                   [routerLink]="['/products', related.id]"
                   class="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
                <img [src]="related.imageUrl" [alt]="related.name"
                     class="w-full h-48 object-cover rounded-t-lg">
                <div class="p-4">
                  <h3 class="font-semibold text-gray-900 line-clamp-1">{{ related.name }}</h3>
                  <div class="mt-2">
                    <span class="text-lg font-bold text-navy-900">৳{{ related.price.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-1 {
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private reviewService = inject(ReviewService);
  authService = inject(AuthService);

  product = signal<Product | null>(null);
  productImages = signal<ProductImage[]>([]);
  selectedImage = signal<string>('');
  loading = signal(false);
  error = signal<string | null>(null);
  quantity = 1;
  reviews = signal<Review[]>([]);
  relatedProducts = signal<ProductList[]>([]);
  showReviewForm = false;
  reviewPage = 1;
  hasMoreReviews = signal(false);

  newReview = {
    rating: 5,
    title: '',
    comment: ''
  };

  averageRating = computed(() => {
    const reviewList = this.reviews();
    if (reviewList.length === 0) return 0;
    const sum = reviewList.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviewList.length;
  });

  totalReviews = computed(() => this.reviews().length);

  discountPercentage = computed(() => {
    const prod = this.product();
    if (!prod || !prod.compareAtPrice) return 0;
    return Math.round(((prod.compareAtPrice - prod.price) / prod.compareAtPrice) * 100);
  });

  hasComparePrice = computed(() => {
    const prod = this.product();
    return !!prod && !!prod.compareAtPrice && prod.compareAtPrice > 0;
  });

  ngOnInit() {
    this.route.params.subscribe(params => {
      const idOrSlug = params['id'];
      if (idOrSlug) {
        const isNumeric = !isNaN(+idOrSlug);
        if (isNumeric) {
          this.loadProductById(+idOrSlug);
        } else {
          this.loadProductBySlug(idOrSlug);
        }
      }
    });
  }

  loadProductById(productId: number) {
    this.setLoadingState(true);

    this.productService.getProductById(productId).subscribe({
      next: (product) => this.handleProductLoaded(product),
      error: () => this.handleProductError()
    });
  }

  loadProductBySlug(slug: string) {
    this.setLoadingState(true);

    this.productService.getProductBySlug(slug).subscribe({
      next: (product) => this.handleProductLoaded(product),
      error: () => this.handleProductError()
    });
  }

  private setLoadingState(isLoading: boolean) {
    this.loading.set(isLoading);
    if (isLoading) {
      this.error.set(null);
    }
  }

  private handleProductLoaded(product: Product) {
    this.product.set(product);
    this.setProductImage(product);
    this.loadProductImages(product.id);
    this.loadReviews(product.id);
    this.loadRelatedProducts(product.id);
    this.loading.set(false);
  }

  private handleProductError() {
    this.error.set('Failed to load product details');
    this.loading.set(false);
  }

  private setProductImage(product: Product) {
    if (product.imageData && product.imageMimeType) {
      const base64Image = `data:${product.imageMimeType};base64,${product.imageData}`;
      this.selectedImage.set(base64Image);
    } else if (product.imageUrl) {
      this.selectedImage.set(product.imageUrl);
    }
  }

  loadProductImages(productId: number) {
    this.productService.getProductImages(productId).subscribe({
      next: (images) => {
        this.productImages.set(images);
        if (images.length > 0 && !this.selectedImage()) {
          this.selectedImage.set(images[0].imageUrl);
        }
      }
    });
  }

  loadReviews(productId: number) {
    this.reviewService.getProductReviews(productId, this.reviewPage, 10).subscribe({
      next: (response) => {
        if (this.reviewPage === 1) {
          this.reviews.set(response.reviews);
        } else {
          this.reviews.update(reviews => [...reviews, ...response.reviews]);
        }
        this.hasMoreReviews.set(response.hasMore);
      }
    });
  }

  loadMoreReviews() {
    this.reviewPage++;
    const productId = this.product()?.id;
    if (productId) {
      this.loadReviews(productId);
    }
  }

  loadRelatedProducts(productId: number): void {
    const product = this.product();
    if (product?.categoryId) {
      this.productService.getProductsByCategory(product.categoryId, 4).subscribe({
        next: (products: ProductList[]) => {
          this.relatedProducts.set(products.filter(p => p.id !== productId));
        },
        error: (err) => {
        }
      });
    }
  }

  selectImage(imageUrl: string) {
    this.selectedImage.set(imageUrl);
  }

  increaseQuantity() {
    const max = this.product()?.quantity || 0;
    if (this.quantity < max) {
      this.quantity++;
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    const product = this.product();
    if (!product) return;

    const cartItem = this.buildCartItem(product);
    this.cartService.addItemToLocalCart(cartItem);
  }

  buyNow() {
    const product = this.product();
    if (!product) return;

    const cartItem = this.buildCartItem(product);
    this.cartService.addItemToLocalCart(cartItem);
    this.router.navigate(['/checkout']);
  }

  private buildCartItem(product: Product) {
    return {
      id: 0,
      productId: product.id,
      quantity: this.quantity,
      price: product.price,
      total: product.price * this.quantity,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        primaryImage: product.imageData
          ? `data:${product.imageMimeType};base64,${product.imageData}`
          : product.imageUrl,
        imageUrl: product.imageUrl,
        rating: product.rating,
        reviewCount: product.reviewCount,
        isActive: product.isActive
      }
    };
  }

  isInWishlist(): boolean {
    const product = this.product();
    return product ? this.wishlistService.isInWishlist(product.id) : false;
  }

  addToWishlist() {
    const product = this.product();
    if (product) {
      this.wishlistService.addToWishlist(product);
    }
  }

  removeFromWishlist() {
    const product = this.product();
    if (product) {
      this.wishlistService.removeFromWishlist(product.id);
    }
  }

  canReview(): boolean {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return false;

    const userReview = this.reviews().find(r => r.userId === userId);
    return !userReview;
  }

  submitReview(event: Event) {
    event.preventDefault();

    const product = this.product();
    if (!product) return;

    const review: Partial<Review> = {
      productId: product.id,
      rating: this.newReview.rating,
      title: this.newReview.title,
      comment: this.newReview.comment
    };

    this.reviewService.createReview(review).subscribe({
      next: (newReview) => {
        this.reviews.update(reviews => [newReview, ...reviews]);
        this.resetReviewForm();
      },
      error: () => alert('Failed to submit review. Please try again.')
    });
  }

  private resetReviewForm() {
    this.showReviewForm = false;
    this.newReview = { rating: 5, title: '', comment: '' };
  }

  formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}