import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private apiUrl = `${environment.apiUrl}/vendor`;

  constructor(private http: HttpClient) {}

  getVendorProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products`);
  }

  getVendorOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders`);
  }

  getVendorAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/analytics`);
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    const payload = { Status: status };
    return this.http.put(`${this.apiUrl}/orders/${orderId}/status`, payload);
  }

  declineOrder(orderId: number, reason: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/orders/${orderId}/decline`, { reason });
  }

  deliverOrder(orderId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/orders/${orderId}/deliver`, {});
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`);
  }

  getVendorDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`);
  }

  getVendorRevenue(vendorId: number, startDate?: string, endDate?: string): Observable<any> {
    let params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return this.http.get<any>(`${this.apiUrl}/${vendorId}/revenue`, { params });
  }

  getVendorCustomers(vendorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${vendorId}/customers`);
  }

  updateVendorProfile(vendorId: number, profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${vendorId}/profile`, profileData);
  }

  getVendorReviews(vendorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${vendorId}/reviews`);
  }

  bulkUpdateProducts(vendorId: number, products: any[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/${vendorId}/products/bulk-update`, products);
  }

  exportProducts(vendorId: number, format: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${vendorId}/products/export?format=${format}`, {
      responseType: 'blob'
    });
  }

  importProducts(vendorId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${vendorId}/products/import`, formData);
  }
}