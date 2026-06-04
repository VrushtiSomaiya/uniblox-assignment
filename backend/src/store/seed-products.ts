import { Product } from "../models";

export const seedProducts: Product[] = [
  {
    id: "prod_iphone_15",
    name: "iPhone 15",
    price: 1000,
    currency: "USD",
    isActive: true,
  },
  {
    id: "prod_macbook_air",
    name: "MacBook Air",
    price: 2000,
    currency: "USD",
    isActive: true,
  },
  {
    id: "prod_airpods_pro",
    name: "AirPods Pro",
    price: 250,
    currency: "USD",
    isActive: true,
  },
];
