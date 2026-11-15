import type { Request, Response } from "express";

import { AppError } from "../errors/AppError.js";
import {
  createAddress,
  listAddresses,
} from "../services/address.service.js";
import type { CreateAddressInput } from "../validation/address.schema.js";

function requireUserId(request: Request): string {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  return userId;
}

export async function listAddressesHandler(
  request: Request,
  response: Response,
): Promise<void> {
  const userId = requireUserId(request);

  const addresses = await listAddresses(userId);
  response.status(200).json({ success: true, data: addresses });
}

export async function createAddressHandler(
  request: Request,
  response: Response,
): Promise<void> {
  const userId = requireUserId(request);

  const address = await createAddress(userId, request.body as CreateAddressInput);
  response.status(201).json({ success: true, data: address });
}
