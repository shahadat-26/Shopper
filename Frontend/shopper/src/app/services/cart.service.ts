import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest, CartSummary } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/cart`;

  private cartSignal = signal<Cart>(this.getInitialCart());

  cartItemCount = computed(() => this.cartSignal().itemCount);
  cartTotal = computed(() => this.cartSignal().subTotal);
  cartItems = computed(() => this.cartSignal().items);

  get cart$() {
    return new Observable<Cart>(subscriber => {
      const unsubscribe = () => {};
      subscriber.next(this.cartSignal());
      return unsubscribe;
    });
  }

  get cart() {
    return this.cartSignal.asReadonly();
  }

  constructor() {
  }

  private getInitialCart(): Cart {
    const cartData = localStorage.getItem('cart');

    if (cartData) {
      try {
        return JSON.parse(cartData);
      } catch {
        return this.createEmptyCart();
      }
    }

    return this.createEmptyCart();
  }

  loadCart(): void {
    const cart = this.getInitialCart();
    this.cartSignal.set(cart);
    this.saveCartToStorage(cart);
  }

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.apiUrl).pipe(
      tap(cart => this.updateCart(cart))
    );
  }

  private updateCart(cart: Cart): void {
    this.cartSignal.set(cart);
    this.saveCartToStorage(cart);
  }

  private saveCartToStorage(cart: Cart): void {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  addToCart(product: any, quantity: number = 1): Observable<Cart> {
    const request = this.buildAddToCartRequest(product, quantity);

    return this.http.post<Cart>(`${this.apiUrl}/add`, request).pipe(
      tap(cart => this.updateCart(cart))
    );
  }

  private buildAddToCartRequest(product: any, quantity: number): AddToCartRequest {
    if ('productId' in product) {
      return product as AddToCartRequest;
    }

    return {
      productId: product.id,
      quantity: quantity,
      price: product.price
    } as any;
  }

  updateCartItem(itemId: number, request: UpdateCartItemRequest): Observable<Cart> {
    return this.http.put<Cart>(`${this.apiUrl}/item/${itemId}`, request).pipe(
      tap(cart => this.updateCart(cart))
    );
  }

  removeFromCart(itemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/item/${itemId}`).pipe(
      tap(cart => this.updateCart(cart))
    );
  }

  clearCart(): Observable<any> {
    return this.http.delete(this.apiUrl).pipe(
      tap(() => {
        const emptyCart = this.createEmptyCart();
        this.cartSignal.set(emptyCart);
        this.saveCartToStorage(emptyCart);
      })
    );
  }

  applyCoupon(code: string): Observable<CartSummary> {
    return this.http.post<CartSummary>(`${this.apiUrl}/coupon`, { code });
  }

  removeCoupon(): Observable<CartSummary> {
    return this.http.delete<CartSummary>(`${this.apiUrl}/coupon`);
  }

  getCartSummary(): Observable<CartSummary> {
    return this.http.get<CartSummary>(`${this.apiUrl}/summary`);
  }

  addItemToLocalCart(item: CartItem): void {
    const currentCart = { ...this.cartSignal() };
    const updatedCart = this.addOrUpdateItem(currentCart, item);
    this.recalculateCartTotals(updatedCart);
    this.cartSignal.set(updatedCart);
    this.saveCartToStorage(updatedCart);
  }

  private createEmptyCart(): Cart {
    return { id: 0, items: [], subTotal: 0, itemCount: 0 } as Cart;
  }

  private addOrUpdateItem(cart: Cart, item: CartItem): Cart {
    const existingItem = cart.items.find(i => i.productId === item.productId);

    if (existingItem) {
      existingItem.quantity += item.quantity;
      existingItem.total = existingItem.price * existingItem.quantity;
    } else {
      cart.items.push({...item, total: item.price * item.quantity});
    }

    return cart;
  }

  private recalculateCartTotals(cart: Cart): void {
    cart.itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    cart.subTotal = cart.items.reduce((sum, i) => sum + i.total, 0);
  }

  clearLocalCart(): void {
    const emptyCart = this.createEmptyCart();
    this.cartSignal.set(emptyCart);
    this.saveCartToStorage(emptyCart);
  }
}