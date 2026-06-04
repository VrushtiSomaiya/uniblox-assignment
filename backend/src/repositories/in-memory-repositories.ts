import { Cart, DiscountCode, Order, Statistics } from "../models";
import { inMemoryStore } from "../store/in-memory-store";
import {
  CartRepository,
  DiscountRepository,
  OrderRepository,
  ProductRepository,
  SequenceRepository,
  StatisticsRepository,
} from "./interfaces";

export class InMemoryProductRepository implements ProductRepository {
  public list() {
    return Array.from(inMemoryStore.getState().products.values());
  }

  public getById(productId: string) {
    return inMemoryStore.getState().products.get(productId);
  }
}

export class InMemoryCartRepository implements CartRepository {
  public getById(cartId: string): Cart | undefined {
    return inMemoryStore.getState().carts.get(cartId);
  }

  public save(cart: Cart): void {
    inMemoryStore.getState().carts.set(cart.id, cart);
  }
}

export class InMemoryOrderRepository implements OrderRepository {
  public create(order: Order): void {
    inMemoryStore.getState().orders.set(order.id, order);
  }

  public getById(orderId: string): Order | undefined {
    return inMemoryStore.getState().orders.get(orderId);
  }

  public save(order: Order): void {
    inMemoryStore.getState().orders.set(order.id, order);
  }

  public list(): Order[] {
    return Array.from(inMemoryStore.getState().orders.values());
  }
}

export class InMemoryDiscountRepository implements DiscountRepository {
  public create(discountCode: DiscountCode): void {
    inMemoryStore.getState().discountCodes.set(discountCode.code, discountCode);
  }

  public getByCode(code: string): DiscountCode | undefined {
    return inMemoryStore.getState().discountCodes.get(code);
  }

  public save(discountCode: DiscountCode): void {
    inMemoryStore.getState().discountCodes.set(discountCode.code, discountCode);
  }

  public list(): DiscountCode[] {
    return Array.from(inMemoryStore.getState().discountCodes.values());
  }
}

export class InMemoryStatisticsRepository implements StatisticsRepository {
  public get(): Statistics {
    return inMemoryStore.getState().statistics;
  }

  public save(statistics: Statistics): void {
    inMemoryStore.getState().statistics = statistics;
  }
}

export class InMemorySequenceRepository implements SequenceRepository {
  public nextOrderNumber(): number {
    inMemoryStore.getState().orderCounter += 1;
    return inMemoryStore.getState().orderCounter;
  }
}
