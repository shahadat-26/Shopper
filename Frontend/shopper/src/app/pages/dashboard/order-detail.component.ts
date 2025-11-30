import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-6">
          <a routerLink="/dashboard" class="text-navy-600 hover:text-navy-700">
            ← Back to Dashboard
          </a>
        </div>

        <div *ngIf="loading()" class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600"></div>
        </div>

        <div *ngIf="!loading() && order()" class="bg-white rounded-lg shadow-sm">
          <div class="p-6 border-b">
            <h1 class="text-2xl font-bold text-navy-900">Order #{{ order()!.orderNumber }}</h1>
            <p class="text-gray-600 mt-1">Placed on {{ formatDate(order()!.createdAt) }}</p>
          </div>

          <div class="p-6 space-y-6">
            <!-- Order Status -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h2 class="font-semibold text-gray-900 mb-3">Order Status</h2>
              <div class="flex items-center space-x-4">
                <span [class]="getStatusClass(order()!.status)"
                      class="px-3 py-1 rounded text-sm font-semibold">
                  {{ order()!.status }}
                </span>
                <span class="text-gray-600 text-sm">
                  Last updated: {{ formatDate(order()!.updatedAt) }}
                </span>
              </div>
            </div>

            <!-- Order Items -->
            <div>
              <h2 class="font-semibold text-gray-900 mb-3">Order Items</h2>
              <div class="space-y-3">
                <div *ngFor="let item of order()!.items" class="flex items-center space-x-4 p-3 border rounded">
                  <img [src]="item.productImageUrl" [alt]="item.productName"
                       class="w-20 h-20 object-cover rounded">
                  <div class="flex-1">
                    <h3 class="font-semibold">{{ item.productName }}</h3>
                    <p class="text-sm text-gray-600">
                      Quantity: {{ item.quantity }} × ৳{{ item.price.toFixed(2) }}
                    </p>
                  </div>
                  <p class="font-semibold">৳{{ (item.quantity * item.price).toFixed(2) }}</p>
                </div>
              </div>
            </div>

            <!-- Delivery Address -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h2 class="font-semibold text-gray-900 mb-3">Delivery Address</h2>
              <p class="text-gray-700">{{ order()?.shippingAddress?.name || 'N/A' }}</p>
              <p class="text-gray-600">{{ order()?.shippingAddress?.street || 'N/A' }}</p>
              <p class="text-gray-600">
                {{ order()?.shippingAddress?.city }}, {{ order()?.shippingAddress?.state }} {{ order()?.shippingAddress?.postalCode }}
              </p>
              <p class="text-gray-600">Phone: {{ order()?.shippingAddress?.phone || 'N/A' }}</p>
            </div>

            <!-- Payment Information -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h2 class="font-semibold text-gray-900 mb-3">Payment Information</h2>
              <p class="text-gray-700">
                <span class="font-medium">Method:</span> {{ order()!.paymentMethod }}
              </p>
              <p class="text-gray-700">
                <span class="font-medium">Status:</span>
                <span [class.text-green-600]="order()!.paymentStatus === 'Completed'"
                      [class.text-yellow-600]="order()!.paymentStatus === 'Pending'">
                  {{ order()!.paymentStatus || 'N/A' }}
                </span>
              </p>
            </div>

            <!-- Order Summary -->
            <div class="border-t pt-4">
              <h2 class="font-semibold text-gray-900 mb-3">Order Summary</h2>
              <div class="space-y-2">
                <div class="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>৳{{ order()!.subtotal.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>৳{{ order()!.tax.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{{ order()!.shippingCost > 0 ? '৳' + order()!.shippingCost.toFixed(2) : 'Free' }}</span>
                </div>
                <div *ngIf="order()!.discount > 0" class="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-৳{{ order()!.discount.toFixed(2) }}</span>
                </div>
                <div class="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span class="text-navy-900">৳{{ order()!.totalAmount.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <!-- Order Actions -->
            <div class="flex justify-between items-center pt-4">
              <button *ngIf="canCancelOrder()" (click)="cancelOrder()"
                      class="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50">
                Cancel Order
              </button>
              <button (click)="downloadInvoice()"
                      class="px-4 py-2 bg-navy-600 text-white rounded hover:bg-navy-700">
                Download Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class OrderDetailComponent implements OnInit {
  order = signal<Order | null>(null);
  loading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const orderId = +params['id'];
      if (orderId) {
        this.loadOrder(orderId);
      }
    });
  }

  loadOrder(orderId: number) {
    this.loading.set(true);
    this.orderService.getOrderById(orderId).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
      }
    });
  }

  canCancelOrder(): boolean {
    const status = this.order()?.status;
    return status === 'Pending' || status === 'Confirmed';
  }

  cancelOrder() {
    if (confirm('Are you sure you want to cancel this order?')) {
      const orderId = this.order()?.id;
      if (orderId) {
        this.orderService.cancelOrder(orderId).subscribe({
          next: () => {
            this.loadOrder(orderId);
            alert('Order cancelled successfully!');
          }
        });
      }
    }
  }

  downloadInvoice() {
    const orderId = this.order()?.id;
    if (orderId) {
      this.orderService.downloadInvoice(orderId).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `invoice-${this.order()?.orderNumber}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
        }
      });
    }
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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