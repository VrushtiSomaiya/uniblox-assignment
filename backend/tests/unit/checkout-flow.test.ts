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
  StatisticsService,
} from "../../src/services";

describe("Checkout flow", () => {
  it("completes checkout, applies coupon, clears cart, and updates statistics", () => {
    const productRepository = new InMemoryProductRepository();
    const cartRepository = new InMemoryCartRepository();
    const orderRepository = new InMemoryOrderRepository();
    const discountRepository = new InMemoryDiscountRepository();
    const sequenceRepository = new InMemorySequenceRepository();
    const statisticsRepository = new InMemoryStatisticsRepository();

    const cartService = new CartService(cartRepository, productRepository);
    const discountService = new DiscountService(discountRepository, {
      nthOrderThreshold: 3,
      couponPercentage: 10,
    }, productRepository);
    const statisticsService = new StatisticsService(statisticsRepository);
    const checkoutService = new CheckoutService(
      cartService,
      orderRepository,
      sequenceRepository,
      discountService,
      statisticsService,
    );

    cartService.addItem("cart_1", "prod_iphone_15", 1);
    const createdCoupon = discountService.generateCouponForOrder(3);
    expect(createdCoupon).not.toBeNull();

    const result = checkoutService.checkout({
      cartId: "cart_1",
      couponCode: createdCoupon?.code,
    });

    expect(result.order.subtotal).toBe(1000);
    expect(result.order.discountAmount).toBe(100);
    expect(result.order.total).toBe(900);
    expect(result.order.discountCode).toBe(createdCoupon?.code);
    expect(result.order.deliveryStatus).toBe("pending");

    const persistedCart = cartService.getCart("cart_1");
    expect(persistedCart.items).toHaveLength(0);
    expect(persistedCart.subtotal).toBe(0);

    const stats = statisticsService.getStatistics();
    expect(stats.totalOrders).toBe(1);
    expect(stats.revenue).toBe(900);
    expect(stats.itemsPurchased).toBe(1);
    expect(stats.totalDiscountsGiven).toBe(100);
    expect(stats.discountCodesGenerated).toBe(0);
  });

  it("applies product-specific discount only to matching lines", () => {
    const productRepository = new InMemoryProductRepository();
    const cartRepository = new InMemoryCartRepository();
    const orderRepository = new InMemoryOrderRepository();
    const discountRepository = new InMemoryDiscountRepository();
    const sequenceRepository = new InMemorySequenceRepository();
    const statisticsRepository = new InMemoryStatisticsRepository();

    const cartService = new CartService(cartRepository, productRepository);
    const discountService = new DiscountService(discountRepository, {
      nthOrderThreshold: 3,
      couponPercentage: 10,
    }, productRepository);
    const statisticsService = new StatisticsService(statisticsRepository);
    const checkoutService = new CheckoutService(
      cartService,
      orderRepository,
      sequenceRepository,
      discountService,
      statisticsService,
    );

    const coupon = discountService.createCoupon("prod_airpods_pro", 20);
    cartService.addItem("cart_2", "prod_iphone_15", 1);
    cartService.addItem("cart_2", "prod_airpods_pro", 1);

    const preview = checkoutService.previewCoupon("cart_2", coupon.code);
    expect(preview.subtotal).toBe(1250);
    expect(preview.eligibleSubtotal).toBe(250);
    expect(preview.discountAmount).toBe(50);
    expect(preview.total).toBe(1200);

    const result = checkoutService.checkout({
      cartId: "cart_2",
      couponCode: coupon.code,
    });

    expect(result.order.discountAmount).toBe(50);
    expect(result.order.total).toBe(1200);
  });
});
