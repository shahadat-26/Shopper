import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { CartItem } from '../../models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-navy-900 mb-8">Shopping Cart</h1>

        @if (cartItems().length === 0) {
          <div class="text-center py-12 bg-white rounded-lg shadow">
            <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 class="mt-2 text-lg font-medium text-gray-900">Your cart is empty</h3>
            <p class="mt-1 text-sm text-gray-500">Start adding some products to your cart!</p>
            <div class="mt-6">
              <a routerLink="/products" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-navy-600 hover:bg-navy-700">
                Continue Shopping
              </a>
            </div>
          </div>
        } @else {
          <div class="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
            <div class="lg:col-span-8">
              <ul class="border-t border-b border-gray-200 divide-y divide-gray-200">
                @for (item of cartItems(); track item.id) {
                  <li class="flex py-6 sm:py-10">
                    <div class="flex-shrink-0">
                      <img
                        [src]="item.product?.primaryImage || 'https://via.placeholder.com/150'"
                        [alt]="item.product?.name"
                        class="w-24 h-24 rounded-lg object-center object-cover sm:w-32 sm:h-32"
                      >
                    </div>

                    <div class="ml-4 flex-1 flex flex-col sm:ml-6">
                      <div>
                        <div class="flex justify-between">
                          <h4 class="text-sm">
                            <a [routerLink]="['/products', item.product?.slug]" class="font-medium text-gray-700 hover:text-gray-900">
                              {{ item.product?.name }}
                            </a>
                          </h4>
                          <p class="ml-4 text-sm font-medium text-gray-900">{{ '৳' + item.total.toFixed(2) }}</p>
                        </div>
                        <p class="mt-1 text-sm text-gray-500">Price: {{ '৳' + item.price.toFixed(2) }}</p>
                      </div>

                      <div class="mt-4 flex-1 flex items-end justify-between">
                        <div class="flex items-center">
                          <button
                            (click)="updateQuantity(item, item.quantity - 1)"
                            [disabled]="item.quantity <= 1"
                            class="text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                            </svg>
                          </button>
                          <input
                            type="number"
                            [(ngModel)]="item.quantity"
                            (change)="updateQuantity(item, item.quantity)"
                            min="1"
                            class="mx-2 w-16 text-center border border-gray-300 rounded-md"
                          >
                          <button
                            (click)="updateQuantity(item, item.quantity + 1)"
                            class="text-gray-500 hover:text-gray-700"
                          >
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>

                        <button
                          (click)="removeItem(item)"
                          class="ml-4 text-sm font-medium text-red-600 hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                }
              </ul>
            </div>

            <div class="mt-10 lg:mt-0 lg:col-span-4">
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-lg font-medium text-gray-900">Order Summary</h2>

                <dl class="mt-6 space-y-4">
                  <div class="flex items-center justify-between">
                    <dt class="text-sm text-gray-600">Subtotal</dt>
                    <dd class="text-sm font-medium text-gray-900">{{ '৳' + subtotal().toFixed(2) }}</dd>
                  </div>

                  <div class="flex items-center justify-between">
                    <dt class="text-sm text-gray-600">Shipping</dt>
                    <dd class="text-sm font-medium text-gray-900">{{ '৳' + shipping.toFixed(2) }}</dd>
                  </div>

                  <div class="flex items-center justify-between">
                    <dt class="text-sm text-gray-600">Tax (10%)</dt>
                    <dd class="text-sm font-medium text-gray-900">{{ '৳' + tax().toFixed(2) }}</dd>
                  </div>

                  <div class="border-t pt-4 flex items-center justify-between">
                    <dt class="text-base font-medium text-gray-900">Total</dt>
                    <dd class="text-base font-medium text-navy-600">{{ '৳' + total().toFixed(2) }}</dd>
                  </div>
                </dl>

                <div class="mt-6">
                  @if (authService.isAuthenticated()) {
                    <button
                      (click)="proceedToCheckout()"
                      class="w-full bg-navy-600 text-white py-3 px-4 rounded-md hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-500"
                    >
                      Proceed to Checkout (COD)
                    </button>
                  } @else {
                    <a
                      routerLink="/login"
                      [queryParams]="{returnUrl: '/checkout'}"
                      class="w-full block text-center bg-navy-600 text-white py-3 px-4 rounded-md hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-500"
                    >
                      Login to Checkout
                    </a>
                  }

                  <div class="mt-4 text-center">
                    <p class="text-sm text-gray-500">
                      <svg class="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Cash on Delivery Available
                    </p>
                  </div>
                </div>

                <div class="mt-6 text-center">
                  <a routerLink="/products" class="text-sm text-navy-600 hover:text-navy-500">
                    Continue Shopping
                    <span aria-hidden="true"> &rarr;</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);
  authService = inject(AuthService);
  private router = inject(Router);

  cartItems = signal<CartItem[]>([]);
  shipping = 50;

  subtotal = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.total, 0)
  );

  tax = computed(() => this.subtotal() * 0.1);

  total = computed(() =>
    this.subtotal() + this.tax() + this.shipping
  );

  hasItems = computed(() => this.cartItems().length > 0);

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.cartService.cart$.subscribe(cart => {
      if (cart) {
        this.cartItems.set(cart.items);
      }
    });
  }

  updateQuantity(item: CartItem, newQuantity: number) {
    if (newQuantity < 1) return;

    const currentCart = this.cartService.cart();
    if (!currentCart) return;

    this.updateItemInCart(currentCart, item, newQuantity);
  }

  removeItem(item: CartItem) {
    const currentCart = this.cartService.cart();
    if (!currentCart) return;

    this.removeItemFromCart(currentCart, item);
  }

  private updateItemInCart(cart: any, item: CartItem, newQuantity: number) {
    item.quantity = newQuantity;
    item.total = item.price * newQuantity;

    this.recalculateAndSave(cart);
  }

  private removeItemFromCart(cart: any, item: CartItem) {
    cart.items = cart.items.filter((i: CartItem) => i.productId !== item.productId);
    this.cartItems.set(cart.items);
    this.recalculateAndSave(cart);
  }

  private recalculateAndSave(cart: any) {
    cart.itemCount = cart.items.reduce((sum: number, i: CartItem) => sum + i.quantity, 0);
    cart.subTotal = cart.items.reduce((sum: number, i: CartItem) => sum + i.total, 0);
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  proceedToCheckout() {
    this.router.navigate(['/checkout']);
  }
}