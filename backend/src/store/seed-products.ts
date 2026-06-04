import { Product } from "../models";

/**
 * Seeded catalog for the in-memory store. Image paths are served from frontend/public.
 */
export const seedProducts: Product[] = [
  {
    id: "prod_iphone_15",
    name: "iPhone 15",
    price: 1000,
    currency: "USD",
    imageUrl: "/products/iphone-15.svg",
    isActive: true,
  },
  {
    id: "prod_macbook_air",
    name: "MacBook Air",
    price: 2000,
    currency: "USD",
    imageUrl: "/products/macbook-air.svg",
    isActive: true,
  },
  {
    id: "prod_airpods_pro",
    name: "AirPods Pro",
    price: 250,
    currency: "USD",
    imageUrl: "/products/airpods-pro.svg",
    isActive: true,
  },
  {
    id: "prod_notebook_leather",
    name: "Leather Notebook",
    price: 34,
    currency: "USD",
    imageUrl: "/products/notebook.svg",
    isActive: true,
  },
  {
    id: "prod_fountain_pen",
    name: "Fountain Pen",
    price: 48,
    currency: "USD",
    imageUrl: "/products/pen.svg",
    isActive: true,
  },
  {
    id: "prod_ceramic_mug",
    name: "Ceramic Mug",
    price: 22,
    currency: "USD",
    imageUrl: "/products/mug.svg",
    isActive: true,
  },
  {
    id: "prod_desk_lamp",
    name: "LED Desk Lamp",
    price: 68,
    currency: "USD",
    imageUrl: "/products/lamp.svg",
    isActive: true,
  },
  {
    id: "prod_washi_tape",
    name: "Washi Tape Set",
    price: 14,
    currency: "USD",
    imageUrl: "/products/tape.svg",
    isActive: true,
  },
  {
    id: "prod_desk_organizer",
    name: "Desk Organizer",
    price: 42,
    currency: "USD",
    imageUrl: "/products/organizer.svg",
    isActive: true,
  },
];
