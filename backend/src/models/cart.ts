import { CartItem } from "./cart-item";

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  updatedAt: string;
}
