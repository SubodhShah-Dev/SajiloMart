import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BarChart2,
  CheckCircle,
  Circle,
  Clock,
  Package,
  Shield,
  Store as StoreIcon,
} from "lucide-react";

import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "../../components/ui";
import { storeCategoryLabel } from "../../components/seller/storeOptions";
import { verificationMeta } from "../../components/seller/storeStatus";
import {
  getVendorProducts,
  type StoreSummary,
  type VendorProduct,
} from "../../services/api";

type DataState = "loading" | "ready" | "error";

interface SellerOverviewProps {
  store: StoreSummary;
}

const healthChecks = [
  { key: "description", label: "Store description" },
  { key: "logoUrl", label: "Store logo" },
  { key: "phone", label: "Contact phone" },
  { key: "returnPolicy", label: "Return policy" },
  { key: "shippingPolicy", label: "Shipping policy" },
] as const;

function StatusBanner({ store }: { store: StoreSummary }) {
  if (store.status === "SUSPENDED") {
    return (
      <div
        role="alert"
        className="mb-6 flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/5 p-4"
      >
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" aria-hidden="true" />
        <div>
          <p className="font-medium text-text-primary">Your store is suspended</p>
          <p className="mt-1 text-sm text-text-secondary">
            {store.suspensionReason ??
              "You cannot list products or update your store until this is resolved. Contact support if you believe this is a mistake."}
          </p>
        </div>
      </div>
    );
  }

  if (store.status === "PENDING") {
    return (
      <div
        role="status"
        className="mb-6 flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4"
      >
        <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-warning" aria-hidden="true" />
        <div>
          <p className="font-medium text-text-primary">Your store is awaiting approval</p>
          <p className="mt-1 text-sm text-text-secondary">
            You can finish setting up your store, but products can only be listed once an
            administrator approves it.
          </p>
        </div>
      </div>
    );
  }

  if (store.verificationStatus === "PENDING") {
    return (
      <div
        role="status"
        className="mb-6 flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4"
      >
        <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-warning" aria-hidden="true" />
        <div>
          <p className="font-medium text-text-primary">Verification under review</p>
          <p className="mt-1 text-sm text-text-secondary">
            We&apos;re reviewing your verification request. You&apos;ll get unlimited
            listings once it&apos;s approved.
          </p>
        </div>
      </div>
    );
  }

  if (store.verificationStatus === "REJECTED") {
    return (
      <div
        role="alert"
        className="mb-6 flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/5 p-4"
      >
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" aria-hidden="true" />
        <div>
          <p className="font-medium text-text-primary">Verification was rejected</p>
          <p className="mt-1 text-sm text-text-secondary">
            Address the feedback and request verification again from{" "}
            <Link to="/seller/settings" className="font-medium text-primary hover:underline">
              Settings
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return null;
}

function MetricCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <Card padding="md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-text-secondary">{label}</p>
        <span className="rounded-lg bg-primary-light p-2 text-primary" aria-hidden="true">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold text-text-primary">{value}</p>
      <p className="mt-1 text-sm text-text-secondary">{hint}</p>
    </Card>
  );
}

