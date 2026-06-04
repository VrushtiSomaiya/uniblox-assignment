import {
  InMemoryDiscountRepository,
  InMemoryProductRepository,
} from "../../src/repositories";
import { DiscountCode } from "../../src/models";
import { DiscountService, ServiceError } from "../../src/services";

const makeCoupon = (overrides?: Partial<DiscountCode>): DiscountCode => ({
  code: "SAVE-TEST01",
  percentage: 10,
  isUsed: false,
  generatedAtOrderNumber: 3,
  generatedAt: new Date().toISOString(),
  ...overrides,
});

describe("Coupon validation", () => {
  const config = { nthOrderThreshold: 3, couponPercentage: 10 };

  it("validates an existing unused coupon", () => {
    const repository = new InMemoryDiscountRepository();
    repository.create(makeCoupon());
    const service = new DiscountService(
      repository,
      config,
      new InMemoryProductRepository(),
    );

    const coupon = service.validateCoupon("SAVE-TEST01");
    expect(coupon.code).toBe("SAVE-TEST01");
    expect(coupon.isUsed).toBe(false);
  });

  it("rejects an already used coupon", () => {
    const repository = new InMemoryDiscountRepository();
    repository.create(makeCoupon({ isUsed: true, usedAt: new Date().toISOString() }));
    const service = new DiscountService(
      repository,
      config,
      new InMemoryProductRepository(),
    );

    expect(() => service.validateCoupon("SAVE-TEST01")).toThrow(ServiceError);
    expect(() => service.validateCoupon("SAVE-TEST01")).toThrow(
      "Coupon has already been used.",
    );
  });

  it("marks coupon as used exactly once", () => {
    const repository = new InMemoryDiscountRepository();
    repository.create(makeCoupon());
    const service = new DiscountService(
      repository,
      config,
      new InMemoryProductRepository(),
    );

    const updated = service.markCouponAsUsed("SAVE-TEST01");
    expect(updated.isUsed).toBe(true);
    expect(updated.usedAt).toBeDefined();
    expect(() => service.markCouponAsUsed("SAVE-TEST01")).toThrow(
      "Coupon has already been used.",
    );
  });
});
