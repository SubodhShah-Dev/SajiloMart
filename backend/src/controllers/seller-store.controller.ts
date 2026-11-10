import type { Request, Response } from "express";

import { AppError } from "../errors/AppError.js";
import {
  createStore,
  getStoreByOwner,
  requestVerification,
  updateStore,
} from "../services/store.service.js";
import type {
  CreateStoreInput,
  UpdateStoreInput,
} from "../validation/store.schema.js";

function requireAuth(request: Request): string {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  return userId;
}

export async function getMyStoreHandler(
  request: Request,
  response: Response,
): Promise<void> {
  const userId = requireAuth(request);

  const store = await getStoreByOwner(userId);

  response.status(200).json({
    success: true,
    data: { store },
  });
}

export async function createStoreHandler(
  request: Request,
  response: Response,
): Promise<void> {
  const userId = requireAuth(request);
  const input = request.body as CreateStoreInput;

  const store = await createStore(userId, input);

  response.status(201).json({
    success: true,
    data: { store },
  });
}

export async function updateStoreHandler(
  request: Request,
  response: Response,
): Promise<void> {
  const userId = requireAuth(request);
  const input = request.body as UpdateStoreInput;

  const store = await updateStore(userId, input);

  response.status(200).json({
    success: true,
    data: { store },
  });
}

export async function requestVerificationHandler(
  request: Request,
  response: Response,
): Promise<void> {
  const userId = requireAuth(request);

  const store = await requestVerification(userId);

  response.status(200).json({
    success: true,
    data: { store },
  });
}