export interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  /** Public URL path served by the frontend (e.g. /products/notebook.svg). */
  imageUrl: string;
  isActive: boolean;
}
