import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order, CreateOrderRequest, CreateAddressRequest, Address, PaymentMethod } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`;

  createCODOrder(orderData: CreateOrderRequest): Observable<Order> {
    orderData.paymentMethod = PaymentMethod.CashOnDelivery;
    return this.http.post<Order>(`${this.apiUrl}/orders/create-cod`, orderData);
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}`);
  }

  getOrderByNumber(orderNumber: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/number/${orderNumber}`);
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/my-orders`);
  }

  cancelOrder(id: number, reason: string = 'User requested cancellation'): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders/${id}/cancel`, { reason: reason });
  }

  getMyAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.apiUrl}/addresses`);
  }

  createAddress(address: CreateAddressRequest): Observable<Address> {
    return this.http.post<Address>(`${this.apiUrl}/addresses`, address);
  }

  updateAddress(id: number, address: CreateAddressRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/addresses/${id}`, address);
  }

  deleteAddress(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/addresses/${id}`);
  }

  setDefaultAddress(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/addresses/${id}/set-default`, {});
  }

  getUserOrders(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/my-orders`);
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}`);
  }

  downloadInvoice(orderId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/orders/${orderId}/invoice`, {
      responseType: 'blob'
    });
  }
}