import type { Request, Response } from "express";

import { AppError } from "../errors/AppError.js";
import {
  addItem,
  clearCart,
  getCart,
  mergeCarts,
  removeItem,
  updateQty,
} from "../services/cart.service.js";

function getProductIdParam(request: Request): string {
  const productId = request.params.productId;
  if (Array.isArray(productId)) {
    throw new AppError("Invalid product ID", 400);
  }
  return productId;
}

export async function getCartHandler(request: Request, response: Response): Promise<void> {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  const cart = await getCart(userId);
  response.status(200).json({ success: true, data: cart });
}

export async function addCartItemHandler(request: Request, response: Response): Promise<void> {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  const { productId, quantity = 1 } = request.body;
  const cart = await addItem(userId, productId, quantity);
  response.status(200).json({ success: true, data: cart });
}

export async function updateCartQtyHandler(request: Request, response: Response): Promise<void> {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  const productId = getProductIdParam(request);
  const { quantity } = request.body;
  const cart = await updateQty(userId, productId, quantity);
  response.status(200).json({ success: true, data: cart });
}

export async function removeCartItemHandler(request: Request, response: Response): Promise<void> {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  const productId = getProductIdParam(request);
  const cart = await removeItem(userId, productId);
  response.status(200).json({ success: true, data: cart });
}

export async function clearCartHandler(request: Request, response: Response): Promise<void> {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  const cart = await clearCart(userId);
  response.status(200).json({ success: true, data: cart });
}

export async function mergeAnonymousCartHandler(request: Request, response: Response): Promise<void> {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  const { items } = request.body as { items: { productId: string; quantity: number }[] };

  if (!Array.isArray(items)) {
    throw new AppError("Invalid items array", 400);
  }

  const cart = await mergeCarts(items, userId);
  response.status(200).json({ success: true, data: cart });
}