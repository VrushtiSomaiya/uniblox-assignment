import { Cart, DiscountCode, Order, Product, Statistics } from "../models";

export interface ProductRepository {
  list(): Product[];
  getById(productId: string): Product | undefined;
}

export interface CartRepository {
  getById(cartId: string): Cart | undefined;
  save(cart: Cart): void;
}

export interface OrderRepository {
  create(order: Order): void;
  getById(orderId: string): Order | undefined;
  save(order: Order): void;
  list(): Order[];
}

export interface DiscountRepository {
  create(discountCode: DiscountCode): void;
  getByCode(code: string): DiscountCode | undefined;
  save(discountCode: DiscountCode): void;
  list(): DiscountCode[];
}

export interface StatisticsRepository {
  get(): Statistics;
  save(statistics: Statistics): void;
}

export interface SequenceRepository {
  nextOrderNumber(): number;
}
