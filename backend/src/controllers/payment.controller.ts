import type { Request, Response } from "express";

import { AppError } from "../errors/AppError.js";
import { completeCodPayment } from "../services/order.service.js";
import {
  createCheckoutSession,
  handleStripeWebhook,
} from "../services/stripe.service.js";

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

export async function createStripeSessionHandler(
  request: Request,
  response: Response,
): Promise<void> {
  const userId = requireUserId(request);

  const session = await createCheckoutSession(
    getOrderIdParam(request),
    userId,
  );
  response.status(200).json({ success: true, data: session });
}

/**
 * Stripe calls this endpoint directly. The route is mounted with
 * `express.raw()`, so `request.body` is the exact byte buffer Stripe signed.
 */
export async function stripeWebhookHandler(
  request: Request,
  response: Response,
): Promise<void> {
  const signature = request.headers["stripe-signature"];

  if (typeof signature !== "string" || signature.length === 0) {
    throw new AppError("Missing Stripe signature header", 400);
  }

  if (!Buffer.isBuffer(request.body)) {
    throw new AppError("Invalid Stripe webhook body", 400);
  }

  await handleStripeWebhook(request.body, signature);
  response.status(200).json({ success: true, data: { received: true } });
}

/**
 * Admin-only. Cash was collected for a COD order.
 */
export async function completeCodPaymentHandler(
  request: Request,
  response: Response,
): Promise<void> {
  requireUserId(request);

  await completeCodPayment(getOrderIdParam(request));
  response.status(200).json({
    success: true,
    data: { message: "COD payment marked as completed" },
  });
}
