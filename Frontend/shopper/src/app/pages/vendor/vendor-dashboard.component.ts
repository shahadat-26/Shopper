import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { VendorService } from '../../services/vendor.service';
import { Product } from '../../models/product.model';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 py-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-navy-900">Vendor Dashboard</h1>
          <p class="text-gray-600 mt-2">Manage your products and orders</p>
        </div>

        <div class="grid md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Total Products</p>
                <p class="text-2xl font-bold text-navy-900">{{ totalProducts() }}</p>
              </div>
              <svg class="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Active Products</p>
                <p class="text-2xl font-bold text-green-600">{{ activeProducts() }}</p>
              </div>
              <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Pending Orders</p>
                <p class="text-2xl font-bold text-orange-600">{{ pendingOrders() }}</p>
              </div>
              <svg class="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Total Revenue</p>
                <p class="text-2xl font-bold text-navy-900">৳{{ totalRevenue().toFixed(2) }}</p>
              </div>
              <svg class="w-10 h-10 text-navy-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm">
          <div class="border-b">
            <nav class="flex -mb-px">
              <button (click)="activeTab = 'products'"
                      [class.border-navy-500]="activeTab === 'products'"
                      [class.text-navy-600]="activeTab === 'products'"
                      [class.border-transparent]="activeTab !== 'products'"
                      [class.text-gray-500]="activeTab !== 'products'"
                      class="py-4 px-6 border-b-2 font-medium hover:text-gray-700">
                Products
              </button>
              <button (click)="activeTab = 'orders'"
                      [class.border-navy-500]="activeTab === 'orders'"
                      [class.text-navy-600]="activeTab === 'orders'"
                      [class.border-transparent]="activeTab !== 'orders'"
                      [class.text-gray-500]="activeTab !== 'orders'"
                      class="py-4 px-6 border-b-2 font-medium hover:text-gray-700">
                Orders
              </button>
              <button (click)="activeTab = 'analytics'"
                      [class.border-navy-500]="activeTab === 'analytics'"
                      [class.text-navy-600]="activeTab === 'analytics'"
                      [class.border-transparent]="activeTab !== 'analytics'"
                      [class.text-gray-500]="activeTab !== 'analytics'"
                      class="py-4 px-6 border-b-2 font-medium hover:text-gray-700">
                Analytics
              </button>
            </nav>
          </div>

          <div *ngIf="activeTab === 'products'" class="p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold text-gray-900">Manage Products</h2>
              <button (click)="showProductForm = true"
                      class="px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700">
                Add New Product
              </button>
            </div>

            <div *ngIf="showProductForm" class="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 class="text-lg font-semibold mb-4">{{ editingProduct ? 'Edit' : 'Add New' }} Product</h3>
              <form (submit)="saveProduct($event)" class="space-y-4">
                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input [(ngModel)]="productForm.name" name="name" type="text" required
                           class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                    <input [(ngModel)]="productForm.SKU" name="SKU" type="text" required
                           class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500">
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea [(ngModel)]="productForm.description" name="description" rows="3" required
                            class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500"></textarea>
                </div>

                <div class="grid md:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input [(ngModel)]="productForm.price" name="price" type="number" step="0.01" required
                           class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Compare Price</label>
                    <input [(ngModel)]="productForm.compareAtPrice" name="compareAtPrice" type="number" step="0.01"
                           class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                    <input [(ngModel)]="productForm.quantity" name="quantity" type="number" required
                           class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500">
                  </div>
                </div>

                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select [(ngModel)]="productForm.categoryId" name="categoryId" required
                            class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500">
                      <option value="">Select Category</option>
                      <option *ngFor="let cat of categories()" [value]="cat.id">{{ cat.name }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <input [(ngModel)]="productForm.brand" name="brand" type="text"
                           class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500">
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                  <div class="space-y-2">
                    <input [(ngModel)]="productForm.imageUrl" name="imageUrl" type="url" placeholder="Enter image URL"
                           class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500">
                    <div class="text-sm text-gray-600">OR</div>
                    <input type="file" accept="image/*" (change)="onImageSelected($event)"
                           class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500">
                    <div *ngIf="selectedImagePreview" class="mt-2">
                      <img [src]="selectedImagePreview" alt="Preview" class="w-32 h-32 object-cover rounded">
                    </div>
                  </div>
                </div>

                <div class="flex items-center space-x-4">
                  <label class="flex items-center">
                    <input [(ngModel)]="productForm.isActive" name="isActive" type="checkbox"
                           class="mr-2 w-4 h-4 text-navy-600">
                    <span class="text-sm text-gray-700">Active</span>
                  </label>
                  <label class="flex items-center">
                    <input [(ngModel)]="productForm.isFeatured" name="isFeatured" type="checkbox"
                           class="mr-2 w-4 h-4 text-navy-600">
                    <span class="text-sm text-gray-700">Featured</span>
                  </label>
                </div>

                <div class="flex justify-end space-x-3">
                  <button type="button" (click)="cancelProductEdit()"
                          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit"
                          class="px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700">
                    {{ editingProduct ? 'Update' : 'Add' }} Product
                  </button>
                </div>
              </form>
            </div>

            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let product of vendorProducts()">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <img [src]="getProductImage(product)" [alt]="product.name"
                             class="w-10 h-10 rounded object-cover">
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                          <div class="text-sm text-gray-500">{{ product.category }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ product.sku }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ৳{{ product.price.toFixed(2) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span [class.text-green-600]="product.quantity > 10"
                            [class.text-yellow-600]="product.quantity <= 10 && product.quantity > 0"
                            [class.text-red-600]="product.quantity === 0"
                            class="text-sm font-medium">
                        {{ product.quantity }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span [class.bg-green-100]="product.isActive"
                            [class.text-green-800]="product.isActive"
                            [class.bg-gray-100]="!product.isActive"
                            [class.text-gray-800]="!product.isActive"
                            class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                        {{ product.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button (click)="editProduct(product)" class="text-navy-600 hover:text-navy-900 mr-3">
                        Edit
                      </button>
                      <button (click)="toggleProductStatus(product)"
                              [class.text-green-600]="!product.isActive"
                              [class.hover:text-green-900]="!product.isActive"
                              [class.text-yellow-600]="product.isActive"
                              [class.hover:text-yellow-900]="product.isActive"
                              class="mr-3">
                        {{ product.isActive ? 'Deactivate' : 'Activate' }}
                      </button>
                      <button (click)="deleteProduct(product)" class="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div *ngIf="activeTab === 'orders'" class="p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold text-gray-900">Recent Orders</h2>
              <button (click)="loadVendorData()" class="text-sm text-navy-600 hover:text-navy-700">
                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Refresh
              </button>
            </div>

            <div *ngIf="vendorOrders().length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
              <svg class="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <p class="text-gray-600 mb-2">No orders yet</p>
              <p class="text-sm text-gray-500">Orders containing your products will appear here</p>
            </div>

            <div *ngIf="vendorOrders().length > 0" class="space-y-4">
              <div class="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p class="text-sm text-blue-800">
                  <strong>{{ vendorOrders().length }}</strong> order(s) found containing your products
                </p>
              </div>

              <div *ngFor="let order of vendorOrders()" class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start mb-3">
                  <div>
                    <p class="font-semibold">Order #{{ order.orderNumber }}</p>
                    <p class="text-sm text-gray-600">{{ formatDate(order.createdAt) }}</p>
                    <p class="text-xs text-gray-500 mt-1">Customer ID: {{ order.userId || 'N/A' }}</p>
                  </div>
                  <span [class]="getStatusClass(order.status)"
                        class="px-2 py-1 rounded text-xs font-semibold">
                    {{ order.status }}
                  </span>
                </div>

                <div class="bg-gray-50 rounded p-2 mb-3">
                  <p class="text-xs text-gray-600 mb-2">Items from your store:</p>
                  <div class="space-y-2">
                    <div *ngFor="let item of order.items" class="flex justify-between text-sm">
                      <div class="flex-1">
                        <span class="font-medium">{{ item.productName || 'Product' }}</span>
                        <span class="text-gray-500 ml-2">× {{ item.quantity }}</span>
                      </div>
                      <span class="font-medium">৳{{ ((item.price || 0) * (item.quantity || 1)).toFixed(2) }}</span>
                    </div>
                  </div>
                  <div *ngIf="!order.items || order.items.length === 0" class="text-sm text-gray-500">
                    No item details available
                  </div>
                </div>

                <div class="mt-3 pt-3 border-t flex justify-between items-center">
                  <div>
                    <span class="text-sm text-gray-600">Order Total:</span>
                    <span class="font-semibold ml-2">৳{{ (order.totalAmount || 0).toFixed(2) }}</span>
                  </div>
                  <div class="space-x-2">
                    <button (click)="viewOrder(order)" class="text-navy-600 hover:text-navy-700 text-sm font-medium">
                      View Details
                    </button>
                    <button *ngIf="canProcessOrder(order)" (click)="processOrder(order)"
                            class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                      Accept
                    </button>
                    <button *ngIf="canDeclineOrder(order)" (click)="declineOrder(order)"
                            class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                      Decline
                    </button>
                    <button *ngIf="canStartProcessing(order)" (click)="startProcessing(order)"
                            class="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700">
                      Start Processing
                    </button>
                    <button *ngIf="canShipOrder(order)" (click)="shipOrder(order)"
                            class="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700">
                      Ship
                    </button>
                    <button *ngIf="canDeliverOrder(order)" (click)="deliverOrder(order)"
                            class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                      Deliver
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="activeTab === 'analytics'" class="p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Sales Analytics</h2>

            <div class="grid md:grid-cols-2 gap-6">
              <div class="bg-gray-50 rounded-lg p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
                <div class="space-y-3">
                  <div *ngFor="let product of topProducts()" class="flex justify-between items-center">
                    <span class="text-sm">{{ product.name }}</span>
                    <span class="font-semibold">{{ product.sold }} sold</span>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 rounded-lg p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Revenue by Month</h3>
                <div class="space-y-3">
                  <div *ngFor="let month of revenueByMonth()" class="flex justify-between items-center">
                    <span class="text-sm">{{ month.name }}</span>
                    <span class="font-semibold">৳{{ month.revenue.toFixed(2) }}</span>
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
export class VendorDashboardComponent implements OnInit {
  activeTab = 'products';
  showProductForm = false;
  editingProduct: any = null;
  selectedImage: File | null = null;
  selectedImagePreview: string | null = null;

  vendorProducts = signal<any[]>([]);
  vendorOrders = signal<Order[]>([]);
  categories = signal<any[]>([]);
  topProducts = signal<any[]>([]);
  revenueByMonth = signal<any[]>([]);

  totalProducts = signal(0);
  activeProducts = signal(0);
  pendingOrders = signal(0);
  totalRevenue = signal(0);

  productForm = {
    name: '',
    SKU: '',
    description: '',
    price: 0,
    compareAtPrice: null as number | null,
    quantity: 0,
    categoryId: 0,
    brand: '',
    imageUrl: '',
    imageData: null as string | null,
    imageMimeType: null as string | null,
    isActive: true,
    isFeatured: false
  };

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private orderService: OrderService,
    private vendorService: VendorService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadVendorData();
    this.loadCategories();
  }

  loadVendorData() {
    this.vendorService.getVendorDashboardStats().subscribe({
      next: (stats) => {
        this.totalProducts.set(stats.totalProducts || 0);
        this.activeProducts.set(stats.activeProducts || 0);
        this.pendingOrders.set(stats.pendingOrders || 0);
        this.totalRevenue.set(stats.totalRevenue || 0);

        if (stats.recentProducts) {
          this.vendorProducts.set(stats.recentProducts);
        }

        if (stats.recentOrders) {
          this.vendorOrders.set(stats.recentOrders);
        }
      },
      error: (error) => {
      }
    });

    this.vendorService.getVendorProducts().subscribe({
      next: (products) => {
        this.vendorProducts.set(products);
        this.totalProducts.set(products.length);
        this.activeProducts.set(products.filter(p => p.isActive).length);
      },
      error: (error) => {
      }
    });

    this.vendorService.getVendorOrders().subscribe({
      next: (orders) => {
        this.vendorOrders.set(orders);
        const pending = orders.filter(o =>
          o.status === 'Pending' ||
          o.status === 'Confirmed' ||
          o.status === 'Processing'
        ).length;
        this.pendingOrders.set(pending);

        const revenue = orders.reduce((sum, order) => {
          if (order.status === 'Delivered') {
            return sum + (order.totalAmount || 0);
          }
          return sum;
        }, 0);
        this.totalRevenue.set(revenue);
      },
      error: (error) => {
        this.vendorOrders.set([]);
      }
    });

    this.vendorService.getVendorAnalytics().subscribe({
      next: (analytics) => {
        this.topProducts.set(analytics.topProducts || []);
        this.revenueByMonth.set(analytics.revenueByMonth || []);
      },
      error: (error) => {
      }
    });
  }

  loadCategories() {
    this.vendorService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (error) => {
        alert('Failed to load categories: ' + error.message);
      }
    });
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImagePreview = e.target.result;
        this.productForm.imageData = e.target.result.split(',')[1];
        this.productForm.imageMimeType = file.type;
      };
      reader.readAsDataURL(file);
    }
  }

  async uploadImage(productId: number) {
    if (this.selectedImage) {
      try {
        const response = await this.productService.uploadProductImage(productId, this.selectedImage).toPromise();
        if (response?.imageUrl) {
          this.productForm.imageUrl = response.imageUrl;
        }
      } catch (error) {
      }
    }
  }

  saveProduct(event: Event) {
    event.preventDefault();
    const vendorId = this.authService.currentUser()?.id;
    if (!vendorId) return;

    const productData = {
      name: this.productForm.name,
      SKU: this.productForm.SKU || `SKU-${Date.now()}`,
      description: this.productForm.description || '',
      price: Number(this.productForm.price) || 0,
      compareAtPrice: this.productForm.compareAtPrice,
      quantity: Number(this.productForm.quantity) || 0,
      categoryId: Number(this.productForm.categoryId),
      brand: this.productForm.brand || '',
      imageUrl: this.productForm.imageUrl || 'https://via.placeholder.com/150',
      imageData: this.productForm.imageData,
      imageMimeType: this.productForm.imageMimeType,
      isActive: this.productForm.isActive,
      isFeatured: this.productForm.isFeatured,
      vendorId,
      shortDescription: this.productForm.description?.substring(0, 100) || '',
      metaTitle: this.productForm.name || '',
      metaDescription: this.productForm.description?.substring(0, 160) || '',
      metaKeywords: '',
      images: [],
      attributes: []
    };

    if (this.editingProduct) {
      this.productService.updateProduct(this.editingProduct.id, productData).subscribe({
        next: async (product) => {
          if (this.selectedImage) {
            await this.uploadImage(product.id);
          }
          this.loadVendorData();
          this.cancelProductEdit();
          alert('Product updated successfully!');
        }
      });
    } else {
      this.productService.createProduct(productData).subscribe({
        next: async (product) => {
          if (this.selectedImage) {
            await this.uploadImage(product.id);
          }
          this.loadVendorData();
          this.cancelProductEdit();
          alert('Product added successfully!');
        },
        error: (error) => {
          if (error.error && error.error.errors) {
            const errorMessages = Object.entries(error.error.errors)
              .map(([field, messages]) => `${field}: ${messages}`)
              .join('\n');
            alert('Validation errors:\n' + errorMessages);
          } else {
            alert('Failed to add product: ' + error.message);
          }
        }
      });
    }
  }

  editProduct(product: any) {
    this.editingProduct = product;
    this.productForm = { ...product };
    this.showProductForm = true;
  }

  toggleProductStatus(product: any) {
    const updatedProduct = { ...product, isActive: !product.isActive };
    this.productService.updateProduct(product.id, updatedProduct).subscribe({
      next: () => {
        this.loadVendorData();
      }
    });
  }

  deleteProduct(product: any) {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.loadVendorData();
          alert('Product deleted successfully!');
        }
      });
    }
  }

  cancelProductEdit() {
    this.showProductForm = false;
    this.editingProduct = null;
    this.selectedImage = null;
    this.selectedImagePreview = null;
    this.productForm = {
      name: '',
      SKU: '',
      description: '',
      price: 0,
      compareAtPrice: null,
      quantity: 0,
      categoryId: 0,
      brand: '',
      imageUrl: '',
      imageData: null,
      imageMimeType: null,
      isActive: true,
      isFeatured: false
    };
  }

  getProductImage(product: any): string {
    if (product.imageData && product.imageMimeType) {
      return `data:${product.imageMimeType};base64,${product.imageData}`;
    }
    return product.imageUrl || 'https://via.placeholder.com/150';
  }

  viewOrder(order: Order) {
    this.router.navigate(['/vendor/orders', order.id]);
  }

  canProcessOrder(order: Order): boolean {
    return order.status === 'Pending';
  }

  canDeclineOrder(order: Order): boolean {
    return order.status === 'Pending';
  }

  canStartProcessing(order: Order): boolean {
    return order.status === 'Confirmed';
  }

  canShipOrder(order: Order): boolean {
    return order.status === 'Processing';
  }

  canDeliverOrder(order: Order): boolean {
    return order.status === 'Shipped';
  }

  processOrder(order: Order) {
    if (confirm('Accept this order and mark as Confirmed?')) {
      this.vendorService.updateOrderStatus(order.id, 'Confirmed').subscribe({
        next: () => {
          this.loadVendorData();
          alert('Order accepted and marked as Confirmed!');
        },
        error: (error) => {
          alert('Failed to update order status. Please try again.');
        }
      });
    }
  }

  declineOrder(order: Order) {
    const reason = prompt('Please provide a reason for declining this order:');
    if (reason && reason.trim()) {
      this.vendorService.declineOrder(order.id, reason).subscribe({
        next: () => {
          this.loadVendorData();
          alert('Order declined successfully!');
        },
        error: (error) => {
          alert('Failed to decline order. Please try again.');
        }
      });
    } else if (reason !== null) {
      alert('Please provide a reason for declining the order.');
    }
  }

  startProcessing(order: Order) {
    if (confirm('Start processing this order?')) {
      this.vendorService.updateOrderStatus(order.id, 'Processing').subscribe({
        next: () => {
          this.loadVendorData();
          alert('Order is now being processed!');
        },
        error: (error) => {
          alert('Failed to update order status. Please try again.');
        }
      });
    }
  }

  shipOrder(order: Order) {
    if (confirm('Mark this order as Shipped? The customer will be notified.')) {
      this.vendorService.updateOrderStatus(order.id, 'Shipped').subscribe({
        next: () => {
          this.loadVendorData();
          alert('Order marked as Shipped!');
        },
        error: (error) => {
          alert('Failed to update order status. Please try again.');
        }
      });
    }
  }

  deliverOrder(order: Order) {
    if (confirm('Mark this order as Delivered?')) {
      this.vendorService.deliverOrder(order.id).subscribe({
        next: () => {
          this.loadVendorData();
          alert('Order marked as Delivered!');
        },
        error: (error) => {
          alert('Failed to deliver order. Please try again.');
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
}