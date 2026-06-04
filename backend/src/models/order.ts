import { CartItem } from "./cart-item";
import { DeliveryStatus } from "./delivery-status";

export interface Order {
  id: string;
  cartId: string;
  items: CartItem[];
  subtotal: number;
  discountCode?: string;
  discountAmount: number;
  total: number;
  deliveryStatus: DeliveryStatus;
  createdAt: string;
}
