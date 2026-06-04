import { NextFunction, Request, Response } from "express";
import { ServiceError } from "../services";

interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction,
): Response<ErrorResponse> => {
  if (error instanceof ServiceError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred.",
    },
  });
};
