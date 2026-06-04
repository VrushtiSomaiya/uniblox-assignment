import { Cart, DiscountCode } from "../models";
import { ServiceError } from "./errors";

export interface DiscountBreakdownLine {
  productId: string;
  productName?: string;
  lineTotal: number;
  discountAmount: number;
  isEligible: boolean;
}

export interface DiscountCalculation {
  couponCode: string;
  percentage: number;
  productId?: string;
  productName?: string;
  appliesToEntireCart: boolean;
  subtotal: number;
  eligibleSubtotal: number;
  discountAmount: number;
  total: number;
  savings: number;
  lines: DiscountBreakdownLine[];
}

export const toMoney = (value: number): number => Number(value.toFixed(2));

export const calculateDiscountForCart = (
  cart: Cart,
  coupon: DiscountCode,
): DiscountCalculation => {
  const appliesToEntireCart = !coupon.productId;
  const lines: DiscountBreakdownLine[] = cart.items.map((item) => {
    const isEligible =
      appliesToEntireCart || item.productId === coupon.productId;
    return {
      productId: item.productId,
      lineTotal: item.lineTotal,
      discountAmount: 0,
      isEligible,
    };
  });

  let eligibleSubtotal = cart.subtotal;

  if (coupon.productId) {
    const matching = cart.items.filter((item) => item.productId === coupon.productId);
    if (matching.length === 0) {
      throw new ServiceError(
        "COUPON_PRODUCT_NOT_IN_CART",
        "This coupon does not apply to any item in your cart.",
      );
    }
    eligibleSubtotal = matching.reduce((sum, item) => sum + item.lineTotal, 0);
  }

  const discountAmount = toMoney((eligibleSubtotal * coupon.percentage) / 100);

  for (const line of lines) {
    if (line.isEligible) {
      line.discountAmount = toMoney((line.lineTotal * coupon.percentage) / 100);
    }
  }

  return {
    couponCode: coupon.code,
    percentage: coupon.percentage,
    productId: coupon.productId,
    appliesToEntireCart,
    subtotal: cart.subtotal,
    eligibleSubtotal: toMoney(eligibleSubtotal),
    discountAmount,
    savings: discountAmount,
    total: toMoney(cart.subtotal - discountAmount),
    lines,
  };
};
