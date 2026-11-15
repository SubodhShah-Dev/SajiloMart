import { AppDataSource } from "../config/data-source.js";
import { env } from "../config/env.js";
import { Address } from "../entities/Address.js";
import { Cart } from "../entities/Cart.js";
import { Inventory } from "../entities/Inventory.js";
import { Order } from "../entities/Order.js";
import { OrderItem } from "../entities/OrderItem.js";
import { Payment } from "../entities/Payment.js";
import { AppError } from "../errors/AppError.js";
import { assertCardMinimum } from "../utils/card-payment.util.js";
import type { CheckoutInput } from "../validation/order.schema.js";

export interface OrderItemView {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPriceAtPurchase: string;
  lineTotal: string;
}

export interface OrderDetailView {
  id: string;
  status: Order["status"];
  paymentStatus: Order["paymentStatus"];
  paymentMethod: Order["paymentMethod"];
  subtotal: string;
  shippingFee: string;
  total: string;
  shippingAddress: Order["shippingAddress"];
  createdAt: Date;
  items: OrderItemView[];
}

/**
 * Converts an integer amount in minor units (paisa) to the decimal string
 * expected by the `decimal(12,2)` money columns.
 */
function formatMinorUnits(minorUnits: number): string {
  return (minorUnits / 100).toFixed(2);
}

/**
 * Maps an order entity (with items loaded) to the API shape used by the
 * order list and order detail endpoints.
 */
function toOrderDetailView(order: Order): OrderDetailView {
  return {
    id: order.id,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    total: order.total,
    shippingAddress: order.shippingAddress,
    createdAt: order.createdAt,
    items: (order.items ?? [])
      .filter((orderItem) => !orderItem.isRemoved)
      .map((orderItem) => ({
        id: orderItem.id,
        productId: orderItem.productId,
        productName: orderItem.productName,
        quantity: orderItem.quantity,
        unitPriceAtPurchase: orderItem.unitPriceAtPurchase,
        lineTotal: orderItem.lineTotal,
      })),
  };
}

/**
 * Checkout transaction.
 *
 * Creates an order from the user's active cart, snapshots prices and the
 * shipping address, creates the pending payment row, and reserves inventory.
 * Nothing is final until payment is confirmed by a webhook (Stripe) or an
 * admin (COD).
 */
export async function checkout(
  userId: string,
  input: CheckoutInput,
): Promise<OrderDetailView> {
  return AppDataSource.transaction(async (manager) => {
    // 1. The address must belong to the caller.
    const address = await manager.findOne(Address, {
      where: { id: input.addressId, userId, isRemoved: false },
      relations: { district: true },
    });

    if (!address) {
      throw new AppError("Address not found", 404);
    }

    // 2. Load the cart with product + store so availability can be checked.
    const cart = await manager.findOne(Cart, {
      where: { userId, isRemoved: false },
      relations: { items: { product: { store: true } } },
    });

    const activeItems = (cart?.items ?? []).filter((item) => !item.isRemoved);

    if (activeItems.length === 0) {
      throw new AppError("Cart is empty", 400);
    }

    // 3. Lock in a deterministic order so concurrent checkouts cannot deadlock.
    activeItems.sort((a, b) => a.productId.localeCompare(b.productId));

    let subtotalMinorUnits = 0;

    for (const item of activeItems) {
      const product = item.product;

      if (!product || product.isRemoved) {
        throw new AppError(
          "A product in your cart is no longer available.",
          400,
        );
      }

      const store = product.store;

      if (!store || store.isRemoved || store.status !== "APPROVED") {
        throw new AppError(
          `"${product.name}" is not available because its store is not active.`,
          400,
        );
      }

      // 4. Pessimistic write lock prevents two checkouts reserving the same unit.
      const inventory = await manager.findOne(Inventory, {
        where: { productId: item.productId, isRemoved: false },
        lock: { mode: "pessimistic_write" },
      });

      if (!inventory) {
        throw new AppError(`Inventory missing for "${product.name}".`, 400);
      }

      const availableStock = inventory.totalStock - inventory.reservedStock;
      if (availableStock < item.quantity) {
        throw new AppError(`Insufficient stock for "${product.name}".`, 400);
      }

      // Authoritative price comes from the database, never the client.
      const unitPriceMinorUnits = Math.round(Number(product.price) * 100);
      subtotalMinorUnits += unitPriceMinorUnits * item.quantity;

      // 5. Reserve stock; it becomes a sale only after payment succeeds.
      inventory.reservedStock += item.quantity;
      await manager.save(inventory);
    }

    // Shipping rules are not defined yet for the backend; keep the fee at zero
    // until a shipping policy is agreed on. The Stripe session adds it as a
    // separate line item only when it is greater than zero.
    const shippingMinorUnits = 0;
    const totalMinorUnits = subtotalMinorUnits + shippingMinorUnits;

    // 6. A card session below Stripe's minimum can never be created. Reject it
    // before writing anything, otherwise the only outcomes are a cancelled
    // order and a cart the customer can no longer check out.
    if (input.paymentMethod === "STRIPE") {
      assertCardMinimum(totalMinorUnits, env.stripeMinOrderTotalNpr);
    }

    // 7. Create the order with immutable snapshots.
    const order = manager.create(Order, {
      userId,
      status: "PENDING",
      paymentMethod: input.paymentMethod,
      paymentStatus: "PENDING",
      subtotal: formatMinorUnits(subtotalMinorUnits),
      shippingFee: formatMinorUnits(shippingMinorUnits),
      total: formatMinorUnits(totalMinorUnits),
      shippingAddress: {
        recipientName: address.recipientName,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2 ?? null,
        city: address.city,
        district: address.district?.name ?? "",
        province: address.district?.province ?? "",
      },
      items: [],
    });
    await manager.save(order);

    // 8. Snapshot each line so later product edits cannot rewrite history.
    const orderItems = activeItems.map((item) => {
      const unitPriceMinorUnits = Math.round(Number(item.product.price) * 100);

      return manager.create(OrderItem, {
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPriceAtPurchase: formatMinorUnits(unitPriceMinorUnits),
        productName: item.product.name,
        productImageUrl: item.product.imageUrl ?? undefined,
        lineTotal: formatMinorUnits(unitPriceMinorUnits * item.quantity),
      });
    });
    await manager.save(orderItems);

    // 9. One payment row per order, still pending.
    const payment = manager.create(Payment, {
      orderId: order.id,
      amount: formatMinorUnits(totalMinorUnits),
      currency: "NPR",
      paymentProvider: input.paymentMethod,
      status: "PENDING",
    });
    await manager.save(payment);

    // 10. The cart has been converted into an order.
    for (const item of cart?.items ?? []) {
      if (!item.isRemoved) {
        item.isRemoved = true;
        item.deletedAt = new Date();
        await manager.save(item);
      }
    }

    return {
      id: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      total: order.total,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
      items: orderItems.map((orderItem) => ({
        id: orderItem.id,
        productId: orderItem.productId,
        productName: orderItem.productName,
        quantity: orderItem.quantity,
        unitPriceAtPurchase: orderItem.unitPriceAtPurchase,
        lineTotal: orderItem.lineTotal,
      })),
    };
  });
}

