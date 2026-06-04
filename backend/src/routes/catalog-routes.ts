import { Router } from "express";
import { CatalogController } from "../controllers";

export const createCatalogRoutes = (
  catalogController: CatalogController,
): Router => {
  const router = Router();

  router.get("/products", catalogController.listProducts);

  return router;
};
