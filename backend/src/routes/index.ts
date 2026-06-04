import { Router } from "express";
import {
  AdminController,
  CatalogController,
  CustomerController,
} from "../controllers";
import {
  InMemoryCartRepository,
  InMemoryDiscountRepository,
  InMemoryOrderRepository,
  InMemoryProductRepository,
  InMemorySequenceRepository,
  InMemoryStatisticsRepository,
} from "../repositories";
import {
  CartService,
  CheckoutService,
  DiscountConfig,
  DiscountService,
  OrderService,
  StatisticsService,
} from "../services";
import { createAdminRoutes } from "./admin-routes";
import { createCatalogRoutes } from "./catalog-routes";
import { createCustomerRoutes } from "./customer-routes";

export const createApiRouter = (): Router => {
  const productRepository = new InMemoryProductRepository();
  const cartRepository = new InMemoryCartRepository();
  const orderRepository = new InMemoryOrderRepository();
  const discountRepository = new InMemoryDiscountRepository();
  const statisticsRepository = new InMemoryStatisticsRepository();
  const sequenceRepository = new InMemorySequenceRepository();

  const discountConfig: DiscountConfig = {
    nthOrderThreshold: 3,
    couponPercentage: 10,
  };

  const cartService = new CartService(cartRepository, productRepository);
  const discountService = new DiscountService(
    discountRepository,
    discountConfig,
    productRepository,
  );
  const statisticsService = new StatisticsService(statisticsRepository);
  const orderService = new OrderService(orderRepository);
  const checkoutService = new CheckoutService(
    cartService,
    orderRepository,
    sequenceRepository,
    discountService,
    statisticsService,
  );

  const customerController = new CustomerController(cartService, checkoutService);
  const adminController = new AdminController(
    discountService,
    statisticsService,
    orderService,
    productRepository,
  );
  const catalogController = new CatalogController(productRepository);

  const router = Router();
  router.use("/customer", createCustomerRoutes(customerController));
  router.use("/admin", createAdminRoutes(adminController));
  router.use("/catalog", createCatalogRoutes(catalogController));

  return router;
};

export * from "./customer-routes";
export * from "./admin-routes";
export * from "./catalog-routes";
