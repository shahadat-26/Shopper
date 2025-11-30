import { ProductList } from './product.model';

export interface Cart {
  id: number;
  userId?: number;
  items: CartItem[];
  subTotal: number;
  itemCount: number;
}

export interface CartItem {
  id: number;
  productId: number;
  variationId?: number;
  quantity: number;
  price: number;
  total: number;
  product?: ProductList;
}

export interface AddToCartRequest {
  productId: number;
  variationId?: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartSummary {
  subTotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  couponCode?: string;
}