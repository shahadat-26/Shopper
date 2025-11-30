import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
  total: number;
  product?: {
    id: number;
    name: string;
    primaryImage?: string;
    imageUrl?: string;
  };
}

interface Order {
  id: number;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: any;
  paymentMethod: string;
  subTotal: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  notes?: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-navy-900">My Orders</h1>
          <p class="mt-2 text-gray-600">Track and manage your order history</p>
        </div>

        @if (orders().length === 0) {
          <div class="bg-white rounded-lg shadow p-12 text-center">
            <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p class="text-gray-500 mb-6">When you place your first order, it will appear here.</p>
            <a routerLink="/products"
               class="inline-flex items-center px-6 py-3 bg-navy-600 text-white rounded-md hover:bg-navy-700">
              Start Shopping
            </a>
          </div>
        } @else {
          <div class="space-y-6">
            @for (order of orders(); track order.orderNumber) {
              <div class="bg-white rounded-lg shadow overflow-hidden">
                <!-- Order Header -->
                <div class="bg-gray-50 px-6 py-4 border-b">
                  <div class="flex flex-wrap items-center justify-between gap-4">
                    <div class="flex items-center gap-6">
                      <div>
                        <p class="text-sm text-gray-600">Order Number</p>
                        <p class="font-semibold text-navy-900">{{ order.orderNumber }}</p>
                      </div>
                      <div>
                        <p class="text-sm text-gray-600">Order Date</p>
                        <p class="font-medium">{{ formatDate(order.createdAt) }}</p>
                      </div>
                      <div>
                        <p class="text-sm text-gray-600">Total Amount</p>
                        <p class="font-semibold text-navy-900">৳{{ order.totalAmount.toFixed(2) }}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-4">
                      <span [class]="getStatusClass(order.status)"
                            class="px-3 py-1 rounded-full text-sm font-medium">
                        {{ order.status }}
                      </span>
                      <button (click)="toggleOrderDetails(order.orderNumber)"
                              class="text-navy-600 hover:text-navy-700 font-medium text-sm">
                        {{ expandedOrders().includes(order.orderNumber) ? 'Hide' : 'View' }} Details
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Order Items (Collapsible) -->
                @if (expandedOrders().includes(order.orderNumber)) {
                  <div class="p-6">
                    <!-- Items List -->
                    <div class="mb-6">
                      <h3 class="font-semibold text-gray-900 mb-4">Order Items</h3>
                      <div class="space-y-4">
                        @for (item of order.items; track item.productId) {
                          <div class="flex items-center gap-4 pb-4 border-b last:border-0">
                            <img [src]="item.product?.primaryImage || 'https://via.placeholder.com/80'"
                                 [alt]="item.product?.name || 'Product'"
                                 class="w-20 h-20 object-cover rounded-lg">
                            <div class="flex-1">
                              <h4 class="font-medium text-gray-900">{{ item.product?.name || 'Product' }}</h4>
                              <p class="text-sm text-gray-600 mt-1">
                                Quantity: {{ item.quantity }} × ৳{{ item.price.toFixed(2) }}
                              </p>
                            </div>
                            <p class="font-medium text-gray-900">৳{{ item.total.toFixed(2) }}</p>
                          </div>
                        }
                      </div>
                    </div>

                    <!-- Order Summary -->
                    <div class="grid md:grid-cols-2 gap-6">
                      <!-- Shipping Address -->
                      <div>
                        <h3 class="font-semibold text-gray-900 mb-3">Shipping Address</h3>
                        <div class="text-sm text-gray-600 space-y-1">
                          <p>{{ order.shippingAddress.addressLine1 }}</p>
                          @if (order.shippingAddress.addressLine2) {
                            <p>{{ order.shippingAddress.addressLine2 }}</p>
                          }
                          <p>{{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} {{ order.shippingAddress.postalCode }}</p>
                          <p>{{ order.shippingAddress.country }}</p>
                        </div>
                      </div>

                      <!-- Payment Summary -->
                      <div>
                        <h3 class="font-semibold text-gray-900 mb-3">Payment Summary</h3>
                        <dl class="space-y-2 text-sm">
                          <div class="flex justify-between">
                            <dt class="text-gray-600">Subtotal</dt>
                            <dd class="font-medium text-gray-900">৳{{ order.subTotal.toFixed(2) }}</dd>
                          </div>
                          <div class="flex justify-between">
                            <dt class="text-gray-600">Shipping</dt>
                            <dd class="font-medium text-gray-900">৳{{ order.shippingAmount.toFixed(2) }}</dd>
                          </div>
                          <div class="flex justify-between">
                            <dt class="text-gray-600">Tax</dt>
                            <dd class="font-medium text-gray-900">৳{{ order.taxAmount.toFixed(2) }}</dd>
                          </div>
                          <div class="flex justify-between pt-2 border-t">
                            <dt class="font-semibold text-gray-900">Total</dt>
                            <dd class="font-semibold text-navy-900">৳{{ order.totalAmount.toFixed(2) }}</dd>
                          </div>
                        </dl>
                        <p class="mt-3 text-sm text-gray-600">
                          Payment Method: <span class="font-medium">{{ order.paymentMethod }}</span>
                        </p>
                      </div>
                    </div>

                    @if (order.notes) {
                      <div class="mt-6 pt-6 border-t">
                        <h3 class="font-semibold text-gray-900 mb-2">Order Notes</h3>
                        <p class="text-sm text-gray-600">{{ order.notes }}</p>
                      </div>
                    }

                    <!-- Action Buttons -->
                    <div class="mt-6 pt-6 border-t flex gap-3">
                      @if (order.status === 'Pending' || order.status === 'Processing') {
                        <button (click)="cancelOrder(order.id, order.orderNumber)"
                                class="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50">
                          Cancel Order
                        </button>
                      }
                      @if (order.status === 'Delivered') {
                        <button class="px-4 py-2 bg-navy-600 text-white rounded-md hover:bg-navy-700">
                          Write a Review
                        </button>
                        <button class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                          Return/Refund
                        </button>
                      }
                      <button (click)="trackOrder(order.orderNumber)"
                              class="px-4 py-2 border border-navy-600 text-navy-600 rounded-md hover:bg-navy-50">
                        Track Order
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class OrdersComponent implements OnInit {
  orders = signal<Order[]>([]);
  expandedOrders = signal<string[]>([]);

  private orderService = inject(OrderService);
  private authService = inject(AuthService);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    const currentUser = this.authService.currentUser();

    if (currentUser?.id) {
      this.orderService.getUserOrders(currentUser.id).subscribe({
        next: (orders: any[]) => this.setOrdersSorted(orders),
        error: () => this.loadOrdersFromLocalStorage()
      });
    } else {
      this.loadOrdersFromLocalStorage();
    }
  }

  private setOrdersSorted(orders: any[]) {
    const sortedOrders = orders?.length > 0
      ? this.sortOrdersByDate(orders)
      : [];
    this.orders.set(sortedOrders);
  }

  private loadOrdersFromLocalStorage() {
    const ordersStr = localStorage.getItem('orders');
    if (!ordersStr) {
      this.orders.set([]);
      return;
    }

    try {
      const orders = JSON.parse(ordersStr);
      this.orders.set(this.sortOrdersByDate(orders));
    } catch {
      this.orders.set([]);
    }
  }

  private sortOrdersByDate(orders: Order[]): Order[] {
    return orders.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  toggleOrderDetails(orderNumber: string) {
    const expanded = this.expandedOrders();
    if (expanded.includes(orderNumber)) {
      this.expandedOrders.set(expanded.filter(n => n !== orderNumber));
    } else {
      this.expandedOrders.set([...expanded, orderNumber]);
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    const baseClass = 'px-3 py-1 rounded-full text-sm font-medium';
    switch (status.toLowerCase()) {
      case 'pending':
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'confirmed':
      case 'processing':
        return `${baseClass} bg-blue-100 text-blue-800`;
      case 'shipped':
        return `${baseClass} bg-purple-100 text-purple-800`;
      case 'delivered':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'cancelled':
        return `${baseClass} bg-red-100 text-red-800`;
      case 'refunded':
        return `${baseClass} bg-gray-100 text-gray-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  }

  cancelOrder(orderId: number, orderNumber: string) {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    this.orderService.cancelOrder(orderId, 'Customer requested cancellation').subscribe({
      next: () => {
        this.updateOrderStatus(orderId, 'Cancelled');
        alert('Order cancelled successfully');
      },
      error: () => {
        alert('Failed to cancel order. Please try again.');
      }
    });
  }

  private updateOrderStatus(orderId: number, status: string) {
    const orders = this.orders();
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status } : order
    );
    this.orders.set(updatedOrders);
  }

  trackOrder(orderNumber: string) {
    alert(`Tracking Order: ${orderNumber}\n\nStatus: Processing\nEstimated Delivery: 3-5 business days`);
  }
}