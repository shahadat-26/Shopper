import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  updateProfile(userId: number, profileData: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}`, profileData);
  }

  changePassword(userId: number, passwordData: any): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${userId}/change-password`, passwordData);
  }

  getUserAddresses(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}/addresses`);
  }

  addAddress(userId: number, address: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${userId}/addresses`, address);
  }

  updateAddress(addressId: number, address: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/addresses/${addressId}`, address);
  }

  deleteAddress(addressId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/addresses/${addressId}`);
  }

  getUserReviews(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}/reviews`);
  }

  deleteReview(reviewId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reviews/${reviewId}`);
  }

  getUserOrders(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}/orders`);
  }

  getUserWishlist(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}/wishlist`);
  }

  updateUserRole(userId: number, role: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/role`, { role });
  }

  deactivateAccount(userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${userId}/deactivate`, {});
  }

  reactivateAccount(userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${userId}/reactivate`, {});
  }
}