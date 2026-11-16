import type { Request, Response } from "express";

import { AppError } from "../errors/AppError.js";
import { getAdminOverview } from "../services/admin-analytics.service.js";

function requireAdmin(request: Request): void {
  if (!request.auth?.userId || request.auth.role !== "ADMIN") {
    throw new AppError("Admin access required", 403);
  }
}

export async function getAdminOverviewHandler(
  request: Request,
  response: Response,
): Promise<void> {
  requireAdmin(request);

  const overview = await getAdminOverview();

  response.status(200).json({
    success: true,
    data: overview,
  });
}
