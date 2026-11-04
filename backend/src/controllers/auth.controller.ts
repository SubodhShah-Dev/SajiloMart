import type { Request, Response } from "express";
import { logger } from "../config/logger.js";

export function login(_req: Request, res: Response) {
  res.send("Hello Login");
}

export function register(_req: Request, res: Response) {
  res.send("Hello Register");
}

export function logout(_req: Request, res: Response) {
  res.send("Hello Logout");
}

export function getMe(_req: Request, res: Response) {
  res.send("Hello User");
}
