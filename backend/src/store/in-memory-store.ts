import { Statistics } from "../models";
import { seedProducts } from "./seed-products";
import { InMemoryState } from "./state";

const initialStatistics: Statistics = {
  totalOrders: 0,
  revenue: 0,
  itemsPurchased: 0,
  discountCodesGenerated: 0,
  totalDiscountsGiven: 0,
};

export class InMemoryStore {
  private readonly state: InMemoryState;

  constructor() {
    this.state = {
      products: new Map(seedProducts.map((product) => [product.id, product])),
      carts: new Map(),
      orders: new Map(),
      discountCodes: new Map(),
      statistics: { ...initialStatistics },
      orderCounter: 0,
    };
  }

  public getState(): InMemoryState {
    return this.state;
  }
}

export const inMemoryStore = new InMemoryStore();
