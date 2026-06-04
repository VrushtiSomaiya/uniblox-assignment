export interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  isActive: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  updatedAt: string;
}

export type DeliveryStatus = "pending" | "out_for_shipment" | "delivered";

export interface Order {
  id: string;
  cartId: string;
  items: CartItem[];
  subtotal: number;
  discountCode?: string;
  discountAmount: number;
  total: number;
  deliveryStatus: DeliveryStatus;
  createdAt: string;
}

export interface DiscountCode {
  code: string;
  percentage: number;
  productId?: string;
  productName?: string;
  isUsed: boolean;
  generatedAtOrderNumber?: number;
  generatedAt: string;
  usedAt?: string;
}

export interface DiscountBreakdownLine {
  productId: string;
  productName?: string;
  lineTotal: number;
  discountAmount: number;
  isEligible: boolean;
}

export interface CouponPreview {
  couponCode: string;
  percentage: number;
  productId?: string;
  productName?: string;
  appliesToEntireCart: boolean;
  subtotal: number;
  eligibleSubtotal: number;
  discountAmount: number;
  savings: number;
  total: number;
  lines: DiscountBreakdownLine[];
}

export interface Statistics {
  totalOrders: number;
  revenue: number;
  itemsPurchased: number;
  discountCodesGenerated: number;
  totalDiscountsGiven: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
