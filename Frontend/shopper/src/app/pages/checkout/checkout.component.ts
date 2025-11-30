import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { CartItem } from '../../models/cart.model';
import { Address, PaymentMethod, CreateOrderRequest } from '../../models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-navy-900 mb-8">Checkout</h1>

        <div class="lg:grid lg:grid-cols-12 lg:gap-x-12">
          <div class="lg:col-span-7">
            <div class="bg-white shadow rounded-lg p-6 mb-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4">Delivery Address</h2>

              @if (savedAddresses().length > 0) {
                <div class="space-y-4 mb-6">
                  @for (address of savedAddresses(); track address.id) {
                    <label class="relative flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                           [class.border-navy-500]="selectedAddressId() === address.id"
                           [class.bg-navy-50]="selectedAddressId() === address.id">
                      <input
                        type="radio"
                        name="address"
                        [value]="address.id"
                        [checked]="selectedAddressId() === address.id"
                        (change)="selectAddress(address.id)"
                        class="h-4 w-4 mt-1 text-navy-600 focus:ring-navy-500"
                      >
                      <div class="ml-3 flex-1">
                        <div class="text-sm">
                          <p class="font-medium text-gray-900">{{ address.addressLine1 }}</p>
                          @if (address.addressLine2) {
                            <p class="text-gray-600">{{ address.addressLine2 }}</p>
                          }
                          <p class="text-gray-600">{{ address.city }}, {{ address.state }} {{ address.postalCode }}</p>
                          <p class="text-gray-600">{{ address.country }}</p>
                        </div>
                        @if (address.isDefault) {
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-navy-100 text-navy-800 mt-2">
                            Default
                          </span>
                        }
                      </div>
                    </label>
                  }
                </div>

                <button
                  (click)="toggleNewAddress()"
                  class="text-sm text-navy-600 hover:text-navy-500"
                >
                  {{ showNewAddress() ? 'Cancel' : '+ Add new address' }}
                </button>
              }

              @if (showNewAddress() || savedAddresses().length === 0) {
                <form [formGroup]="addressForm" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                    <input
                      type="text"
                      formControlName="addressLine1"
                      placeholder="Enter street address"
                      class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-navy-500 focus:border-navy-500 sm:text-sm"
                      [class.border-red-500]="addressForm.get('addressLine1')?.touched && addressForm.get('addressLine1')?.invalid"
                    >
                    @if (addressForm.get('addressLine1')?.touched && addressForm.get('addressLine1')?.invalid) {
                      <p class="mt-1 text-sm text-red-600">Address Line 1 is required</p>
                    }
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      formControlName="addressLine2"
                      placeholder="Apartment, suite, unit, etc."
                      class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-navy-500 focus:border-navy-500 sm:text-sm"
                    >
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input
                        type="text"
                        formControlName="city"
                        placeholder="Enter city"
                        class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-navy-500 focus:border-navy-500 sm:text-sm"
                        [class.border-red-500]="addressForm.get('city')?.touched && addressForm.get('city')?.invalid"
                      >
                      @if (addressForm.get('city')?.touched && addressForm.get('city')?.invalid) {
                        <p class="mt-1 text-sm text-red-600">City is required</p>
                      }
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">State *</label>
                      <input
                        type="text"
                        formControlName="state"
                        placeholder="Enter state"
                        class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-navy-500 focus:border-navy-500 sm:text-sm"
                        [class.border-red-500]="addressForm.get('state')?.touched && addressForm.get('state')?.invalid"
                      >
                      @if (addressForm.get('state')?.touched && addressForm.get('state')?.invalid) {
                        <p class="mt-1 text-sm text-red-600">State is required</p>
                      }
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                      <input
                        type="text"
                        formControlName="country"
                        placeholder="Enter country"
                        value="Bangladesh"
                        class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-navy-500 focus:border-navy-500 sm:text-sm"
                        [class.border-red-500]="addressForm.get('country')?.touched && addressForm.get('country')?.invalid"
                      >
                      @if (addressForm.get('country')?.touched && addressForm.get('country')?.invalid) {
                        <p class="mt-1 text-sm text-red-600">Country is required</p>
                      }
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                      <input
                        type="text"
                        formControlName="postalCode"
                        placeholder="Enter postal code"
                        class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-navy-500 focus:border-navy-500 sm:text-sm"
                        [class.border-red-500]="addressForm.get('postalCode')?.touched && addressForm.get('postalCode')?.invalid"
                      >
                      @if (addressForm.get('postalCode')?.touched && addressForm.get('postalCode')?.invalid) {
                        <p class="mt-1 text-sm text-red-600">Postal Code is required</p>
                      }
                    </div>
                  </div>

                  @if (savedAddresses().length === 0) {
                    <div class="flex items-center">
                      <input
                        type="checkbox"
                        formControlName="isDefault"
                        class="h-4 w-4 text-navy-600 focus:ring-navy-500 border-gray-300 rounded"
                      >
                      <label class="ml-2 block text-sm text-gray-900">
                        Set as default address
                      </label>
                    </div>
                  }
                </form>
              }
            </div>

            <div class="bg-white shadow rounded-lg p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4">Payment Method</h2>

              <div class="border border-navy-500 bg-navy-50 rounded-lg p-4">
                <div class="flex items-center">
                  <input
                    type="radio"
                    checked
                    readonly
                    class="h-4 w-4 text-navy-600 focus:ring-navy-500"
                  >
                  <label class="ml-3 flex items-center">
                    <svg class="w-6 h-6 mr-2 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span class="font-medium text-gray-900">Cash on Delivery (COD)</span>
                  </label>
                </div>
                <p class="mt-2 ml-7 text-sm text-gray-600">
                  Pay with cash when your order is delivered
                </p>
              </div>

              <div class="mt-4 p-4 bg-green-50 rounded-lg">
                <div class="flex">
                  <svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="ml-3 text-sm text-green-800">
                    No advance payment required. Pay when you receive your order.
                  </p>
                </div>
              </div>

              <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700">Order Notes (Optional)</label>
                <textarea
                  [(ngModel)]="orderNotes"
                  rows="3"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-navy-500 focus:border-navy-500 sm:text-sm"
                  placeholder="Any special instructions for delivery..."
                ></textarea>
              </div>
            </div>
          </div>

          <div class="mt-10 lg:mt-0 lg:col-span-5">
            <div class="bg-white shadow rounded-lg p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

              <ul class="divide-y divide-gray-200">
                @for (item of cartItems(); track item.id) {
                  <li class="py-4 flex">
                    <img
                      [src]="item.product?.primaryImage || 'https://via.placeholder.com/60'"
                      [alt]="item.product?.name"
                      class="h-16 w-16 rounded-md object-cover"
                    >
                    <div class="ml-4 flex-1">
                      <h4 class="text-sm font-medium text-gray-900">{{ item.product?.name }}</h4>
                      <p class="mt-1 text-sm text-gray-500">Quantity: {{ item.quantity }}</p>
                    </div>
                    <p class="text-sm font-medium text-gray-900">{{ '৳' + item.total.toFixed(2) }}</p>
                  </li>
                }
              </ul>

              <dl class="mt-6 space-y-4">
                <div class="flex items-center justify-between">
                  <dt class="text-sm text-gray-600">Subtotal</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ '৳' + subtotal().toFixed(2) }}</dd>
                </div>

                <div class="flex items-center justify-between">
                  <dt class="text-sm text-gray-600">Shipping</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ '৳' + shipping.toFixed(2) }}</dd>
                </div>

                <div class="flex items-center justify-between">
                  <dt class="text-sm text-gray-600">Tax (10%)</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ '৳' + tax().toFixed(2) }}</dd>
                </div>

                <div class="border-t pt-4 flex items-center justify-between">
                  <dt class="text-base font-medium text-gray-900">Total Amount</dt>
                  <dd class="text-base font-medium text-navy-600">{{ '৳' + total().toFixed(2) }}</dd>
                </div>
              </dl>

              <button
                (click)="placeOrder()"
                [disabled]="loading() || !isFormValid()"
                class="mt-6 w-full bg-navy-600 text-white py-3 px-4 rounded-md hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                @if (loading()) {
                  <span class="flex items-center justify-center">
                    <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                } @else {
                  Place COD Order
                }
              </button>

              <p class="mt-4 text-center text-sm text-gray-500">
                By placing this order, you agree to our Terms and Conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private router = inject(Router);

  cartItems = signal<CartItem[]>([]);
  savedAddresses = signal<Address[]>([]);
  selectedAddressId = signal<number | null>(null);
  showNewAddress = signal(false);
  loading = signal(false);
  orderNotes = '';

  subtotal = signal(0);
  tax = signal(0);
  total = signal(0);
  shipping = 50;

  addressForm: FormGroup = this.fb.group({
    addressLine1: ['', [Validators.required]],
    addressLine2: [''],
    city: ['Dhaka', [Validators.required]],
    state: ['Dhaka', [Validators.required]],
    country: ['Bangladesh', [Validators.required]],
    postalCode: ['1000', [Validators.required]],
    isDefault: [false]
  });

  ngOnInit() {
    this.loadCart();
    this.loadAddresses();
  }

  loadCart() {
    this.cartService.cart$.subscribe(cart => {
      if (cart && cart.items.length > 0) {
        this.cartItems.set(cart.items);
        this.calculateTotals();
      } else {
        this.router.navigate(['/cart']);
      }
    });
  }

  loadAddresses() {
    this.orderService.getMyAddresses().subscribe({
      next: (addresses) => {
        this.savedAddresses.set(addresses);
        const defaultAddress = addresses.find((a: any) => a.isDefault);
        if (defaultAddress) {
          this.selectedAddressId.set(defaultAddress.id);
        } else if (addresses.length > 0) {
          this.selectedAddressId.set(addresses[0].id);
        }
      },
      error: (error) => {
        this.showNewAddress.set(true);
      }
    });
  }

  calculateTotals() {
    const sub = this.cartItems().reduce((sum, item) => sum + item.total, 0);
    this.subtotal.set(sub);
    this.tax.set(sub * 0.1);
    this.total.set(sub + this.tax() + this.shipping);
  }

  selectAddress(addressId: number) {
    this.selectedAddressId.set(addressId);
    this.showNewAddress.set(false);
  }

  toggleNewAddress() {
    this.showNewAddress.update(v => !v);
    if (!this.showNewAddress()) {
      this.addressForm.reset();
    }
  }

  isFormValid(): boolean {
    if (this.showNewAddress() || this.savedAddresses().length === 0) {
      return this.addressForm.valid;
    }
    return this.selectedAddressId() !== null;
  }

  async placeOrder() {
    if (!this.isFormValid()) {
      Object.keys(this.addressForm.controls).forEach(key => {
        this.addressForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading.set(true);

    try {
      let shippingAddressId: number;
      let billingAddressId: number;

      if (this.showNewAddress() || this.savedAddresses().length === 0) {
        const addressData = {
          addressLine1: this.addressForm.value.addressLine1,
          addressLine2: this.addressForm.value.addressLine2 || '',
          city: this.addressForm.value.city,
          state: this.addressForm.value.state,
          country: this.addressForm.value.country,
          postalCode: this.addressForm.value.postalCode,
          isDefault: this.addressForm.value.isDefault || false,
          addressType: 'both'
        };

        this.orderService.createAddress(addressData).subscribe({
          next: (createdAddress) => {
            shippingAddressId = createdAddress.id;
            billingAddressId = createdAddress.id;

            this.createOrderWithAddresses(shippingAddressId, billingAddressId);
          },
          error: (error) => {
            this.loading.set(false);
            alert('Failed to save address. Please check your address information and try again.');
          }
        });
      } else {
        const selectedAddress = this.savedAddresses().find(a => a.id === this.selectedAddressId());
        if (!selectedAddress) {
          this.loading.set(false);
          alert('Please select a valid address');
          return;
        }

        shippingAddressId = selectedAddress.id;
        billingAddressId = selectedAddress.id;

        this.createOrderWithAddresses(shippingAddressId, billingAddressId);
      }
    } catch (error) {
      this.loading.set(false);
      alert('An error occurred while placing your order. Please try again.');
    }
  }

  private createOrderWithAddresses(shippingAddressId: number, billingAddressId: number) {
    const cartItems = this.cartItems().map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));

    const orderRequest: CreateOrderRequest = {
      shippingAddressId: shippingAddressId,
      billingAddressId: billingAddressId,
      paymentMethod: PaymentMethod.CashOnDelivery,
      couponCode: '',
      notes: this.orderNotes || '',
      cartItems: cartItems
    };

    this.orderService.createCODOrder(orderRequest).subscribe({
      next: (createdOrder) => {
        this.cartService.clearLocalCart();

        this.loading.set(false);
        this.router.navigate(['/orders']);
        alert(`Order placed successfully! Order Number: ${createdOrder.orderNumber}`);
      },
      error: (error) => {
        this.loading.set(false);

        let errorMessage = 'Failed to place order. ';
        if (error.error?.message) {
          errorMessage += error.error.message;
        } else if (error.error?.errors) {
          errorMessage += Object.values(error.error.errors).join(', ');
        } else {
          errorMessage += 'Please try again.';
        }

        alert(errorMessage);
      }
    });
  }
}