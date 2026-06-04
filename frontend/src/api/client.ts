import axios from "axios";
import type {
  Cart,
  CouponPreview,
  DeliveryStatus,
  DiscountCode,
  Order,
  Product,
  Statistics,
} from "../types/api";

const api = axios.create({
  baseURL: "/api",
});

export const getProducts = async (): Promise<Product[]> => {
  const { data } = await api.get<{ data: Product[] }>("/catalog/products");
  return data.data;
};

export const addToCart = async (
  cartId: string,
  productId: string,
  quantity: number,
): Promise<Cart> => {
  const { data } = await api.post<{ data: Cart }>("/customer/cart/items", {
    cartId,
    productId,
    quantity,
  });
  return data.data;
};

export const getCart = async (cartId: string): Promise<Cart> => {
  const { data } = await api.get<{ data: Cart }>(`/customer/cart/${cartId}`);
  return data.data;
};

export const previewCoupon = async (
  cartId: string,
  couponCode: string,
): Promise<CouponPreview> => {
  const { data } = await api.post<{ data: CouponPreview }>(
    "/customer/cart/preview-coupon",
    { cartId, couponCode },
  );
  return data.data;
};

export const checkout = async (
  cartId: string,
  couponCode?: string,
): Promise<{ order: Order; generatedCoupon: DiscountCode | null }> => {
  const { data } = await api.post<{
    data: { order: Order; generatedCoupon: DiscountCode | null };
  }>("/customer/cart/checkout", { cartId, couponCode });
  return data.data;
};

export const getStatistics = async (): Promise<Statistics> => {
  const { data } = await api.get<{ data: Statistics }>("/admin/statistics");
  return data.data;
};

export const listDiscountCodes = async (): Promise<DiscountCode[]> => {
  const { data } = await api.get<{ data: DiscountCode[] }>("/admin/discount-codes");
  return data.data;
};

export const createDiscountCode = async (
  productId: string,
  percentage: number,
): Promise<DiscountCode> => {
  const { data } = await api.post<{ data: DiscountCode }>("/admin/discount-codes", {
    productId,
    percentage,
  });
  return data.data;
};

export const generateDiscountCode = async (
  orderNumber: number,
): Promise<DiscountCode | null> => {
  const { data } = await api.post<{ data: DiscountCode | null }>(
    "/admin/discount-codes/generate",
    { orderNumber },
  );
  return data.data;
};

export const listOrders = async (): Promise<Order[]> => {
  const { data } = await api.get<{ data: Order[] }>("/admin/orders");
  return data.data;
};

export const updateOrderStatus = async (
  orderId: string,
  deliveryStatus: DeliveryStatus,
): Promise<Order> => {
  const { data } = await api.patch<{ data: Order }>(
    `/admin/orders/${orderId}/status`,
    { deliveryStatus },
  );
  return data.data;
};

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Cannot reach the API. Run npm run dev from the frontend or project root so the backend starts on port 3000.";
    }
    const payload = error.response?.data as { error?: { message?: string } };
    return payload?.error?.message ?? error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong.";
};
