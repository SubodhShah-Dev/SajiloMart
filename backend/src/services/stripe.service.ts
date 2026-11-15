import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import Stripe from "stripe";
import { AppDataSource } from "../config/data-source.js";
import { Order } from "../entities/Order.js";
import { Payment } from "../entities/Payment.js";
import { Inventory } from "../entities/Inventory.js";
import { AppError } from "../errors/AppError.js";
import { releasePendingStripeOrder } from "./order.service.js";

if (env.stripeSecretKey === undefined) {
  throw new Error(
    "STRIPE_SECRET_KEY is required to use Stripe payments. Add it to backend/.env.",
  );
}

const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: "2026-10-28.endive",
  typescript: true,
});

export interface StripeSessionView{
  id: string;
  url: string;
  expiresAt: number
}

/* Takes orderId and userId as inputs and returns checkout session.
Steps:
i - Init orderRepo.
ii - Find the required order using orderId and userId. Relation to OrderItem should be true.
iii - Validate if order exist, order payment method is Stripe or not and if order payment status is pending or completed. Throw error in case not.
iv - Create line_items as per the Stripe client requirement by mapping the order items array(relation due to it).
v - Add Shipping to line_items if order shiping fee is greater than 0.
vi - Create Stripe session using those line_items as the option along with other required options as per the app need.
vii - Init paymentRepo.
viii - Find payment record with matching orderId.
ix - Validate the payment record. If available go to step x. If not go to step xi.
x - Set the payment id to session id returned by Stripe session creation(session.id).
xi - Return required session data such as: {id: session.id, url: session.url,expiresAt:session.expires_at*1000}.
*/
export const createCheckoutSession = async (
  orderId: string,
  userId: string,
): Promise<StripeSessionView> => {
  const orderRepo = AppDataSource.getRepository(Order)
  const order = await orderRepo.findOne({
    where: { id: orderId, userId },
    relations: {items: true}
  })

  if(!order) throw new AppError("Order not found", 404)

  if(order.paymentMethod !== "STRIPE") throw new AppError("Payment method is not Stripe", 400)

  if (order.paymentStatus !== "PENDING") throw new AppError("Payment already processed", 400)

  const line_items = order.items.map((item) => ({
    price_data: {
      currency: "npr",
      product_data: {
        name: item.productName
      },
      unit_amount: Math.round(Number(item.unitPriceAtPurchase)*100)
    },
    quantity: item.quantity
  }))

  if (Number(order.shippingFee) > 0) {
    line_items.push({
      price_data: {
        currency: "npr",
        product_data: {
          name: "Shipping"
        },
        unit_amount: Math.round(Number(order.shippingFee)*100)
      },
      quantity: 1
    })
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    allowed_payment_method_types: ["card"],
    line_items,
    client_reference_id: order.id,
    metadata: {
      orderId: order.id,
      userId
    },
    success_url: `${env.frontendUrl}/orders/${order.id}?payment=success`,
    cancel_url: `${env.frontendUrl}/orders/${order.id}?payment=cancelled`,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
  }).catch(async (error: unknown) => {
    // Stripe rejects orders below its minimum charge (about US$0.50). That is a
    // client-fixable problem, so surface it as a 400 instead of a 500.
    if (error instanceof Stripe.errors.StripeInvalidRequestError) {
      // Keep the provider's reason visible: the friendly 400 below hides it
      // from the client, and without this line a failure is invisible.
      logger.error(
        `Stripe Checkout Session creation failed for order ${order.id}: ${error.type} ${error.code ?? ""} ${error.message}`,
      );

      // No session was ever created, so Stripe will never send an expiry event
      // for this order. Release it now or the reservation leaks forever.
      await releasePendingStripeOrder(order.id, {
        eventType: "checkout.session.creation_failed",
      });
      throw new AppError(
        "Card payment is not available for this order amount. Add more items or choose Cash on Delivery.",
        400,
      );
    }

    throw error;
  });

  const paymentRepo = AppDataSource.getRepository(Payment);
  const payment = await paymentRepo.findOne({
    where: {orderId: order.id}
  })

  if (payment) {
    payment.transactionId = session.id;
    await paymentRepo.save(payment)
  }

  return {
    id: session.id,
    url: session.url as string,
    expiresAt: session.expires_at * 1000,
  };
};

export async function handleStripeWebhook(
  rawBody: Buffer,
  signature: string,
): Promise<void> {
  if (env.stripeWebhookSecret === undefined) {
    throw new AppError(
      "STRIPE_WEBHOOK_SECRET is not configured; cannot verify webhooks.",
      500,
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.stripeWebhookSecret,
    );
  } catch {
    throw new AppError("Invalid Stripe webhook signature", 400);
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await completeStripePayment(
        event.data.object as Stripe.Checkout.Session,
        event.type,
      );
      return;

    case "checkout.session.expired":
    case "checkout.session.async_payment_failed":
      await releaseStripePayment(
        event.data.object as Stripe.Checkout.Session,
        event.type,
      );
      return;

    default:
      // Other event types are acknowledged but not handled.
      return;
  }
}

async function completeStripePayment(
  session: Stripe.Checkout.Session,
  eventType: string,
): Promise<void> {
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    return;
  }

  await AppDataSource.transaction(async (manager) => {
    const paymentRepository = manager.getRepository(Payment);

    const payment = await paymentRepository.findOne({
      where: { orderId },
      relations: { order: { items: true } },
    });

    // Idempotency: a duplicate webhook must not process twice.
    if (!payment || payment.status === "COMPLETED") {
      return;
    }

    const order = payment.order;
    if (
      !order ||
      order.status !== "PENDING" ||
      order.paymentMethod !== "STRIPE"
    ) {
      return;
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    for (const item of order.items) {
      const inventory = await manager.findOne(Inventory, {
        where: { productId: item.productId },
      });

      if (!inventory) {
        throw new AppError(
          `Inventory missing for product ${item.productId}.`,
          500,
        );
      }

      if (
        inventory.reservedStock < item.quantity ||
        inventory.totalStock < item.quantity
      ) {
        throw new AppError(
          `Stock invariant violated for product ${item.productId}.`,
          500,
        );
      }

      // Sale is final: the reserved units leave the warehouse.
      inventory.totalStock -= item.quantity;
      inventory.reservedStock -= item.quantity;
      await manager.save(inventory);
    }

    payment.status = "COMPLETED";
    if (paymentIntentId !== undefined) {
      payment.transactionId = paymentIntentId;
    }
    payment.gatewayResponse = JSON.stringify({
      eventType,
      sessionId: session.id,
      paymentStatus: session.payment_status,
    });
    await manager.save(payment);

    order.status = "CONFIRMED";
    order.paymentStatus = "COMPLETED";
    await manager.save(order);
  });
}

async function releaseStripePayment(
  session: Stripe.Checkout.Session,
  eventType: string,
): Promise<void> {
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    return;
  }

  await releasePendingStripeOrder(orderId, {
    eventType,
    sessionId: session.id,
  });
}
