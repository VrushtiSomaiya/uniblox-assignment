import { Request, Response } from "express";

export const notFoundHandler = (_req: Request, res: Response) => {
  return res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Route not found.",
    },
  });
};
