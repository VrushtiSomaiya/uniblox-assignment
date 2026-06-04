import { Cart, DiscountCode, Order, Product, Statistics } from "../models";

export interface InMemoryState {
  products: Map<string, Product>;
  carts: Map<string, Cart>;
  orders: Map<string, Order>;
  discountCodes: Map<string, DiscountCode>;
  statistics: Statistics;
  orderCounter: number;
}
