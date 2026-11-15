import type { Request, Response } from "express";

import { AppError } from "../errors/AppError.js";
import {
  checkout,
  getOrder,
  listOrders,
} from "../services/order.service.js";
import type { CheckoutInput } from "../validation/order.schema.js";

function requireUserId(request: Request): string {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  return userId;
}

function getOrderIdParam(request: Request): string {
  const orderId = request.params.orderId;

  if (Array.isArray(orderId) || typeof orderId !== "string") {
    throw new AppError("Invalid order ID", 400);
  }

  return orderId;
}

export async function createOrderHandler(
  request: Request,
  response: Response,
): Promise<void> {
  const userId = requireUserId(request);

  const order = await checkout(userId, request.body as CheckoutInput);
  response.status(201).json({ success: true, data: order });
}

export async function listOrdersHandler(
  request: Request,
  response: Response,
): Promise<void> {
  const userId = requireUserId(request);

  const orders = await listOrders(userId);
  response.status(200).json({ success: true, data: orders });
}

export async function getOrderHandler(
  request: Request,
  response: Response,
): Promise<void> {
  const userId = requireUserId(request);

  const order = await getOrder(userId, getOrderIdParam(request));
  response.status(200).json({ success: true, data: order });
}
