import { Package, Truck, CheckCircle, Clock, XCircle, Eye, Download, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { Button, Card, CardContent, Badge, type BadgeProps } from "../components/ui";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { format } from "date-fns";

interface Order {
  id: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "returned";
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: string;
  paymentMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

const mockOrders: Order[] = [
  {
    id: "ORD-2024-001",
    date: "2024-01-15",
    status: "delivered",
    items: [
      { id: "1", name: "Wireless Noise-Canceling Headphones", price: 299.99, quantity: 1, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop" },
      { id: "4", name: "Stainless Steel Water Bottle", price: 24.99, quantity: 2, image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop" },
    ],
    subtotal: 349.97,
    shipping: 0,
    tax: 28.00,
    total: 377.97,
    shippingAddress: "123 Main St, New York, NY 10001",
    paymentMethod: "Visa ending in 4242",
    trackingNumber: "TRK123456789",
    estimatedDelivery: "2024-01-18",
  },
  {
    id: "ORD-2024-002",
    date: "2024-01-10",
    status: "shipped",
    items: [
      { id: "2", name: "Smart Watch Series 7", price: 399.99, quantity: 1, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop" },
    ],
    subtotal: 399.99,
    shipping: 9.99,
    tax: 32.00,
    total: 441.98,
    shippingAddress: "123 Main St, New York, NY 10001",
    paymentMethod: "Mastercard ending in 8888",
    trackingNumber: "TRK987654321",
    estimatedDelivery: "2024-01-14",
  },
  {
    id: "ORD-2024-003",
    date: "2024-01-05",
    status: "processing",
    items: [
      { id: "3", name: "Organic Cotton T-Shirt", price: 29.99, quantity: 2, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop" },
      { id: "6", name: "Yoga Mat Premium", price: 49.99, quantity: 1, image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop" },
    ],
    subtotal: 109.97,
    shipping: 9.99,
    tax: 8.80,
    total: 128.76,
    shippingAddress: "123 Main St, New York, NY 10001",
    paymentMethod: "PayPal",
  },
  {
    id: "ORD-2024-004",
    date: "2023-12-28",
    status: "cancelled",
    items: [
      { id: "5", name: "Vitamin C Serum", price: 34.99, quantity: 1, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop" },
    ],
    subtotal: 34.99,
    shipping: 9.99,
    tax: 2.80,
    total: 47.78,
    shippingAddress: "123 Main St, New York, NY 10001",
    paymentMethod: "Visa ending in 4242",
  },
];

const getStatusConfig = (status: Order["status"]) => {
  const configs: Record<Order["status"], { variant: BadgeProps["variant"]; label: string; icon: React.ReactNode; color: string }> = {
    pending: { variant: "warning", label: "Pending", icon: <Clock className="h-3 w-3" aria-hidden="true" />, color: "text-warning" },
    processing: { variant: "primary", label: "Processing", icon: <Package className="h-3 w-3" aria-hidden="true" />, color: "text-primary" },
    shipped: { variant: "secondary", label: "Shipped", icon: <Truck className="h-3 w-3" aria-hidden="true" />, color: "text-secondary-hover" },
    delivered: { variant: "success", label: "Delivered", icon: <CheckCircle className="h-3 w-3" aria-hidden="true" />, color: "text-success" },
    cancelled: { variant: "danger", label: "Cancelled", icon: <XCircle className="h-3 w-3" aria-hidden="true" />, color: "text-accent" },
    returned: { variant: "default", label: "Returned", icon: <RotateCcw className="h-3 w-3" aria-hidden="true" />, color: "text-text-muted" },
  };
  return configs[status];
};

export const OrdersPage = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <Package className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Please Sign In</h2>
          <p className="text-text-secondary mb-6">You need to be signed in to view your orders.</p>
          <a href="/login" className="inline-flex items-center gap-2">
            <Button variant="primary">Sign In</Button>
          </a>
        </div>
      </div>
    );
  }

  const statusTabs: Array<{ value: "all" | Order["status"]; label: string; count: number }> = [
    { value: "all", label: "All Orders", count: mockOrders.length },
    { value: "pending", label: "Pending", count: mockOrders.filter((o) => o.status === "pending").length },
    { value: "processing", label: "Processing", count: mockOrders.filter((o) => o.status === "processing").length },
    { value: "shipped", label: "Shipped", count: mockOrders.filter((o) => o.status === "shipped").length },
    { value: "delivered", label: "Delivered", count: mockOrders.filter((o) => o.status === "delivered").length },
    { value: "cancelled", label: "Cancelled", count: mockOrders.filter((o) => o.status === "cancelled").length },
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">My Orders</h1>
          <p className="text-text-secondary">Track and manage your order history</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label="Order status filters">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab.value === "all"
                  ? "bg-primary text-white"
                  : "bg-surface hover:bg-surface-hover text-text-secondary"
              }`}
              aria-selected={tab.value === "all"}
            >
              {tab.label} <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/20">{tab.count}</span>
            </button>
          ))}
        </div>

        {mockOrders.length === 0 ? (
          <Card variant="outlined">
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-text-muted mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-text-primary mb-2">No Orders Yet</h2>
              <p className="text-text-secondary mb-6">When you place an order, it will appear here.</p>
              <a href="/browse">
                <Button variant="primary" leftIcon={<Package className="h-4 w-4" aria-hidden="true" />}>
                  Start Shopping
                </Button>
              </a>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6" role="list" aria-label="Orders">
            {mockOrders.map((order) => {
              const config = getStatusConfig(order.status);
              const isExpanded = expandedOrder === order.id;

              return (
                <Card key={order.id} variant="outlined" role="listitem">
                  <CardContent className="p-0">
                    <div className="p-6 border-b border-border">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-surface rounded-xl">
                            <Package className="h-6 w-6 text-primary" aria-hidden="true" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-medium text-text-primary">{order.id}</span>
                              <Badge variant={config.variant} className="gap-1">{config.icon}{config.label}</Badge>
                            </div>
                            <p className="text-sm text-text-secondary mt-1">Placed on {format(new Date(order.date), "MMMM d, yyyy")}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 sm:ml-auto">
                          <span className="text-lg font-bold text-text-primary">${order.total.toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                            className="p-2 text-text-muted hover:text-text-primary transition-colors"
                            aria-expanded={isExpanded}
                            aria-controls={`order-details-${order.id}`}
                          >
                            {isExpanded ? <ChevronUp className="h-5 w-5" aria-hidden="true" /> : <ChevronDown className="h-5 w-5" aria-hidden="true" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div id={`order-details-${order.id}`} className={`${isExpanded ? "block" : "hidden"} animate-slide-down`}>
                      <div className="p-6 space-y-6">
                        <div className="grid gap-6 md:grid-cols-3">
                          <div className="md:col-span-2 space-y-4">
                            <h3 className="font-medium text-text-primary">Items</h3>
                            <div className="space-y-3">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex gap-4 p-3 bg-surface rounded-lg">
                                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-text-primary truncate">{item.name}</p>
                                    <p className="text-sm text-text-secondary">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                                  </div>
                                  <span className="font-medium text-text-primary whitespace-nowrap">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="p-4 bg-surface rounded-lg space-y-2">
                              <h4 className="font-medium text-text-primary">Order Summary</h4>
                              <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Subtotal</span>
                                <span className="text-text-primary">${order.subtotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Shipping</span>
                                <span className="text-text-primary">{order.shipping === 0 ? "Free" : `$${order.shipping.toFixed(2)}`}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Tax</span>
                                <span className="text-text-primary">${order.tax.toFixed(2)}</span>
                              </div>
                              <div className="border-t border-border pt-2 flex justify-between font-bold">
                                <span className="text-text-primary">Total</span>
                                <span className="text-text-primary">${order.total.toFixed(2)}</span>
                              </div>
                            </div>

                            <div className="p-4 bg-surface rounded-lg space-y-2">
                              <h4 className="font-medium text-text-primary">Shipping To</h4>
                              <p className="text-sm text-text-secondary">{order.shippingAddress}</p>
                            </div>

                            <div className="p-4 bg-surface rounded-lg space-y-2">
                              <h4 className="font-medium text-text-primary">Payment Method</h4>
                              <p className="text-sm text-text-secondary">{order.paymentMethod}</p>
                            </div>
                          </div>
                        </div>

                        {order.trackingNumber && (
                          <div className="p-4 bg-primary-light border border-primary/20 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Truck className="h-6 w-6 text-primary flex-shrink-0" aria-hidden="true" />
                              <div>
                                <p className="font-medium text-primary">Track Your Shipment</p>
                                <p className="text-sm text-primary/80">Tracking: <span className="font-mono">{order.trackingNumber}</span></p>
                              </div>
                              <Button variant="outline" size="sm" leftIcon={<Eye className="h-4 w-4" aria-hidden="true" />}>
                                Track
                              </Button>
                            </div>
                            {order.estimatedDelivery && (
                              <p className="text-sm text-primary/80 mt-2">Estimated delivery: {format(new Date(order.estimatedDelivery), "MMMM d, yyyy")}</p>
                            )}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                          <Button variant="outline" leftIcon={<Eye className="h-4 w-4" aria-hidden="true" />} onClick={() => alert("View details")}>
                            View Details
                          </Button>
                          <Button variant="outline" leftIcon={<Download className="h-4 w-4" aria-hidden="true" />} onClick={() => alert("Download invoice")}>
                            Download Invoice
                          </Button>
                          {order.status === "delivered" && (
                            <Button variant="outline" leftIcon={<RotateCcw className="h-4 w-4" aria-hidden="true" />} onClick={() => alert("Start return")}>
                              Return Item
                            </Button>
                          )}
                          {["pending", "processing"].includes(order.status) && (
                            <Button variant="outline" leftIcon={<XCircle className="h-4 w-4" aria-hidden="true" />} className="text-accent hover:text-accent-hover hover:bg-accent/10" onClick={() => alert("Cancel order")}>
                              Cancel Order
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="primary" size="sm">1</Button>
          <Button variant="outline" size="sm">2</Button>
          <Button variant="outline" size="sm">3</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
};

import { useState } from "react";