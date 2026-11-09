import type { RequestHandler, Request } from "express";
import type { ZodType } from "zod";
import { AppError } from "../errors/AppError.js";

export function validateBody<T>(schema: ZodType<T>): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => issue.message)
        .join("; ");

      next(new AppError(message, 400));
      return;
    }

    request.body = result.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodType<T>): RequestHandler {
  return (request: Request, _response, next) => {
    const result = schema.safeParse(request.query);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => issue.message)
        .join("; ");

      next(new AppError(message, 400));
      return;
    }

    // Store validated query on request for type-safe access
    (request as Request & { validatedQuery: T }).validatedQuery = result.data;
    next();
  };
}
