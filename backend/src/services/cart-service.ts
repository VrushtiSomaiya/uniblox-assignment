import { Cart, CartItem } from "../models";
import { CartRepository, ProductRepository } from "../repositories";
import { ServiceError } from "./errors";

export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  public addItem(cartId: string, productId: string, quantity: number): Cart {
    if (!cartId.trim()) {
      throw new ServiceError("INVALID_CART_ID", "cartId is required.");
    }
    if (!productId.trim()) {
      throw new ServiceError("INVALID_PRODUCT_ID", "productId is required.");
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new ServiceError(
        "INVALID_QUANTITY",
        "quantity must be a positive integer.",
      );
    }

    const product = this.productRepository.getById(productId);
    if (!product || !product.isActive) {
      throw new ServiceError("PRODUCT_NOT_FOUND", "Product not found.", 404);
    }

    const cart = this.getOrCreateCart(cartId);
    const existingItem = cart.items.find((item) => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.unitPrice = product.price;
      existingItem.lineTotal = this.toMoney(existingItem.quantity * product.price);
    } else {
      const newItem: CartItem = {
        productId,
        quantity,
        unitPrice: product.price,
        lineTotal: this.toMoney(quantity * product.price),
      };
      cart.items.push(newItem);
    }

    cart.subtotal = this.toMoney(
      cart.items.reduce((sum, item) => sum + item.lineTotal, 0),
    );
    cart.updatedAt = new Date().toISOString();

    this.cartRepository.save(cart);
    return cart;
  }

  public getCart(cartId: string): Cart {
    if (!cartId.trim()) {
      throw new ServiceError("INVALID_CART_ID", "cartId is required.");
    }

    const cart = this.cartRepository.getById(cartId);
    if (!cart) {
      return {
        id: cartId,
        items: [],
        subtotal: 0,
        updatedAt: new Date().toISOString(),
      };
    }
    return cart;
  }

  public clearCart(cartId: string): Cart {
    const emptiedCart: Cart = {
      id: cartId,
      items: [],
      subtotal: 0,
      updatedAt: new Date().toISOString(),
    };
    this.cartRepository.save(emptiedCart);
    return emptiedCart;
  }

  private getOrCreateCart(cartId: string): Cart {
    return (
      this.cartRepository.getById(cartId) ?? {
        id: cartId,
        items: [],
        subtotal: 0,
        updatedAt: new Date().toISOString(),
      }
    );
  }

  private toMoney(value: number): number {
    return Number(value.toFixed(2));
  }
}
