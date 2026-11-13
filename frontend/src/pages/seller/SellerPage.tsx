import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AlertCircle, RotateCw } from "lucide-react";

import { Button } from "../../components/ui";
import { CreateStoreForm } from "../../components/seller/CreateStoreForm";
import { StoreHeader } from "../../components/seller/StoreHeader";
import { SellerOverview } from "./SellerOverview";
import { SellerProducts } from "./SellerProducts";
import { SellerSettings } from "./SellerSettings";
import { getMyStore, type StoreSummary } from "../../services/api";
import type { RootState } from "../../store";

type LoadState = "loading" | "ready" | "error";

const tabs = [
  { to: "/seller", label: "Overview", end: true },
  { to: "/seller/products", label: "Products", end: false },
  { to: "/seller/settings", label: "Settings", end: false },
] as const;

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <PageShell>
      <div aria-busy="true" aria-live="polite" className="animate-pulse space-y-8">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-border" />
          <div className="space-y-2">
            <div className="h-6 w-48 rounded bg-border" />
            <div className="h-4 w-32 rounded bg-border" />
          </div>
        </div>
        <div className="h-10 w-full max-w-md rounded bg-border" />
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 rounded-xl bg-border" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-border" />
        <span className="sr-only">Loading your store…</span>
      </div>
    </PageShell>
  );
}

function PageError({
  message,
  onRetry,
}: {
  message: string | null;
  onRetry: () => void;
}) {
  return (
    <PageShell>
      <div className="mx-auto max-w-xl py-16 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-accent" aria-hidden="true" />
        <h1 className="mb-2 text-2xl font-bold text-text-primary">
          We couldn&apos;t load your store
        </h1>
        <p className="mb-8 text-text-secondary">
          {message ?? "Something went wrong while loading your seller account."}
        </p>
        <Button
          onClick={onRetry}
          leftIcon={<RotateCw className="h-4 w-4" aria-hidden="true" />}
        >
          Try again
        </Button>
      </div>
    </PageShell>
  );
}

export const SellerPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const userRole = useSelector(
    (state: RootState) => state.auth.user?.role ?? null,
  );

  const [store, setStore] = useState<StoreSummary | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (userRole === "ADMIN") {
      navigate("/admin", { replace: true });
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const response = await getMyStore();

        if (cancelled) {
          return;
        }

        setStore(response.store);
        setLoadError(null);
        setLoadState("ready");
      } catch (err) {
        if (cancelled) {
          return;
        }

        setLoadError(
          err instanceof Error ? err.message : "Failed to load your store.",
        );
        setLoadState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, userRole, navigate, reloadKey]);

  const refreshStore = async () => {
    try {
      const response = await getMyStore();

      if (response.store) {
        setStore(response.store);
      }
    } catch {
      // Keep the current store snapshot; the next page load will retry.
    }
  };

  if (loadState === "loading") {
    return <PageSkeleton />;
  }

  if (loadState === "error") {
    return (
      <PageError
        message={loadError}
        onRetry={() => {
          setLoadState("loading");
          setReloadKey((key) => key + 1);
        }}
      />
    );
  }

  if (!store) {
    return (
      <PageShell>
        <CreateStoreForm onCreated={setStore} />
      </PageShell>
    );
  }

  const path = location.pathname.replace(/\/+$/, "");
  const activeTab = path.endsWith("/products")
    ? "products"
    : path.endsWith("/settings")
      ? "settings"
      : "overview";

  return (
    <PageShell>
      <StoreHeader store={store} />

      <nav aria-label="Seller sections" className="mt-6 border-b border-border">
        <ul className="-mb-px flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <li key={tab.to} className="flex-shrink-0">
              <NavLink
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  [
                    "inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-text-secondary hover:border-border hover:text-text-primary",
                  ].join(" ")
                }
              >
                {tab.label}
                {tab.to === "/seller/products" ? (
                  <span className="rounded-full bg-surface-hover px-2 py-0.5 text-xs text-text-secondary">
                    {store.productCount}
                  </span>
                ) : null}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="py-8">
        {activeTab === "overview" ? (
          <SellerOverview store={store} />
        ) : null}

        {activeTab === "products" ? (
          <SellerProducts store={store} onStoreChanged={refreshStore} />
        ) : null}

        {activeTab === "settings" ? (
          <SellerSettings store={store} onStoreUpdated={setStore} />
        ) : null}
      </div>
    </PageShell>
  );
};
