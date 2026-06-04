import { NextFunction, Request, Response } from "express";
import { DiscountCode } from "../models";
import { ProductRepository } from "../repositories";
import {
  DiscountService,
  OrderService,
  StatisticsService,
} from "../services";

type DiscountCodeView = DiscountCode & { productName?: string };

export class AdminController {
  constructor(
    private readonly discountService: DiscountService,
    private readonly statisticsService: StatisticsService,
    private readonly orderService: OrderService,
    private readonly productRepository: ProductRepository,
  ) {}

  public generateDiscountCode = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { orderNumber } = req.body as { orderNumber: number };
      const generatedCoupon =
        this.discountService.generateCouponForOrder(orderNumber);

      if (!generatedCoupon) {
        return res.status(200).json({
          message: "No coupon generated for this order number.",
          data: null,
        });
      }

      this.statisticsService.incrementCouponsGenerated();

      return res.status(201).json({
        message: "Coupon generated.",
        data: this.enrichCoupon(generatedCoupon),
      });
    } catch (error) {
      return next(error);
    }
  };

  public createDiscountCode = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { productId, percentage } = req.body as {
        productId: string;
        percentage: number;
      };

      const created = this.discountService.createCoupon(productId, percentage);
      this.statisticsService.incrementCouponsGenerated();

      return res.status(201).json({
        message: "Coupon created.",
        data: this.enrichCoupon(created),
      });
    } catch (error) {
      return next(error);
    }
  };

  public listDiscountCodes = (
    _req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const coupons = this.discountService
        .listCoupons()
        .map((coupon) => this.enrichCoupon(coupon));

      return res.status(200).json({ data: coupons });
    } catch (error) {
      return next(error);
    }
  };

  public getStatistics = (_req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = this.statisticsService.getStatistics();
      return res.status(200).json({ data: stats });
    } catch (error) {
      return next(error);
    }
  };

  public listOrders = (_req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = this.orderService.listOrders();
      return res.status(200).json({ data: orders });
    } catch (error) {
      return next(error);
    }
  };

  public updateOrderStatus = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { orderId } = req.params;
      const { deliveryStatus } = req.body as {
        deliveryStatus: "pending" | "out_for_shipment" | "delivered";
      };

      const order = this.orderService.updateDeliveryStatus(
        orderId,
        deliveryStatus,
      );

      return res.status(200).json({
        message: "Order status updated.",
        data: order,
      });
    } catch (error) {
      return next(error);
    }
  };

  private enrichCoupon(coupon: DiscountCode): DiscountCodeView {
    if (!coupon.productId) {
      return coupon;
    }

    const product = this.productRepository.getById(coupon.productId);
    return {
      ...coupon,
      productName: product?.name,
    };
  }
}
