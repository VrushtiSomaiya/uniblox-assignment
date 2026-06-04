import { NextFunction, Request, Response } from "express";
import { ProductRepository } from "../repositories";

export class CatalogController {
  constructor(private readonly productRepository: ProductRepository) {}

  public listProducts = (_req: Request, res: Response, next: NextFunction) => {
    try {
      const products = this.productRepository
        .list()
        .filter((product) => product.isActive);

      return res.status(200).json({ data: products });
    } catch (error) {
      return next(error);
    }
  };
}
