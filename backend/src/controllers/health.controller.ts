import type { Request, Response } from "express";

import { env } from "../config/env.js";

export function getHealth(_request: Request, response: Response): void {
  response.status(200).json({
    success: true,
    data: {
      status: "ok",
      service: "sajilomart-api",
      environment: env.nodeEnv,
      timestamp: new Date().toISOString(),
      uptime: Number(process.uptime().toFixed(3)),
    },
  });
}
