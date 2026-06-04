export interface DiscountCode {
  code: string;
  percentage: number;
  /** When set, discount applies only to this product's line(s) in the cart. */
  productId?: string;
  isUsed: boolean;
  generatedAtOrderNumber?: number;
  generatedAt: string;
  usedAt?: string;
}
