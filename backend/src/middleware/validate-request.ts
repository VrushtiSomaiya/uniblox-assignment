import { NextFunction, Request, RequestHandler, Response } from "express";
import { ServiceError } from "../services";

export type RequestValidator = (req: Request) => void;

export const validateRequest = (validator: RequestValidator): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      validator(req);
      return next();
    } catch (error) {
      return next(error);
    }
  };
};

export const requireString = (
  value: unknown,
  fieldName: string,
  options?: { allowEmpty?: boolean },
): string => {
  if (typeof value !== "string") {
    throw new ServiceError(
      "VALIDATION_ERROR",
      `${fieldName} must be a string.`,
      422,
    );
  }

  if (!options?.allowEmpty && value.trim() === "") {
    throw new ServiceError(
      "VALIDATION_ERROR",
      `${fieldName} is required.`,
      422,
    );
  }

  return value;
};

export const requirePositiveInteger = (
  value: unknown,
  fieldName: string,
): number => {
  if (!Number.isInteger(value) || Number(value) <= 0) {
    throw new ServiceError(
      "VALIDATION_ERROR",
      `${fieldName} must be a positive integer.`,
      422,
    );
  }

  return Number(value);
};
