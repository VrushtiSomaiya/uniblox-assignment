import {
  InMemoryCartRepository,
  InMemoryDiscountRepository,
  InMemoryOrderRepository,
  InMemoryProductRepository,
  InMemorySequenceRepository,
  InMemoryStatisticsRepository,
} from "../../src/repositories";
import {
  CartService,
  CheckoutService,
  DiscountService,
  ServiceError,
  StatisticsService,
} from "../../src/services";

const setup = () => {
  const productRepository = new InMemoryProductRepository();
  const cartRepository = new InMemoryCartRepository();
  const orderRepository = new InMemoryOrderRepository();
  const discountRepository = new InMemoryDiscountRepository();
  const sequenceRepository = new InMemorySequenceRepository();
  const statisticsRepository = new InMemoryStatisticsRepository();

  const cartService = new CartService(cartRepository, productRepository);
  const discountService = new DiscountService(
    discountRepository,
    { nthOrderThreshold: 3, couponPercentage: 10 },
    productRepository,
  );
  const statisticsService = new StatisticsService(statisticsRepository);
  const checkoutService = new CheckoutService(
    cartService,
    orderRepository,
    sequenceRepository,
    discountService,
    statisticsService,
  );

  return { cartService, discountService, checkoutService };
};

describe("Product-scoped coupons", () => {
  it("rejects coupon when scoped product is not in the cart", () => {
    const { cartService, discountService } = setup();
    const coupon = discountService.createCoupon("prod_iphone_15", 15);

    cartService.addItem("cart_x", "prod_macbook_air", 1);

    expect(() => discountService.previewCoupon(cartService.getCart("cart_x"), coupon.code)).toThrow(
      ServiceError,
    );
    expect(() =>
      discountService.previewCoupon(cartService.getCart("cart_x"), coupon.code),
    ).toThrow(/only applies to iPhone 15/i);
  });

  it("does not discount non-matching products in a mixed cart", () => {
    const { cartService, discountService } = setup();
    const coupon = discountService.createCoupon("prod_iphone_15", 10);

    cartService.addItem("cart_y", "prod_iphone_15", 1);
    cartService.addItem("cart_y", "prod_macbook_air", 1);

    const preview = discountService.previewCoupon(
      cartService.getCart("cart_y"),
      coupon.code,
    );

    expect(preview.discountAmount).toBe(100);
    expect(preview.total).toBe(2900);
    expect(preview.appliesToEntireCart).toBe(false);
    expect(preview.productName).toBe("iPhone 15");

    const iphoneLine = preview.lines.find((l) => l.productId === "prod_iphone_15");
    const macLine = preview.lines.find((l) => l.productId === "prod_macbook_air");

    expect(iphoneLine?.discountAmount).toBe(100);
    expect(iphoneLine?.isEligible).toBe(true);
    expect(macLine?.discountAmount).toBe(0);
    expect(macLine?.isEligible).toBe(false);
  });

  it("rejects checkout when cart has no eligible product for the coupon", () => {
    const { cartService, discountService, checkoutService } = setup();
    const coupon = discountService.createCoupon("prod_iphone_15", 10);

    cartService.addItem("cart_z", "prod_macbook_air", 1);

    expect(() =>
      checkoutService.checkout({ cartId: "cart_z", couponCode: coupon.code }),
    ).toThrow(ServiceError);
  });
});
