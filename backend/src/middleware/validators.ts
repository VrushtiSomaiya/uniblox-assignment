import { Request } from "express";
import { ServiceError } from "../services";
import { requirePositiveInteger, requireString } from "./validate-request";

export const validateAddItemToCartRequest = (req: Request): void => {
  requireString(req.body?.cartId, "cartId");
  requireString(req.body?.productId, "productId");
  requirePositiveInteger(req.body?.quantity, "quantity");
};

export const validateCheckoutRequest = (req: Request): void => {
  requireString(req.body?.cartId, "cartId");

  if (req.body?.couponCode !== undefined) {
    requireString(req.body.couponCode, "couponCode");
  }
};

export const validateGenerateDiscountRequest = (req: Request): void => {
  requirePositiveInteger(req.body?.orderNumber, "orderNumber");
};

export const validateCartIdParam = (req: Request): void => {
  requireString(req.params?.cartId, "cartId");
};

export const validatePreviewCouponRequest = (req: Request): void => {
  requireString(req.body?.cartId, "cartId");
  requireString(req.body?.couponCode, "couponCode");
};

export const validateCreateDiscountRequest = (req: Request): void => {
  requireString(req.body?.productId, "productId");
  const percentage = req.body?.percentage;
  if (typeof percentage !== "number" || !Number.isFinite(percentage)) {
    throw new ServiceError(
      "VALIDATION_ERROR",
      "percentage must be a number.",
      422,
    );
  }
  if (percentage <= 0 || percentage >= 100) {
    throw new ServiceError(
      "VALIDATION_ERROR",
      "percentage must be between 1 and 99.",
      422,
    );
  }
};

export const validateUpdateOrderStatusRequest = (req: Request): void => {
  requireString(req.params?.orderId, "orderId");
  const status = req.body?.deliveryStatus;
  if (
    status !== "pending" &&
    status !== "out_for_shipment" &&
    status !== "delivered"
  ) {
    throw new ServiceError(
      "VALIDATION_ERROR",
      "deliveryStatus must be pending, out_for_shipment, or delivered.",
      422,
    );
  }
};
