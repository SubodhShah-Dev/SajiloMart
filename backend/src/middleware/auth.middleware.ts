import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const headerAuthorization = req.headers.authorization;
  if (!headerAuthorization || !headerAuthorization.startsWith("Bearer ")) {
    logger.error("Unauthorized: No authorization header or invalid format");
    res.status(401).send("Unauthorized");
    return;
  }
  const token = headerAuthorization.substring(7);
  try {
    const decoded = jwt.verify(token, env.accessTokenSecret ?? ("" as string));
    if (!(decoded instanceof Object && "userId" in decoded)) {
      logger.error("Unauthorized: Invalid token");
      res.status(401).send("Unauthorized");
      return;
    }
    const userId = decoded.userId;
    if (!userId) {
      logger.error("Unauthorized: Invalid token");
      res.status(401).send("Unauthorized");
      return;
    }
    (req as Request & { userId: string }).userId = userId;
    next();
  } catch (error) {
    console.error(error);
    next(error);
  }
}
