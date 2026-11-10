import type { Request, Response } from "express";

import { AppError } from "../errors/AppError.js";
import {
  adminRejectStore,
  adminSuspendStore,
  adminUnsuspendStore,
  adminVerifyStore,
  listStoresForAdmin,
} from "../services/store.service.js";
import type {
  AdminVerifyStoreInput,
  AdminRejectStoreInput,
  AdminSuspendStoreInput,
} from "../validation/store.schema.js";

function requireAdmin(request: Request): string {
  const userId = request.auth?.userId;
  const role = request.auth?.role;

  if (!userId || role !== "ADMIN") {
    throw new AppError("Admin access required", 403);
  }

  return userId;
}

export async function listStoresHandler(
  request: Request,
  response: Response,
): Promise<void> {
  requireAdmin(request);

  const page = Number(request.query.page) || 1;
  const limit = Math.min(Number(request.query.limit) || 20, 100);
  const status = request.query.status as string | undefined;
  const verificationStatus = request.query.verificationStatus as string | undefined;
  const search = request.query.search as string | undefined;

  const result = await listStoresForAdmin({
    page,
    limit,
    status,
    verificationStatus,
    search,
  });

  response.status(200).json({
    success: true,
    data: result,
  });
}

export async function suspendStoreHandler(
  request: Request,
  response: Response,
): Promise<void> {
  requireAdmin(request);
  const storeId = request.params.id as string;
  const input = request.body as AdminSuspendStoreInput;

  if (!storeId) {
    throw new AppError("Store ID is required", 400);
  }

  const store = await adminSuspendStore(storeId, input);

  response.status(200).json({
    success: true,
    data: { store },
  });
}

export async function unsuspendStoreHandler(
  request: Request,
  response: Response,
): Promise<void> {
  requireAdmin(request);
  const storeId = request.params.id as string;

  if (!storeId) {
    throw new AppError("Store ID is required", 400);
  }

  const store = await adminUnsuspendStore(storeId);

  response.status(200).json({
    success: true,
    data: { store },
  });
}

export async function verifyStoreHandler(
  request: Request,
  response: Response,
): Promise<void> {
  const adminId = requireAdmin(request);
  const storeId = request.params.id as string;
  const input = request.body as AdminVerifyStoreInput;

  if (!storeId) {
    throw new AppError("Store ID is required", 400);
  }

  const store = await adminVerifyStore(storeId, adminId, input);

  response.status(200).json({
    success: true,
    data: { store },
  });
}

export async function rejectStoreHandler(
  request: Request,
  response: Response,
): Promise<void> {
  requireAdmin(request);
  const storeId = request.params.id as string;
  const input = request.body as AdminRejectStoreInput;

  if (!storeId) {
    throw new AppError("Store ID is required", 400);
  }

  const store = await adminRejectStore(storeId as string, input);

  response.status(200).json({
    success: true,
    data: { store },
  });
}