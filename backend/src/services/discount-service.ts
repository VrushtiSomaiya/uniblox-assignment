import { randomUUID } from "node:crypto";
import { Cart, DiscountCode } from "../models";
import { DiscountRepository, ProductRepository } from "../repositories";
import { calculateDiscountForCart, DiscountCalculation } from "./discount-calculation";
import { ServiceError } from "./errors";
import { DiscountConfig } from "./types";

export class DiscountService {
  constructor(
    private readonly discountRepository: DiscountRepository,
    private readonly discountConfig: DiscountConfig,
    private readonly productRepository: ProductRepository,
  ) {}

  public generateCouponForOrder(orderNumber: number): DiscountCode | null {
    if (orderNumber <= 0) {
      throw new ServiceError("INVALID_ORDER_NUMBER", "orderNumber must be positive.");
    }

    const shouldGenerate =
      orderNumber % this.discountConfig.nthOrderThreshold === 0;
    if (!shouldGenerate) {
      return null;
    }

    const discountCode: DiscountCode = {
      code: this.buildCode(),
      percentage: this.discountConfig.couponPercentage,
      isUsed: false,
      generatedAtOrderNumber: orderNumber,
      generatedAt: new Date().toISOString(),
    };

    this.discountRepository.create(discountCode);
    return discountCode;
  }

  public createCoupon(productId: string, percentage: number): DiscountCode {
    const product = this.productRepository.getById(productId);
    if (!product || !product.isActive) {
      throw new ServiceError("PRODUCT_NOT_FOUND", "Product not found.", 404);
    }

    if (percentage <= 0 || percentage >= 100) {
      throw new ServiceError(
        "INVALID_DISCOUNT_PERCENTAGE",
        "Discount percentage must be between 1 and 99.",
      );
    }

    const discountCode: DiscountCode = {
      code: this.buildCode(),
      percentage,
      productId,
      isUsed: false,
      generatedAt: new Date().toISOString(),
    };

    this.discountRepository.create(discountCode);
    return discountCode;
  }

  public listCoupons(): DiscountCode[] {
    return this.discountRepository
      .list()
      .sort(
        (a, b) =>
          new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime(),
      );
  }

  public previewCoupon(cart: Cart, code: string): DiscountCalculation {
    const coupon = this.validateCoupon(code);
    this.assertCouponAppliesToCart(cart, coupon);
    const calculation = calculateDiscountForCart(cart, coupon);
    return this.enrichCalculation(calculation, coupon);
  }

  private assertCouponAppliesToCart(cart: Cart, coupon: DiscountCode): void {
    if (!coupon.productId) {
      return;
    }

    const hasEligibleItem = cart.items.some(
      (item) => item.productId === coupon.productId,
    );
    if (hasEligibleItem) {
      return;
    }

    const product = this.productRepository.getById(coupon.productId);
    const label = product?.name ?? coupon.productId;
    throw new ServiceError(
      "COUPON_PRODUCT_NOT_IN_CART",
      `This coupon only applies to ${label}. It cannot be used for other products in your cart.`,
      422,
    );
  }

  private enrichCalculation(
    calculation: DiscountCalculation,
    coupon: DiscountCode,
  ): DiscountCalculation {
    const scopedProduct = coupon.productId
      ? this.productRepository.getById(coupon.productId)
      : undefined;

    return {
      ...calculation,
      productName: scopedProduct?.name,
      lines: calculation.lines.map((line) => ({
        ...line,
        productName:
          this.productRepository.getById(line.productId)?.name ?? line.productId,
      })),
    };
  }

  public calculateDiscount(cart: Cart, code: string): DiscountCalculation {
    const coupon = this.validateCoupon(code);
    this.assertCouponAppliesToCart(cart, coupon);
    const calculation = calculateDiscountForCart(cart, coupon);
    return this.enrichCalculation(calculation, coupon);
  }

  public validateCoupon(code: string): DiscountCode {
    if (!code.trim()) {
      throw new ServiceError("INVALID_COUPON_CODE", "Coupon code is required.");
    }

    const discountCode = this.discountRepository.getByCode(code.trim());
    if (!discountCode) {
      throw new ServiceError("COUPON_NOT_FOUND", "Coupon code is invalid.", 404);
    }
    if (discountCode.isUsed) {
      throw new ServiceError("COUPON_ALREADY_USED", "Coupon has already been used.");
    }
    if (discountCode.percentage <= 0 || discountCode.percentage >= 100) {
      throw new ServiceError(
        "COUPON_CONFIGURATION_INVALID",
        "Coupon percentage must be between 1 and 99.",
      );
    }

    return discountCode;
  }

  public markCouponAsUsed(code: string): DiscountCode {
    const discountCode = this.validateCoupon(code);
    discountCode.isUsed = true;
    discountCode.usedAt = new Date().toISOString();
    this.discountRepository.save(discountCode);
    return discountCode;
  }

  private buildCode(): string {
    const suffix = randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
    return `SAVE-${suffix}`;
  }
}
