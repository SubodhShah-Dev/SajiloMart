import type { Request, Response } from "express";

import { AppError } from "../errors/AppError.js";
import {
  addWishlistItem,
  clearWishlist,
  getWishlist,
  removeWishlistItem,
} from "../services/wishlist.service.js";

function requireUserId(request: Request): string {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  return userId;
}

function getProductIdParam(request: Request): string {
  const productId = request.params.productId;

  if (Array.isArray(productId) || !productId) {
    throw new AppError("Invalid product ID", 400);
  }

  return productId;
}

export async function getWishlistHandler(
  request: Request,
  response: Response,
): Promise<void> {
  const wishlist = await getWishlist(requireUserId(request));

  response.status(200).json({ success: true, data: wishlist });
}

export async function addWishlistItemHandler(
  request: Request,
  response: Response,
): Promise<void> {
  const { productId } = request.body as { productId: string };
  const wishlist = await addWishlistItem(requireUserId(request), productId);

  response.status(200).json({ success: true, data: wishlist });
}

export async function removeWishlistItemHandler(
  request: Request,
  response: Response,
): Promise<void> {
  const wishlist = await removeWishlistItem(
    requireUserId(request),
    getProductIdParam(request),
  );

  response.status(200).json({ success: true, data: wishlist });
}

export async function clearWishlistHandler(
  request: Request,
  response: Response,
): Promise<void> {
  const wishlist = await clearWishlist(requireUserId(request));

  response.status(200).json({ success: true, data: wishlist });
}
