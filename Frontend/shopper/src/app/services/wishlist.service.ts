import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private apiUrl = `${environment.apiUrl}/api/wishlist`;
  private wishlistItems = signal<Product[]>([]);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadWishlist();
  }

  getWishlistItems() {
    return this.wishlistItems();
  }

  loadWishlist() {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        this.wishlistItems.set(JSON.parse(savedWishlist));
      } catch (e) {
        this.wishlistItems.set([]);
      }
    }

    if (this.authService.isLoggedIn()) {
      this.syncWithServer();
    }
  }

  syncWithServer() {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return;

    this.http.get<Product[]>(`${this.apiUrl}/user/${userId}`).pipe(
      catchError(() => of([]))
    ).subscribe(items => {
      this.wishlistItems.set(items);
      this.saveToLocalStorage();
    });
  }

  addToWishlist(product: Product) {
    const currentItems = this.wishlistItems();
    if (!currentItems.find(item => item.id === product.id)) {
      this.wishlistItems.set([...currentItems, product]);
      this.saveToLocalStorage();

      if (this.authService.isLoggedIn()) {
        const userId = this.authService.currentUser()?.id;
        if (userId) {
          this.http.post(`${this.apiUrl}`, { userId, productId: product.id }).pipe(
            catchError(() => of(null))
          ).subscribe();
        }
      }
    }
  }

  removeFromWishlist(productId: number) {
    const currentItems = this.wishlistItems();
    this.wishlistItems.set(currentItems.filter(item => item.id !== productId));
    this.saveToLocalStorage();

    if (this.authService.isLoggedIn()) {
      const userId = this.authService.currentUser()?.id;
      if (userId) {
        this.http.delete(`${this.apiUrl}/${userId}/${productId}`).pipe(
          catchError(() => of(null))
        ).subscribe();
      }
    }
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistItems().some(item => item.id === productId);
  }

  clearWishlist() {
    this.wishlistItems.set([]);
    this.saveToLocalStorage();

    if (this.authService.isLoggedIn()) {
      const userId = this.authService.currentUser()?.id;
      if (userId) {
        this.http.delete(`${this.apiUrl}/${userId}/clear`).pipe(
          catchError(() => of(null))
        ).subscribe();
      }
    }
  }

  private saveToLocalStorage() {
    localStorage.setItem('wishlist', JSON.stringify(this.wishlistItems()));
  }
}