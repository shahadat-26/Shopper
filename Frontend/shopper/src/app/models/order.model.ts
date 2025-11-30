import { User } from './user.model';
import { ProductList } from './product.model';

export interface Order {
  id: number;
  orderNumber: string;
  userId?: number;  // Added to match backend DTO
  status: OrderStatus;
  subTotal: number;
  subtotal: number;
  taxAmount: number;
  tax: number;
  shippingAmount: number;
  shippingCost: number;
  discountAmount: number;
  discount: number;
  totalAmount: number;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt?: Date;
  user?: User;
  shippingAddress?: Address;
  billingAddress?: Address;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productSKU: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  total: number;
  status: OrderStatus;
  productImageUrl?: string;
  product?: ProductList;
}

export interface Address {
  id: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
  addressType?: string;
  name?: string;
  street?: string;
  phone?: string;
}

export enum OrderStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Processing = 'Processing',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
  Refunded = 'Refunded'
}

export enum PaymentStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Failed = 'Failed',
  Refunded = 'Refunded'
}

export enum PaymentMethod {
  CreditCard = 'CreditCard',
  DebitCard = 'DebitCard',
  PayPal = 'PayPal',
  CashOnDelivery = 'CashOnDelivery',
  BankTransfer = 'BankTransfer'
}

export interface CreateOrderRequest {
  shippingAddressId: number;
  billingAddressId: number;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
  cartItems?: { productId: number; quantity: number }[];
}

export interface CreateAddressRequest {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
  addressType?: string;
}