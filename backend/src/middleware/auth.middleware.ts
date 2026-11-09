import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/AppError.js";
import { getUserById } from "../services/auth.service.js";
import { ACCESS_COOKIE_NAME } from "../services/cookies.service.js";
import { verifyAccessToken } from "../services/token.service.js";

function readAccessToken(request: Request): string | undefined {
  const cookieToken = request.cookies?.[ACCESS_COOKIE_NAME] as unknown;

  if (typeof cookieToken === "string" && cookieToken.length > 0) {
    return cookieToken;
  }

  const authorization = request.headers.authorization;

  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length);
  }

  return undefined;
}

export async function authenticateToken(
  request: Request,
  _response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = readAccessToken(request);

    if (!token) {
      throw new AppError("Authentication required", 401);
    }

    const payload = verifyAccessToken(token);
    const user = await getUserById(payload.sub);

    request.auth = { userId: user.id, role: user.role };
    next();
  } catch (error) {
    next(error);
  }
}
