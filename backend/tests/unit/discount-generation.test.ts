import {
  InMemoryDiscountRepository,
  InMemoryProductRepository,
  InMemorySequenceRepository,
} from "../../src/repositories";
import { DiscountService } from "../../src/services";

describe("Discount generation", () => {
  it("generates a coupon on every nth order", () => {
    const discountService = new DiscountService(
      new InMemoryDiscountRepository(),
      { nthOrderThreshold: 3, couponPercentage: 10 },
      new InMemoryProductRepository(),
    );
    const sequenceRepository = new InMemorySequenceRepository();

    const first = discountService.generateCouponForOrder(
      sequenceRepository.nextOrderNumber(),
    );
    const second = discountService.generateCouponForOrder(
      sequenceRepository.nextOrderNumber(),
    );
    const third = discountService.generateCouponForOrder(
      sequenceRepository.nextOrderNumber(),
    );

    expect(first).toBeNull();
    expect(second).toBeNull();
    expect(third).not.toBeNull();
    expect(third?.percentage).toBe(10);
    expect(third?.code.startsWith("SAVE-")).toBe(true);
  });

  it("creates a product-scoped coupon with custom percentage", () => {
    const discountService = new DiscountService(
      new InMemoryDiscountRepository(),
      { nthOrderThreshold: 3, couponPercentage: 10 },
      new InMemoryProductRepository(),
    );

    const coupon = discountService.createCoupon("prod_macbook_air", 15);
    expect(coupon.productId).toBe("prod_macbook_air");
    expect(coupon.percentage).toBe(15);
    expect(coupon.isUsed).toBe(false);
  });
});
