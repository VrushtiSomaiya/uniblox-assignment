export interface DiscountConfig {
  nthOrderThreshold: number;
  couponPercentage: number;
}

export interface CheckoutInput {
  cartId: string;
  couponCode?: string;
}
