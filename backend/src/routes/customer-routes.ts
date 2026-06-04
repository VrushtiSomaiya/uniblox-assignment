import { Router } from "express";
import {
  validateAddItemToCartRequest,
  validateCartIdParam,
  validateCheckoutRequest,
  validatePreviewCouponRequest,
  validateRequest,
} from "../middleware";
import { CustomerController } from "../controllers";

export const createCustomerRoutes = (
  customerController: CustomerController,
): Router => {
  const router = Router();

  router.post(
    "/cart/items",
    validateRequest(validateAddItemToCartRequest),
    customerController.addItemToCart,
  );
  router.get(
    "/cart/:cartId",
    validateRequest(validateCartIdParam),
    customerController.getCart,
  );
  router.post(
    "/cart/preview-coupon",
    validateRequest(validatePreviewCouponRequest),
    customerController.previewCoupon,
  );
  router.post(
    "/cart/checkout",
    validateRequest(validateCheckoutRequest),
    customerController.checkoutCart,
  );

  return router;
};