export const SellerOverview = ({ store }: SellerOverviewProps) => {
  const [dataState, setDataState] = useState<DataState>("loading");
  const [recentProducts, setRecentProducts] = useState<VendorProduct[]>([]);
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [allProducts, activeProducts] = await Promise.all([
          getVendorProducts({ page: 1, limit: 5, status: "all" }),
          getVendorProducts({ page: 1, limit: 1, status: "active" }),
        ]);

        if (cancelled) {
          return;
        }

        setRecentProducts(allProducts.products);
        setActiveCount(activeProducts.total);
        setDataState("ready");
      } catch {
        if (!cancelled) {
          setDataState("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const canListProducts = store.status === "APPROVED";
  const atListingLimit =
    store.listingLimit !== null && store.productCount >= store.listingLimit;
  const verification = verificationMeta(store.verificationStatus);

  return (
    <div className="space-y-8">
      <StatusBanner store={store} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Products listed"
          value={String(store.productCount)}
          hint={
            store.listingLimit === null
              ? "Unlimited listings"
              : `${store.listingLimit} allowed on your plan`
          }
          icon={<Package className="h-5 w-5" />}
        />
        <MetricCard
          label="Active products"
          value={activeCount === null ? "—" : String(activeCount)}
          hint={dataState === "error" ? "Couldn't load counts" : "Visible in the catalogue"}
          icon={<BarChart2 className="h-5 w-5" />}
        />
        <MetricCard
          label="Verification"
          value={verification.label}
          hint={
            store.verificationStatus === "VERIFIED"
              ? "Unlimited listings"
              : "Request from Settings"
          }
          icon={<Shield className="h-5 w-5" />}
        />
        <MetricCard
          label="Store category"
          value={storeCategoryLabel(store.category)}
          hint={`Opened ${new Date(store.createdAt).toLocaleDateString()}`}
          icon={<StoreIcon className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card padding="none" className="min-w-0 lg:col-span-2">
          <CardHeader className="mb-0 flex flex-row items-center justify-between gap-3 border-b border-border p-5">
            <div>
              <CardTitle>Recent products</CardTitle>
              <p className="mt-1 text-sm text-text-secondary">
                Your five most recently created listings.
              </p>
            </div>
            <Link
              to="/seller/products"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </CardHeader>

          <CardContent>
            {dataState === "loading" ? (
              <div className="space-y-3 p-5" aria-busy="true">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-14 animate-pulse rounded-lg bg-border" />
                ))}
              </div>
            ) : dataState === "error" ? (
              <div className="p-6 text-center">
                <p className="text-sm text-text-secondary">
                  Couldn&apos;t load your products.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    setDataState("loading");
                    setReloadKey((key) => key + 1);
                  }}
                >
                  Try again
                </Button>
              </div>
            ) : recentProducts.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
                <p className="font-medium text-text-primary">No products yet</p>
                <p className="mt-1 text-sm text-text-secondary">
                  {canListProducts
                    ? "Add your first product to start selling."
                    : "You can add products once your store is approved."}
                </p>
                {canListProducts && !atListingLimit ? (
                  <Link to="/seller/products" className="mt-4 inline-block">
                    <Button size="sm">Add a product</Button>
                  </Link>
                ) : null}
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recentProducts.map((product) => (
                  <li key={product.id}>
                    <Link
                      to="/seller/products"
                      className="flex items-center gap-4 p-4 transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt=""
                          className="h-12 w-12 flex-shrink-0 rounded-lg border border-border object-cover"
                        />
                      ) : (
                        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-surface-hover text-text-muted">
                          <Package className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-text-primary">
                          {product.name}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {product.totalStock} in stock
                        </p>
                      </div>

                      <div className="flex flex-shrink-0 items-center gap-3">
                        <span className="text-sm font-medium text-text-primary">
                          ${product.price.toFixed(2)}
                        </span>
                        <Badge
                          variant={product.status === "active" ? "success" : "danger"}
                          size="sm"
                        >
                          {product.status === "active" ? "Active" : "Removed"}
                        </Badge>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card padding="none" className="min-w-0">
          <CardHeader className="mb-0 border-b border-border p-5">
            <CardTitle>Store health</CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              Complete details build buyer trust.
            </p>
          </CardHeader>

          <CardContent className="p-5">
            <ul className="space-y-1">
              {healthChecks.map((check) => {
                const done = Boolean(store[check.key]);

                return (
                  <li
                    key={check.key}
                    className="flex items-center justify-between gap-3 py-2"
                  >
                    <span className="flex items-center gap-2 text-sm">
                      {done ? (
                        <CheckCircle
                          className="h-4 w-4 flex-shrink-0 text-success"
                          aria-hidden="true"
                        />
                      ) : (
                        <Circle
                          className="h-4 w-4 flex-shrink-0 text-text-muted"
                          aria-hidden="true"
                        />
                      )}
                      <span className={done ? "text-text-primary" : "text-text-secondary"}>
                        {check.label}
                      </span>
                      <span className="sr-only">{done ? "complete" : "missing"}</span>
                    </span>

                    {!done ? (
                      <Link
                        to="/seller/settings"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Add
                      </Link>
                    ) : null}
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 border-t border-border pt-4">
              <Link to="/seller/settings" className="block">
                <Button variant="outline" fullWidth size="sm">
                  Edit store details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card padding="md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-text-primary">Orders</p>
            <p className="text-sm text-text-secondary">
              Order management isn&apos;t available yet. Buyer orders are handled by
              SajiloMart support for now.
            </p>
          </div>
          <Badge variant="outline" size="sm">
            Coming soon
          </Badge>
        </div>
      </Card>
    </div>
  );
};
