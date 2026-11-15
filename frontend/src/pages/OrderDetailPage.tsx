import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, CheckCircle, Clock, CreditCard, MapPin, XCircle } from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  type BadgeProps,
} from "../components/ui";
import { getOrder, type OrderDetail, type OrderStatus } from "../services/api";

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: BadgeProps["variant"] }
> = {
  PENDING: { label: "Pending", variant: "warning" },
  CONFIRMED: { label: "Confirmed", variant: "primary" },
  PARTIAL: { label: "Partially fulfilled", variant: "secondary" },
  FULFILLED: { label: "Fulfilled", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "danger" },
};

const paymentConfig: Record<
  OrderDetail["paymentStatus"],
  { label: string; variant: BadgeProps["variant"] }
> = {
  PENDING: { label: "Payment pending", variant: "warning" },
  COMPLETED: { label: "Paid", variant: "success" },
  FAILED: { label: "Payment failed", variant: "danger" },
  REFUNDED: { label: "Refunded", variant: "default" },
};

export const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const paymentResult = searchParams.get("payment");

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = async () => {
    if (!orderId) {
      return;
    }

    try {
      const result = await getOrder(orderId);
      setOrder(result);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load this order.",
      );
    }
  };

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!orderId) {
        setError("Order not found.");
        setLoading(false);
        return;
      }

      try {
        const result = await getOrder(orderId);
        if (!mounted) {
          return;
        }
        setOrder(result);
        setError(null);
      } catch (loadError) {
        if (!mounted) {
          return;
        }
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load this order.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-lg text-text-secondary">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            Order unavailable
          </h1>
          <p className="text-text-secondary mb-8">{error ?? "Order not found."}</p>
          <Link to="/orders" className="inline-flex">
            <Button variant="outline">Back to orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[order.status];
  const payment = paymentConfig[order.paymentStatus];
  const address = order.shippingAddress;

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to orders
        </Link>

        {paymentResult === "success" && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              order.paymentStatus === "COMPLETED"
                ? "border-success/40 bg-success/10 text-success"
                : "border-warning/40 bg-warning/10 text-warning"
            }`}
            role="status"
          >
            {order.paymentStatus === "COMPLETED" ? (
              <span className="inline-flex items-center gap-2">
                <CheckCircle className="h-4 w-4" aria-hidden="true" />
                Payment received. Your order is confirmed.
              </span>
            ) : (
              <span className="inline-flex flex-wrap items-center gap-2">
                <Clock className="h-4 w-4" aria-hidden="true" />
                Payment received by Stripe. We are waiting for the confirmation
                webhook.
                <Button variant="ghost" size="sm" onClick={() => void loadOrder()}>
                  Refresh
                </Button>
              </span>
            )}
          </div>
        )}

        {paymentResult === "cancelled" && (
          <div
            className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning"
            role="status"
          >
            <span className="inline-flex items-center gap-2">
              <XCircle className="h-4 w-4" aria-hidden="true" />
              Payment was cancelled. The order stays reserved until the Stripe
              session expires, then the stock is released.
            </span>
          </div>
        )}

        <Card variant="outlined">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl">
                  Order {order.id.slice(0, 8).toUpperCase()}
                </CardTitle>
                <p className="text-sm text-text-secondary mt-1">
                  Placed on {format(new Date(order.createdAt), "MMMM d, yyyy")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={status.variant}>{status.label}</Badge>
                <Badge variant={payment.variant}>{payment.label}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium text-text-primary">Items</h3>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-3 rounded-lg bg-surface p-3 text-sm"
                >
                  <span className="text-text-primary">
                    {item.productName} × {item.quantity}
                  </span>
                  <span className="font-medium text-text-primary">
                    Rs {Number(item.lineTotal).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg bg-surface p-4 space-y-2">
                <h3 className="flex items-center gap-2 font-medium text-text-primary">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  Shipping Address
                </h3>
                <p className="text-sm text-text-secondary">
                  {address.recipientName}
                  <br />
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ""}
                  <br />
                  {address.city}, {address.district}
                  <br />
                  {address.province}
                  <br />
                  {address.phone}
                </p>
              </div>

              <div className="rounded-lg bg-surface p-4 space-y-2">
                <h3 className="flex items-center gap-2 font-medium text-text-primary">
                  <CreditCard className="h-4 w-4" aria-hidden="true" />
                  Payment
                </h3>
                <p className="text-sm text-text-secondary">
                  Method:{" "}
                  {order.paymentMethod === "STRIPE"
                    ? "Card (Stripe test mode)"
                    : "Cash on delivery"}
                </p>
                <div className="border-t border-border pt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Subtotal</span>
                    <span className="text-text-primary">
                      Rs {Number(order.subtotal).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Shipping</span>
                    <span className="text-text-primary">
                      {Number(order.shippingFee) === 0
                        ? "Free"
                        : `Rs ${Number(order.shippingFee).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold pt-1">
                    <span className="text-text-primary">Total</span>
                    <span className="text-text-primary">
                      Rs {Number(order.total).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
