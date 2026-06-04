import { Router } from "express";
import {
  validateCreateDiscountRequest,
  validateGenerateDiscountRequest,
  validateRequest,
  validateUpdateOrderStatusRequest,
} from "../middleware";
import { AdminController } from "../controllers";

export const createAdminRoutes = (adminController: AdminController): Router => {
  const router = Router();

  router.get("/statistics", adminController.getStatistics);
  router.get("/orders", adminController.listOrders);
  router.patch(
    "/orders/:orderId/status",
    validateRequest(validateUpdateOrderStatusRequest),
    adminController.updateOrderStatus,
  );

  router.get("/discount-codes", adminController.listDiscountCodes);
  router.post(
    "/discount-codes",
    validateRequest(validateCreateDiscountRequest),
    adminController.createDiscountCode,
  );
  router.post(
    "/discount-codes/generate",
    validateRequest(validateGenerateDiscountRequest),
    adminController.generateDiscountCode,
  );

  return router;
};
