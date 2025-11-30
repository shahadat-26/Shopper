import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-navy-900 mb-8 text-center">Track Your Order</h1>

        <!-- Search Bar -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form (submit)="trackOrder($event)" class="flex space-x-3">
            <input [(ngModel)]="orderNumber" name="orderNumber" type="text"
                   placeholder="Enter Order Number (e.g., ORD-2024-001)"
                   class="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500">
            <button type="submit"
                    class="px-6 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700">
              Track Order
            </button>
          </form>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading()" class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600"></div>
        </div>

        <!-- Order Not Found -->
        <div *ngIf="!loading() && searchPerformed() && !order()" class="bg-white rounded-lg shadow-sm p-12 text-center">
          <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p class="text-gray-600">We couldn't find an order with that number. Please check and try again.</p>
        </div>

        <!-- Order Tracking Details -->
        <div *ngIf="!loading() && order()" class="space-y-6">
          <!-- Order Info Card -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h2 class="text-xl font-semibold text-navy-900">Order #{{ order()!.orderNumber }}</h2>
                <p class="text-gray-600 mt-1">Placed on {{ formatDate(order()!.createdAt) }}</p>
              </div>
              <span [class]="getStatusClass(order()!.status)"
                    class="px-3 py-1 rounded text-sm font-semibold">
                {{ order()!.status }}
              </span>
            </div>

            <div class="border-t pt-4">
              <p class="text-gray-700">
                <span class="font-medium">Estimated Delivery:</span>
                {{ getEstimatedDelivery() }}
              </p>
              <p class="text-gray-700 mt-2">
                <span class="font-medium">Shipping To:</span>
                {{ order()?.shippingAddress?.city }}, {{ order()?.shippingAddress?.state }}
              </p>
            </div>
          </div>

          <!-- Tracking Timeline -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-navy-900 mb-6">Tracking Timeline</h3>

            <div class="relative">
              <div class="absolute left-8 top-8 bottom-0 w-0.5 bg-gray-200"></div>

              <div class="space-y-8">
                <!-- Order Placed -->
                <div class="flex items-start">
                  <div [class.bg-green-500]="isStepCompleted('Pending')"
                       [class.bg-gray-300]="!isStepCompleted('Pending')"
                       class="w-16 h-16 rounded-full flex items-center justify-center text-white">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                  </div>
                  <div class="ml-6 flex-1">
                    <h4 class="font-semibold text-gray-900">Order Placed</h4>
                    <p class="text-sm text-gray-600 mt-1">Your order has been received</p>
                    <p class="text-xs text-gray-500 mt-1">{{ formatDate(order()!.createdAt) }}</p>
                  </div>
                </div>

                <!-- Order Confirmed -->
                <div class="flex items-start">
                  <div [class.bg-green-500]="isStepCompleted('Confirmed')"
                       [class.bg-gray-300]="!isStepCompleted('Confirmed')"
                       class="w-16 h-16 rounded-full flex items-center justify-center text-white">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div class="ml-6 flex-1">
                    <h4 class="font-semibold text-gray-900">Order Confirmed</h4>
                    <p class="text-sm text-gray-600 mt-1">Your order has been confirmed and is being processed</p>
                    <p *ngIf="getTrackingDate('Confirmed')" class="text-xs text-gray-500 mt-1">
                      {{ getTrackingDate('Confirmed') }}
                    </p>
                  </div>
                </div>

                <!-- Processing -->
                <div class="flex items-start">
                  <div [class.bg-green-500]="isStepCompleted('Processing')"
                       [class.bg-gray-300]="!isStepCompleted('Processing')"
                       class="w-16 h-16 rounded-full flex items-center justify-center text-white">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                  </div>
                  <div class="ml-6 flex-1">
                    <h4 class="font-semibold text-gray-900">Processing</h4>
                    <p class="text-sm text-gray-600 mt-1">Your order is being packed and prepared for shipping</p>
                    <p *ngIf="getTrackingDate('Processing')" class="text-xs text-gray-500 mt-1">
                      {{ getTrackingDate('Processing') }}
                    </p>
                  </div>
                </div>

                <!-- Shipped -->
                <div class="flex items-start">
                  <div [class.bg-green-500]="isStepCompleted('Shipped')"
                       [class.bg-gray-300]="!isStepCompleted('Shipped')"
                       class="w-16 h-16 rounded-full flex items-center justify-center text-white">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path>
                    </svg>
                  </div>
                  <div class="ml-6 flex-1">
                    <h4 class="font-semibold text-gray-900">Shipped</h4>
                    <p class="text-sm text-gray-600 mt-1">Your order is on its way</p>
                    <p *ngIf="getTrackingDate('Shipped')" class="text-xs text-gray-500 mt-1">
                      {{ getTrackingDate('Shipped') }}
                    </p>
                    <p *ngIf="order()!.trackingNumber" class="text-sm text-navy-600 mt-2">
                      Tracking Number: {{ order()!.trackingNumber }}
                    </p>
                  </div>
                </div>

                <!-- Delivered -->
                <div class="flex items-start">
                  <div [class.bg-green-500]="isStepCompleted('Delivered')"
                       [class.bg-gray-300]="!isStepCompleted('Delivered')"
                       class="w-16 h-16 rounded-full flex items-center justify-center text-white">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                    </svg>
                  </div>
                  <div class="ml-6 flex-1">
                    <h4 class="font-semibold text-gray-900">Delivered</h4>
                    <p class="text-sm text-gray-600 mt-1">Your order has been delivered</p>
                    <p *ngIf="getTrackingDate('Delivered')" class="text-xs text-gray-500 mt-1">
                      {{ getTrackingDate('Delivered') }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-navy-900 mb-4">Order Items</h3>
            <div class="space-y-3">
              <div *ngFor="let item of order()!.items" class="flex items-center space-x-4">
                <img [src]="item.productImageUrl" [alt]="item.productName"
                     class="w-16 h-16 object-cover rounded">
                <div class="flex-1">
                  <h4 class="font-medium">{{ item.productName }}</h4>
                  <p class="text-sm text-gray-600">Quantity: {{ item.quantity }}</p>
                </div>
                <p class="font-semibold">৳{{ (item.quantity * item.price).toFixed(2) }}</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex justify-between items-center">
              <a [routerLink]="['/orders', order()!.id]"
                 class="text-navy-600 hover:text-navy-700 font-medium">
                View Full Order Details →
              </a>
              <button *ngIf="order()!.status === 'Delivered'"
                      class="px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700">
                Download Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TrackOrderComponent implements OnInit {
  orderNumber = '';
  order = signal<Order | null>(null);
  loading = signal(false);
  searchPerformed = signal(false);

  trackingSteps = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['orderNumber']) {
        this.orderNumber = params['orderNumber'];
        this.searchOrder();
      }
    });
  }

  trackOrder(event: Event) {
    event.preventDefault();
    this.searchOrder();
  }

  searchOrder() {
    if (!this.orderNumber) return;

    this.loading.set(true);
    this.searchPerformed.set(true);

    this.orderService.getOrderByNumber(this.orderNumber).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
      },
      error: () => {
        this.order.set(null);
        this.loading.set(false);
      }
    });
  }

  isStepCompleted(step: string): boolean {
    const order = this.order();
    if (!order) return false;

    const statusOrder = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
    const currentIndex = statusOrder.indexOf(order.status);
    const stepIndex = statusOrder.indexOf(step);

    return stepIndex <= currentIndex;
  }

  getTrackingDate(status: string): string | null {
    if (!this.isStepCompleted(status)) return null;

    const order = this.order();
    if (!order) return null;

    const date = new Date(order.createdAt);
    const statusOrder = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
    const daysToAdd = statusOrder.indexOf(status);

    date.setDate(date.getDate() + daysToAdd);
    return this.formatDate(date.toISOString());
  }

  getEstimatedDelivery(): string {
    const order = this.order();
    if (!order) return '';

    const date = new Date(order.createdAt);
    date.setDate(date.getDate() + 7);

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'Pending': 'bg-yellow-100 text-yellow-700',
      'Confirmed': 'bg-blue-100 text-blue-700',
      'Processing': 'bg-indigo-100 text-indigo-700',
      'Shipped': 'bg-purple-100 text-purple-700',
      'Delivered': 'bg-green-100 text-green-700',
      'Cancelled': 'bg-red-100 text-red-700',
      'Refunded': 'bg-gray-100 text-gray-700'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-700';
  }
}