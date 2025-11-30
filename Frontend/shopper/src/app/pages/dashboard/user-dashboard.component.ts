import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 py-8">
        <div class="grid md:grid-cols-4 gap-6">
          <!-- Sidebar -->
          <div class="md:col-span-1">
            <div class="bg-white rounded-lg shadow-sm p-6">
              <div class="flex items-center space-x-4 mb-6">
                <div class="w-16 h-16 bg-navy-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {{ getUserInitials() }}
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">{{ currentUser()?.firstName }} {{ currentUser()?.lastName }}</h3>
                  <p class="text-sm text-gray-600">{{ currentUser()?.email }}</p>
                </div>
              </div>

              <nav class="space-y-1">
                <button (click)="activeTab = 'overview'"
                        [class.bg-navy-50]="activeTab === 'overview'"
                        [class.text-navy-600]="activeTab === 'overview'"
                        [class.border-l-4]="activeTab === 'overview'"
                        [class.border-navy-600]="activeTab === 'overview'"
                        class="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors">
                  Dashboard
                </button>
                <button (click)="activeTab = 'profile'"
                        [class.bg-navy-50]="activeTab === 'profile'"
                        [class.text-navy-600]="activeTab === 'profile'"
                        [class.border-l-4]="activeTab === 'profile'"
                        [class.border-navy-600]="activeTab === 'profile'"
                        class="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors">
                  Profile Settings
                </button>
                <button (click)="activeTab = 'orders'"
                        [class.bg-navy-50]="activeTab === 'orders'"
                        [class.text-navy-600]="activeTab === 'orders'"
                        [class.border-l-4]="activeTab === 'orders'"
                        [class.border-navy-600]="activeTab === 'orders'"
                        class="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors">
                  My Orders
                </button>
                <button (click)="activeTab = 'addresses'"
                        [class.bg-navy-50]="activeTab === 'addresses'"
                        [class.text-navy-600]="activeTab === 'addresses'"
                        [class.border-l-4]="activeTab === 'addresses'"
                        [class.border-navy-600]="activeTab === 'addresses'"
                        class="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors">
                  Addresses
                </button>
                <button (click)="activeTab = 'wishlist'"
                        [class.bg-navy-50]="activeTab === 'wishlist'"
                        [class.text-navy-600]="activeTab === 'wishlist'"
                        [class.border-l-4]="activeTab === 'wishlist'"
                        [class.border-navy-600]="activeTab === 'wishlist'"
                        class="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors">
                  Wishlist
                </button>
                <button (click)="activeTab = 'reviews'"
                        [class.bg-navy-50]="activeTab === 'reviews'"
                        [class.text-navy-600]="activeTab === 'reviews'"
                        [class.border-l-4]="activeTab === 'reviews'"
                        [class.border-navy-600]="activeTab === 'reviews'"
                        class="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors">
                  My Reviews
                </button>
                <button (click)="logout()"
                        class="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors">
                  Logout
                </button>
              </nav>
            </div>
          </div>

          <!-- Main Content -->
          <div class="md:col-span-3">
            <!-- Overview Tab -->
            <div *ngIf="activeTab === 'overview'" class="space-y-6">
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-2xl font-bold text-navy-900 mb-6">Dashboard Overview</h2>

                <div class="grid md:grid-cols-3 gap-4 mb-6">
                  <div class="bg-blue-50 rounded-lg p-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm text-gray-600">Total Orders</p>
                        <p class="text-2xl font-bold text-navy-900">{{ totalOrders() }}</p>
                      </div>
                      <svg class="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                      </svg>
                    </div>
                  </div>

                  <div class="bg-green-50 rounded-lg p-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm text-gray-600">Delivered</p>
                        <p class="text-2xl font-bold text-green-600">{{ deliveredOrders() }}</p>
                      </div>
                      <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>

                  <div class="bg-orange-50 rounded-lg p-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm text-gray-600">Pending</p>
                        <p class="text-2xl font-bold text-orange-600">{{ pendingOrders() }}</p>
                      </div>
                      <svg class="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <div class="border-t pt-6">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                  <div *ngIf="recentOrders().length === 0" class="text-center py-8 text-gray-500">
                    No orders yet
                  </div>
                  <div *ngIf="recentOrders().length > 0" class="space-y-3">
                    <div *ngFor="let order of recentOrders()" class="border rounded-lg p-4 hover:bg-gray-50">
                      <div class="flex justify-between items-center">
                        <div>
                          <p class="font-semibold">#{{ order.orderNumber }}</p>
                          <p class="text-sm text-gray-600">{{ formatDate(order.createdAt) }}</p>
                        </div>
                        <div class="text-right">
                          <p class="font-semibold">৳{{ order.totalAmount.toFixed(2) }}</p>
                          <span [class]="getStatusClass(order.status)" class="text-sm px-2 py-1 rounded">
                            {{ order.status }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Profile Tab -->
            <div *ngIf="activeTab === 'profile'" class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-2xl font-bold text-navy-900 mb-6">Profile Settings</h2>

              <form (submit)="updateProfile($event)" class="space-y-4">
                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input [(ngModel)]="profileForm.firstName" name="firstName" type="text" required
                           class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input [(ngModel)]="profileForm.lastName" name="lastName" type="text" required
                           class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500">
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input [(ngModel)]="profileForm.email" name="email" type="email" required
                         class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input [(ngModel)]="profileForm.phoneNumber" name="phoneNumber" type="tel"
                         class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500">
                </div>

                <div class="border-t pt-4">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <input [(ngModel)]="passwordForm.currentPassword" name="currentPassword" type="password"
                             class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input [(ngModel)]="passwordForm.newPassword" name="newPassword" type="password"
                             class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                      <input [(ngModel)]="passwordForm.confirmPassword" name="confirmPassword" type="password"
                             class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500">
                    </div>
                  </div>
                </div>

                <div class="flex justify-end space-x-3 pt-4">
                  <button type="button" (click)="cancelEdit()"
                          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit"
                          class="px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            <!-- Orders Tab -->
            <div *ngIf="activeTab === 'orders'" class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-2xl font-bold text-navy-900 mb-6">My Orders</h2>

              <div *ngIf="orders().length === 0" class="text-center py-12">
                <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                <p class="text-gray-600 mb-4">Start shopping to see your orders here!</p>
                <a routerLink="/products" class="text-navy-600 hover:text-navy-700 font-medium">
                  Browse Products →
                </a>
              </div>

              <div *ngIf="orders().length > 0" class="space-y-4">
                <div *ngFor="let order of orders()" class="border rounded-lg overflow-hidden">
                  <div class="bg-gray-50 px-6 py-4">
                    <div class="flex justify-between items-center">
                      <div class="flex space-x-6">
                        <div>
                          <p class="text-sm text-gray-600">Order Number</p>
                          <p class="font-semibold">#{{ order.orderNumber }}</p>
                        </div>
                        <div>
                          <p class="text-sm text-gray-600">Order Date</p>
                          <p class="font-semibold">{{ formatDate(order.createdAt) }}</p>
                        </div>
                        <div>
                          <p class="text-sm text-gray-600">Total Amount</p>
                          <p class="font-semibold">৳{{ order.totalAmount.toFixed(2) }}</p>
                        </div>
                      </div>
                      <span [class]="getStatusClass(order.status)" class="px-3 py-1 rounded text-sm font-semibold">
                        {{ order.status }}
                      </span>
                    </div>
                  </div>

                  <div class="p-6">
                    <div class="space-y-3">
                      <div *ngFor="let item of order.items" class="flex items-center space-x-4">
                        <img [src]="item.productImageUrl" [alt]="item.productName"
                             class="w-16 h-16 object-cover rounded">
                        <div class="flex-1">
                          <h4 class="font-semibold">{{ item.productName }}</h4>
                          <p class="text-sm text-gray-600">Qty: {{ item.quantity }} × ৳{{ item.price.toFixed(2) }}</p>
                        </div>
                        <p class="font-semibold">৳{{ (item.quantity * item.price).toFixed(2) }}</p>
                      </div>
                    </div>

                    <div class="mt-4 pt-4 border-t flex justify-between items-center">
                      <button (click)="viewOrderDetails(order)"
                              class="text-navy-600 hover:text-navy-700 font-medium">
                        View Details
                      </button>
                      <div class="flex space-x-3">
                        <button *ngIf="canTrackOrder(order)" (click)="trackOrder(order)"
                                class="px-4 py-2 border border-navy-600 text-navy-600 rounded hover:bg-navy-50">
                          Track Order
                        </button>
                        <button *ngIf="canCancelOrder(order)" (click)="cancelOrder(order)"
                                class="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50">
                          Cancel Order
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Addresses Tab -->
            <div *ngIf="activeTab === 'addresses'" class="bg-white rounded-lg shadow-sm p-6">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-navy-900">Saved Addresses</h2>
                <button (click)="showAddressForm = true"
                        class="px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700">
                  Add New Address
                </button>
              </div>

              <div *ngIf="addresses().length === 0 && !showAddressForm" class="text-center py-12">
                <p class="text-gray-600 mb-4">No saved addresses yet</p>
              </div>

              <div *ngIf="showAddressForm" class="border rounded-lg p-6 mb-6">
                <h3 class="text-lg font-semibold mb-4">{{ editingAddress ? 'Edit' : 'Add New' }} Address</h3>
                <form (submit)="saveAddress($event)" class="space-y-4">
                  <div class="grid md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                      <input [(ngModel)]="addressForm.street" name="street" type="text" required
                             class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input [(ngModel)]="addressForm.city" name="city" type="text" required
                             class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input [(ngModel)]="addressForm.state" name="state" type="text" required
                             class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                      <input [(ngModel)]="addressForm.postalCode" name="postalCode" type="text" required
                             class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500">
                    </div>
                  </div>
                  <div class="flex items-center">
                    <input [(ngModel)]="addressForm.isDefault" name="isDefault" type="checkbox"
                           class="mr-2 w-4 h-4 text-navy-600">
                    <label class="text-sm text-gray-700">Set as default address</label>
                  </div>
                  <div class="flex justify-end space-x-3">
                    <button type="button" (click)="cancelAddressEdit()"
                            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      Cancel
                    </button>
                    <button type="submit"
                            class="px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700">
                      Save Address
                    </button>
                  </div>
                </form>
              </div>

              <div class="grid md:grid-cols-2 gap-4">
                <div *ngFor="let address of addresses()" class="border rounded-lg p-4">
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="font-semibold">{{ address.street }}</p>
                      <p class="text-gray-600">{{ address.city }}, {{ address.state }}</p>
                      <p class="text-gray-600">{{ address.postalCode }}</p>
                      <span *ngIf="address.isDefault" class="inline-block mt-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                        Default
                      </span>
                    </div>
                    <div class="flex space-x-2">
                      <button (click)="editAddress(address)" class="text-navy-600 hover:text-navy-700">
                        Edit
                      </button>
                      <button (click)="deleteAddress(address)" class="text-red-600 hover:text-red-700">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Wishlist Tab -->
            <div *ngIf="activeTab === 'wishlist'" class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-2xl font-bold text-navy-900 mb-6">My Wishlist</h2>
              <p class="text-gray-600 mb-4">Manage your saved items</p>
              <a routerLink="/wishlist" class="text-navy-600 hover:text-navy-700 font-medium">
                Go to Wishlist →
              </a>
            </div>

            <!-- Reviews Tab -->
            <div *ngIf="activeTab === 'reviews'" class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-2xl font-bold text-navy-900 mb-6">My Reviews</h2>

              <div *ngIf="userReviews().length === 0" class="text-center py-12">
                <p class="text-gray-600 mb-4">You haven't written any reviews yet</p>
                <a routerLink="/orders" class="text-navy-600 hover:text-navy-700 font-medium">
                  View your orders to review products →
                </a>
              </div>

              <div *ngIf="userReviews().length > 0" class="space-y-4">
                <div *ngFor="let review of userReviews()" class="border rounded-lg p-4">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <h4 class="font-semibold">{{ review.productName }}</h4>
                      <div class="flex items-center mt-1">
                        <span *ngFor="let star of [1,2,3,4,5]"
                              [class.text-yellow-400]="star <= review.rating"
                              [class.text-gray-300]="star > review.rating"
                              class="text-sm">★</span>
                        <span class="ml-2 text-sm text-gray-600">{{ formatDate(review.createdAt) }}</span>
                      </div>
                      <p class="mt-2 text-gray-700">{{ review.comment }}</p>
                    </div>
                    <button (click)="deleteReview(review)" class="text-red-600 hover:text-red-700 text-sm">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private orderService = inject(OrderService);
  private userService = inject(UserService);
  private router = inject(Router);

  activeTab = 'overview';
  currentUser = signal<User | null>(null);
  orders = signal<Order[]>([]);
  addresses = signal<any[]>([]);
  userReviews = signal<any[]>([]);
  showAddressForm = false;
  editingAddress: any = null;

  profileForm = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  };

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  addressForm = {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: false
  };

  totalOrders = computed(() => this.orders().length);
  deliveredOrders = computed(() => this.orders().filter(o => o.status === 'Delivered').length);
  pendingOrders = computed(() => this.orders().filter(o => ['Pending', 'Processing', 'Shipped'].includes(o.status)).length);
  recentOrders = computed(() => this.orders().slice(0, 5));

  ngOnInit() {
    if (this.authService.isVendor()) {
      window.location.href = '/vendor';
      return;
    }
    if (this.authService.isAdmin()) {
      window.location.href = '/admin';
      return;
    }

    this.loadUserData();
    this.loadOrders();
    this.loadAddresses();
    this.loadUserReviews();
  }

  loadUserData() {
    const user = this.authService.currentUser();
    if (user) {
      this.currentUser.set(user);
      this.profileForm = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber || ''
      };
    }
  }

  loadOrders() {
    const userId = this.currentUser()?.id;
    if (!userId) return;

    this.orderService.getUserOrders(userId).subscribe({
      next: (orders) => this.orders.set(orders),
      error: () => this.orders.set([])
    });
  }

  loadAddresses() {
    const userId = this.currentUser()?.id;
    if (!userId) return;

    this.userService.getUserAddresses(userId).subscribe({
      next: (addresses) => this.addresses.set(addresses),
      error: () => this.addresses.set([])
    });
  }

  loadUserReviews() {
    const userId = this.currentUser()?.id;
    if (!userId) return;

    this.userService.getUserReviews(userId).subscribe({
      next: (reviews) => this.userReviews.set(reviews),
      error: () => this.userReviews.set([])
    });
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return '';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  updateProfile(event: Event) {
    event.preventDefault();
    const userId = this.currentUser()?.id;
    if (!userId) return;

    this.userService.updateProfile(userId, this.profileForm).subscribe({
      next: (updatedUser) => {
        this.currentUser.set(updatedUser);
        this.authService.updateCurrentUser(updatedUser);
        alert('Profile updated successfully!');
      },
      error: () => alert('Failed to update profile. Please try again.')
    });

    if (this.passwordForm.currentPassword && this.passwordForm.newPassword) {
      this.handlePasswordChange(userId);
    }
  }

  private handlePasswordChange(userId: number) {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    this.userService.changePassword(userId, this.passwordForm).subscribe({
      next: () => {
        alert('Password changed successfully!');
        this.resetPasswordForm();
      },
      error: () => alert('Failed to change password. Please check your current password.')
    });
  }

  private resetPasswordForm() {
    this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  }

  cancelEdit() {
    this.loadUserData();
  }

  saveAddress(event: Event) {
    event.preventDefault();
    const userId = this.currentUser()?.id;
    if (!userId) return;

    if (this.editingAddress) {
      this.userService.updateAddress(this.editingAddress.id, this.addressForm).subscribe({
        next: () => {
          this.loadAddresses();
          this.cancelAddressEdit();
        }
      });
    } else {
      this.userService.addAddress(userId, this.addressForm).subscribe({
        next: () => {
          this.loadAddresses();
          this.cancelAddressEdit();
        }
      });
    }
  }

  editAddress(address: any) {
    this.editingAddress = address;
    this.addressForm = { ...address };
    this.showAddressForm = true;
  }

  deleteAddress(address: any) {
    if (confirm('Are you sure you want to delete this address?')) {
      this.userService.deleteAddress(address.id).subscribe({
        next: () => {
          this.loadAddresses();
        }
      });
    }
  }

  cancelAddressEdit() {
    this.showAddressForm = false;
    this.editingAddress = null;
    this.addressForm = { street: '', city: '', state: '', postalCode: '', isDefault: false };
  }

  viewOrderDetails(order: Order) {
    this.router.navigate(['/orders', order.id]);
  }

  trackOrder(order: Order) {
    this.router.navigate(['/track-order', order.orderNumber]);
  }

  canTrackOrder(order: Order): boolean {
    return ['Processing', 'Shipped'].includes(order.status);
  }

  canCancelOrder(order: Order): boolean {
    return ['Pending', 'Confirmed'].includes(order.status);
  }

  cancelOrder(order: Order) {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(order.id).subscribe({
        next: () => {
          this.loadOrders();
          alert('Order cancelled successfully!');
        }
      });
    }
  }

  deleteReview(review: any) {
    if (confirm('Are you sure you want to delete this review?')) {
      this.userService.deleteReview(review.id).subscribe({
        next: () => {
          this.loadUserReviews();
        }
      });
    }
  }

  formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.router.navigate(['/']);
    }
  }
}