/**
 * Orders belonging to the authenticated user, newest first.
 */
export async function listOrders(userId: string): Promise<OrderDetailView[]> {
  const orderRepository = AppDataSource.getRepository(Order);

  const orders = await orderRepository.find({
    where: { userId, isRemoved: false },
    relations: { items: true },
    order: { createdAt: "DESC" },
  });

  return orders.map(toOrderDetailView);
}

/**
 * A single order, scoped to its owner.
 */
export async function getOrder(
  userId: string,
  orderId: string,
): Promise<OrderDetailView> {
  const orderRepository = AppDataSource.getRepository(Order);

  const order = await orderRepository.findOne({
    where: { id: orderId, userId, isRemoved: false },
    relations: { items: true },
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return toOrderDetailView(order);
}

/**
 * Releases the stock reservation held by a Stripe order that will never be
 * paid. Used by the `checkout.session.expired`/failed webhooks and when Stripe
 * cannot even create a session for the order.
 */
export async function releasePendingStripeOrder(
  orderId: string,
  details: { eventType: string; sessionId?: string },
): Promise<void> {
  await AppDataSource.transaction(async (manager) => {
    const paymentRepository = manager.getRepository(Payment);

    const payment = await paymentRepository.findOne({
      where: { orderId },
      relations: { order: { items: true } },
    });

    // Idempotency: only a still-pending payment can be released.
    if (!payment || payment.status !== "PENDING") {
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

    for (const item of order.items) {
      const inventory = await manager.findOne(Inventory, {
        where: { productId: item.productId },
      });

      if (!inventory) {
        continue;
      }

      // Payment failed: release the reservation, keep the stock.
      inventory.reservedStock = Math.max(
        0,
        inventory.reservedStock - item.quantity,
      );
      await manager.save(inventory);
    }

    payment.status = "FAILED";
    payment.gatewayResponse = JSON.stringify(details);
    await manager.save(payment);

    order.status = "CANCELLED";
    order.paymentStatus = "FAILED";
    await manager.save(order);
  });
}

/**
 * Admin action: cash was collected on delivery. Converts the existing stock
 * reservation into a sale, exactly like a successful Stripe payment.
 */
export async function completeCodPayment(orderId: string): Promise<void> {
  await AppDataSource.transaction(async (manager) => {
    const order = await manager.findOne(Order, {
      where: { id: orderId, isRemoved: false },
      relations: { items: true, payment: true },
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.paymentMethod !== "COD") {
      throw new AppError("Order is not a cash-on-delivery order", 400);
    }

    if (order.paymentStatus === "COMPLETED") {
      throw new AppError("Order is already paid", 400);
    }

    if (order.status === "CANCELLED" || order.paymentStatus === "FAILED") {
      throw new AppError("Cannot complete payment for a cancelled order", 400);
    }

    for (const item of order.items) {
      const inventory = await manager.findOne(Inventory, {
        where: { productId: item.productId, isRemoved: false },
        lock: { mode: "pessimistic_write" },
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

      inventory.totalStock -= item.quantity;
      inventory.reservedStock -= item.quantity;
      await manager.save(inventory);
    }

    if (order.payment) {
      order.payment.status = "COMPLETED";
      order.payment.gatewayResponse = JSON.stringify({
        eventType: "cod.completed",
      });
      await manager.save(order.payment);
    }

    order.status = "CONFIRMED";
    order.paymentStatus = "COMPLETED";
    await manager.save(order);
  });
}
