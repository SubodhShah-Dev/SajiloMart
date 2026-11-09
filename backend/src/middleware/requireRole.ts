import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/AppError.js";
import type { UserRole } from "../types/user.js";

export function requireRole(...allowedRoles: UserRole[]) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const userRole = request.auth?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      throw new AppError("Insufficient permissions", 403);
    }

    next();
  };
}