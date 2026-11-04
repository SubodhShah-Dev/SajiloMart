import type { ErrorRequestHandler } from "express";

import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { AppError } from "../errors/AppError.js";

interface ErrorWithStatus {
  status?: unknown;
}

function resolveStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }

  if (
    error instanceof SyntaxError &&
    (error as ErrorWithStatus).status === 400
  ) {
    return 400;
  }

  return 500;
}

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  request,
  response,
  _next,
) => {
  const isAppError = error instanceof AppError;
  const statusCode = resolveStatusCode(error);

  const message = isAppError
    ? error.message
    : statusCode === 400 && error instanceof SyntaxError
      ? "Invalid JSON payload"
      : "Internal server error";

  if (statusCode >= 500) {
    logger.error(
      `${request.method} ${request.originalUrl} failed: ${message}`,
      {
        error: error instanceof Error ? error.stack : String(error),
      },
    );
  } else {
    logger.warn(
      `${request.method} ${request.originalUrl} -> ${statusCode}: ${message}`,
    );
  }

  const detail =
    !env.isProduction &&
    !isAppError &&
    statusCode >= 500 &&
    error instanceof Error
      ? { detail: error.message }
      : {};

  response.status(statusCode).json({
    success: false,
    error: {
      message,
      ...detail,
    },
  });
};
