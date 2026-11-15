import { AppError } from "../errors/AppError.js";

/**
 * Stripe refuses to create a Checkout Session for card payments below roughly
 * US$0.50, which is a realistic NPR cart total. Without this guard the order is
 * written and the cart converted first, so the only possible outcome is a
 * cancelled order and an empty cart for the customer.
 *
 * Amounts are minor units (paisa) so the comparison never involves floating
 * point. Throws a 400 when the total is below the configured minimum.
 */
export function assertCardMinimum(
  totalMinorUnits: number,
  minimumNpr: number,
): void {
  const minimumMinorUnits = Math.round(minimumNpr * 100);

  if (totalMinorUnits >= minimumMinorUnits) {
    return;
  }

  const minimum = (minimumMinorUnits / 100).toFixed(2);
  const shortfall = ((minimumMinorUnits - totalMinorUnits) / 100).toFixed(2);

  throw new AppError(
    `Card payments need an order of at least NPR ${minimum}. Add NPR ${shortfall} more, or choose Cash on Delivery.`,
    400,
  );
}
