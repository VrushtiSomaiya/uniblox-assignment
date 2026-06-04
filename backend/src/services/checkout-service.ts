import { randomUUID } from "node:crypto";
import { DiscountCode, Order } from "../models";
import { DiscountCalculation } from "./discount-calculation";
import { OrderRepository, SequenceRepository } from "../repositories";
import { CartService } from "./cart-service";
import { DiscountService } from "./discount-service";
import { ServiceError } from "./errors";
import { StatisticsService } from "./statistics-service";
import { CheckoutInput } from "./types";

export interface CheckoutResult {
  order: Order;
  generatedCoupon: DiscountCode | null;
}

export class CheckoutService {
  constructor(
    private readonly cartService: CartService,
    private readonly orderRepository: OrderRepository,
    private readonly sequenceRepository: SequenceRepository,
    private readonly discountService: DiscountService,
    private readonly statisticsService: StatisticsService,
  ) {}

  public previewCoupon(cartId: string, couponCode: string): DiscountCalculation {
    const cart = this.cartService.getCart(cartId);
    if (cart.items.length === 0) {
      throw new ServiceError("EMPTY_CART", "Cannot apply a coupon to an empty cart.");
    }
    return this.discountService.previewCoupon(cart, couponCode);
  }

  public checkout(input: CheckoutInput): CheckoutResult {
    const cart = this.cartService.getCart(input.cartId);
    if (cart.items.length === 0) {
      throw new ServiceError("EMPTY_CART", "Cannot checkout an empty cart.");
    }

    let appliedCouponCode: string | undefined;
    let discountAmount = 0;

    if (input.couponCode?.trim()) {
      const calculation = this.discountService.calculateDiscount(
        cart,
        input.couponCode,
      );
      discountAmount = calculation.discountAmount;
      this.discountService.markCouponAsUsed(calculation.couponCode);
      appliedCouponCode = calculation.couponCode;
    }

    const total = Number((cart.subtotal - discountAmount).toFixed(2));
    const order: Order = {
      id: `ord_${randomUUID()}`,
      cartId: cart.id,
      items: cart.items,
      subtotal: cart.subtotal,
      discountCode: appliedCouponCode,
      discountAmount,
      total,
      deliveryStatus: "pending",
      createdAt: new Date().toISOString(),
    };

    this.orderRepository.create(order);
    this.cartService.clearCart(cart.id);

    const orderNumber = this.sequenceRepository.nextOrderNumber();
    const generatedCoupon = this.discountService.generateCouponForOrder(orderNumber);

    this.statisticsService.updateAfterOrder({
      orderTotal: order.total,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      discountAmount: order.discountAmount,
      generatedCoupon: Boolean(generatedCoupon),
    });

    return { order, generatedCoupon };
  }
}
