import { NextFunction, Request, Response } from "express";
import { CartService, CheckoutService } from "../services";

export class CustomerController {
  constructor(
    private readonly cartService: CartService,
    private readonly checkoutService: CheckoutService,
  ) {}

  public addItemToCart = (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cartId, productId, quantity } = req.body as {
        cartId: string;
        productId: string;
        quantity: number;
      };

      const cart = this.cartService.addItem(cartId, productId, quantity);
      return res.status(200).json({
        message: "Item added to cart.",
        data: cart,
      });
    } catch (error) {
      return next(error);
    }
  };

  public getCart = (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cartId } = req.params;
      const cart = this.cartService.getCart(cartId);
      return res.status(200).json({ data: cart });
    } catch (error) {
      return next(error);
    }
  };

  public previewCoupon = (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cartId, couponCode } = req.body as {
        cartId: string;
        couponCode: string;
      };

      const preview = this.checkoutService.previewCoupon(cartId, couponCode);
      return res.status(200).json({ data: preview });
    } catch (error) {
      return next(error);
    }
  };

  public checkoutCart = (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cartId, couponCode } = req.body as {
        cartId: string;
        couponCode?: string;
      };

      const result = this.checkoutService.checkout({ cartId, couponCode });
      return res.status(200).json({
        message: "Checkout successful.",
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  };
}
