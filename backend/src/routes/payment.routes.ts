import { Router } from "express";

import {
  completeCodPaymentHandler,
  createStripeSessionHandler,
  stripeWebhookHandler,
} from "../controllers/payment.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/requireRole.js";

export const paymentRouter = Router();

// Stripe calls this directly; it authenticates by webhook signature, not a JWT.
// The route is mounted with express.raw() in app.ts.
paymentRouter.post("/webhook", stripeWebhookHandler);

paymentRouter.use(authenticateToken);

paymentRouter.post("/stripe/:orderId/session", createStripeSessionHandler);
paymentRouter.post(
  "/cod/:orderId/complete",
  requireRole("ADMIN"),
  completeCodPaymentHandler,
);
