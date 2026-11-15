import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Package } from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  type BadgeProps,
} from "../components/ui";
import { getOrders, type OrderDetail, type OrderStatus } from "../services/api";

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: BadgeProps["variant"] }
> = {
  PENDING: {
    label: "Pending",
    variant: "warning",
  },
  CONFIRMED: {
    label: "Confirmed",
    variant: "primary",
  },
  PARTIAL: {
    label: "Partially fulfilled",
    variant: "secondary",
  },
  FULFILLED: {
    label: "Fulfilled",
    variant: "success",
  },
  CANCELLED: {
    label: "Cancelled",
    variant: "danger",
  },
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

const FILTERS: Array<{ value: "ALL" | OrderStatus; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PARTIAL", label: "Partial" },
  { value: "FULFILLED", label: "Fulfilled" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const OrdersPage = () => {
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | OrderStatus>("ALL");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const result = await getOrders();
        if (mounted) {
          setOrders(result);
        }
      } catch (loadError) {
        if (mounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load your orders.",
          );
        }
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
  }, []);

  const visibleOrders =
    filter === "ALL" ? orders : orders.filter((order) => order.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-lg text-text-secondary">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">My Orders</h1>
          <p className="text-text-secondary">
            Track and manage your order history
          </p>
        </div>

        {error && (
          <div
            className="mb-6 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent"
            role="alert"
          >
            {error}
          </div>
        )}

        <div
          className="flex flex-wrap gap-2 mb-8"
          role="tablist"
          aria-label="Order status filters"
        >
          {FILTERS.map((tab) => {
            const count =
              tab.value === "ALL"
                ? orders.length
                : orders.filter((order) => order.status === tab.value).length;

            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={filter === tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === tab.value
                    ? "bg-primary text-text-inverse"
                    : "bg-surface hover:bg-surface-hover text-text-secondary"
                }`}
              >
                {tab.label}
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-black/10">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {visibleOrders.length === 0 ? (
          <Card variant="outlined">
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-text-muted mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                No orders yet
              </h2>
              <p className="text-text-secondary mb-6">
                When you place an order, it will appear here.
              </p>
              <Link to="/browse" className="inline-flex">
                <Button
                  variant="primary"
                  leftIcon={<Package className="h-4 w-4" aria-hidden="true" />}
                >
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6" role="list" aria-label="Orders">
            {visibleOrders.map((order) => {
              const status = statusConfig[order.status];
              const payment = paymentConfig[order.paymentStatus];

              return (
                <Card key={order.id} variant="outlined" role="listitem">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-surface rounded-xl shrink-0">
                          <Package
                            className="h-6 w-6 text-primary"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-medium text-text-primary">
                              {order.id.slice(0, 8).toUpperCase()}
                            </span>
                            <Badge variant={status.variant} className="ml-2 gap-1">
                              {status.label}
                            </Badge>
                            <Badge variant={payment.variant} className="ml-2">
                              {payment.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-text-secondary mt-1">
                            Placed on {format(new Date(order.createdAt), "MMMM d, yyyy")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 sm:justify-end sm:ml-auto">
                        <span className="text-lg font-bold text-text-primary">
                          Rs {Number(order.total).toFixed(2)}
                        </span>
                        <Link to={`/orders/${order.id}`} className="inline-flex">
                          <Button variant="outline" size="sm">
                            View details
                          </Button>
                        </Link>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4 space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between gap-3 text-sm"
                        >
                          <span className="text-text-secondary">
                            {item.productName} × {item.quantity}
                          </span>
                          <span className="font-medium text-text-primary">
                            Rs {Number(item.lineTotal).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
