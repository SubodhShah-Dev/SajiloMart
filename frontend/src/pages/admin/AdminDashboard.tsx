import { useEffect, useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Download, Settings } from "lucide-react";
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from "../../components/ui";
import { AdminStatsCards } from "./AdminStatsCards";
import { AdminVerificationChart } from "./AdminVerificationChart";
import { AdminFilters } from "./AdminFilters";
import { AdminStoresTable } from "./AdminStoresTable";
import { AdminStoreActionModals } from "./AdminStoreActionModals";
import { AdminPagination } from "./AdminPagination";
import { adminVerifyStore, adminRejectStore, adminSuspendStore, adminUnsuspendStore, getAdminStores, type AdminStoreSummary } from "../../services/api";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { useAdminToast } from "../../hooks/useAdminToast";

export const AdminDashboard = () => {
  const { showToast } = useAdminToast();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userRole = useSelector((state: RootState) => state.auth.user?.role ?? null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [stores, setStores] = useState<AdminStoreSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Initialize state from URL search params
  const [page, setPage] = useState(() => {
    const params = new URLSearchParams(searchParams);
    return parseInt(params.get("page") || "1", 10);
  });
  const [limit, setLimit] = useState(() => {
    const params = new URLSearchParams(searchParams);
    return parseInt(params.get("limit") || "20", 10);
  });
  const [verificationStatus, setVerificationStatus] = useState(() => {
    const params = new URLSearchParams(searchParams);
    return params.get("verificationStatus") || "";
  });
  const [status, setStatus] = useState(() => {
    const params = new URLSearchParams(searchParams);
    return params.get("status") || "";
  });
  const [search, setSearch] = useState(() => {
    const params = new URLSearchParams(searchParams);
    return params.get("search") || "";
  });
  const [sort, setSort] = useState("createdAt");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");

  const loadStores = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAdminStores({
        page,
        limit,
        verificationStatus: verificationStatus || undefined,
        status: status || undefined,
        search: search || undefined,
      });
      setStores(result.stores);
      setTotal(result.total);
      setSelectedKeys(new Set());
    } catch (error) {
      console.error("Failed to fetch stores:", error);
      showToast({
        type: "error",
        title: "Failed to load stores",
        message: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit, verificationStatus, status, search, showToast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStores();
  }, [loadStores]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams);
    if (value) params.set("search", value);
    else params.delete("search");
    params.set("page", "1");
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleVerificationStatusChange = useCallback((value: string) => {
    setVerificationStatus(value);
    const params = new URLSearchParams(searchParams);
    if (value) params.set("verificationStatus", value);
    else params.delete("verificationStatus");
    params.set("page", "1");
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
    const params = new URLSearchParams(searchParams);
    if (value) params.set("status", value);
    else params.delete("status");
    params.set("page", "1");
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleLimitChange = useCallback((value: number) => {
    setLimit(value);
    setPage(1);
    const params = new URLSearchParams(searchParams);
    params.set("limit", String(value));
    params.set("page", "1");
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleSortChange = useCallback((column: string, dir: "asc" | "desc") => {
    setSort(column);
    setDirection(dir);
    const params = new URLSearchParams(searchParams);
    params.set("sort", column);
    params.set("direction", dir);
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleVerify = useCallback((storeId: string) => {
    setActionLoading(storeId);
    const store = stores.find((s) => s.id === storeId);
    const listingLimit = store?.listingLimit ?? null;
    adminVerifyStore(storeId, { listingLimit })
      .then(() => {
        showToast({ type: "success", title: "Store verified", message: "The store has been successfully verified." });
        loadStores();
      })
      .catch((error) => {
        showToast({ type: "error", title: "Verification failed", message: error instanceof Error ? error.message : "Failed to verify store" });
      })
      .finally(() => setActionLoading(null));
  }, [stores, showToast, loadStores]);

  const handleReject = useCallback((storeId: string) => {
    setActionLoading(storeId);
    const reason = prompt("Enter reason for rejection (10-500 characters):");
    if (!reason || reason.length < 10 || reason.length > 500) {
      showToast({ type: "error", title: "Invalid reason", message: "Reason must be between 10 and 500 characters" });
      setActionLoading(null);
      return;
    }
    adminRejectStore(storeId, { reason })
      .then(() => {
        showToast({ type: "success", title: "Store rejected", message: "The store verification has been rejected." });
        loadStores();
      })
      .catch((error) => {
        showToast({ type: "error", title: "Rejection failed", message: error instanceof Error ? error.message : "Failed to reject store" });
      })
      .finally(() => setActionLoading(null));
  }, [showToast, loadStores]);

  const handleSuspend = useCallback((storeId: string) => {
    setActionLoading(storeId);
    const reason = prompt("Enter suspension reason (10-500 characters):");
    if (!reason || reason.length < 10 || reason.length > 500) {
      showToast({ type: "error", title: "Invalid reason", message: "Reason must be between 10 and 500 characters" });
      setActionLoading(null);
      return;
    }
    adminSuspendStore(storeId, { reason })
      .then(() => {
        showToast({ type: "success", title: "Store suspended", message: "The store has been suspended." });
        loadStores();
      })
      .catch((error) => {
        showToast({ type: "error", title: "Suspension failed", message: error instanceof Error ? error.message : "Failed to suspend store" });
      })
      .finally(() => setActionLoading(null));
  }, [showToast, loadStores]);

  const handleUnsuspend = useCallback((storeId: string) => {
    if (!confirm("Are you sure you want to unsuspend this store?")) return;
    setActionLoading(storeId);
    adminUnsuspendStore(storeId)
      .then(() => {
        showToast({ type: "success", title: "Store unsuspended", message: "The store has been unsuspended." });
        loadStores();
      })
      .catch((error) => {
        showToast({ type: "error", title: "Unsuspend failed", message: error instanceof Error ? error.message : "Failed to unsuspend store" });
      })
      .finally(() => setActionLoading(null));
  }, [showToast, loadStores]);

  const handleViewStorefront = useCallback((slug: string) => {
    window.open(`/products/${slug}`, "_blank");
  }, []);

  const handleBulkAction = useCallback(async (action: "verify" | "reject" | "suspend") => {
    const selectedStores = stores.filter((s) => selectedKeys.has(s.id));
    if (selectedStores.length === 0) return;

    let reason: string | null = "";
    if (action === "reject" || action === "suspend") {
      reason = prompt(`Enter reason for ${action}ing ${selectedStores.length} store(s) (10-500 characters):`);
      if (!reason || reason.length < 10 || reason.length > 500) {
        showToast({ type: "error", title: "Invalid reason", message: "Reason must be between 10 and 500 characters" });
        return;
      }
    }

    setActionLoading("bulk");
    try {
      const promises = selectedStores.map((store) => {
        switch (action) {
          case "verify":
            return adminVerifyStore(store.id, { listingLimit: store.listingLimit });
          case "reject":
            return adminRejectStore(store.id, { reason: reason! });
          case "suspend":
            return adminSuspendStore(store.id, { reason: reason! });
        }
      });
      await Promise.all(promises);
      showToast({ type: "success", title: `Bulk ${action} complete`, message: `${selectedStores.length} store(s) ${action}d successfully.` });
      loadStores();
      setSelectedKeys(new Set());
    } catch (error) {
      showToast({ type: "error", title: `Bulk ${action} failed`, message: error instanceof Error ? error.message : `Failed to ${action} stores` });
    } finally {
      setActionLoading(null);
    }
  }, [stores, selectedKeys, showToast, loadStores]);

  const pendingCount = stores.filter((s) => s.verificationStatus === "PENDING").length;
  const verifiedCount = stores.filter((s) => s.verificationStatus === "VERIFIED").length;
  const suspendedCount = stores.filter((s) => s.status === "SUSPENDED").length;

  const chartData = useMemo(() => [
    { name: "Unverified", count: stores.filter((s) => s.verificationStatus === "UNVERIFIED").length, fill: "hsl(var(--accent))" },
    { name: "Pending", count: stores.filter((s) => s.verificationStatus === "PENDING").length, fill: "hsl(var(--warning))" },
    { name: "Verified", count: stores.filter((s) => s.verificationStatus === "VERIFIED").length, fill: "hsl(var(--success))" },
    { name: "Rejected", count: stores.filter((s) => s.verificationStatus === "REJECTED").length, fill: "hsl(var(--border))" },
  ], [stores]);

  if (!isAuthenticated || userRole !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <div className="h-12 w-12 text-primary mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Access Denied</h1>
          <p className="text-text-secondary mb-6">You don't have permission to access the admin dashboard.</p>
          <Button variant="primary" onClick={() => window.location.href = "/"}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary md:text-3xl">Admin Dashboard</h1>
          <p className="text-sm text-text-secondary">Manage stores, vendors, and platform settings</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Button variant="outline" leftIcon={<Download className="h-4 w-4" aria-hidden="true" />} disabled>Export Report</Button>
          <Button variant="primary" leftIcon={<Settings className="h-4 w-4" aria-hidden="true" />} disabled>Settings</Button>
        </div>
      </div>

      <AdminStatsCards
        total={total}
        pending={pendingCount}
        verified={verifiedCount}
        suspended={suspendedCount}
      />

      <AdminVerificationChart data={chartData} />

      <Card variant="outlined">
        <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-4">
          <CardTitle className="flex items-center gap-2">
            <div className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 016 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m-16.5 0a2.25 2.25 0 012.25-2.25H19.5A2.25 2.25 0 0121.75 3H4.5m0 0h.008v.008H4.5V3z" />
              </svg>
            </div>
            Sellers
          </CardTitle>
          {pendingCount > 0 && (
            <Badge variant="warning" size="sm">
              {pendingCount} Pending Verification
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <AdminFilters
            onSearch={handleSearch}
            onVerificationStatusChange={handleVerificationStatusChange}
            onStatusChange={handleStatusChange}
            onLimitChange={handleLimitChange}
            search={search}
            verificationStatus={verificationStatus}
            status={status}
            limit={limit}
            total={total}
          />

          {selectedKeys.size > 0 && (
            <div className="px-4 py-3 border-b border-border bg-primary/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <span className="text-sm font-medium text-primary">
                {selectedKeys.size} store(s) selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleBulkAction("verify")} disabled={actionLoading !== null}>
                  Verify
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction("reject")} disabled={actionLoading !== null}>
                  Reject
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction("suspend")} disabled={actionLoading !== null}>
                  Suspend
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedKeys(new Set())}>
                  Clear
                </Button>
              </div>
            </div>
          )}

          <AdminStoresTable
            stores={stores}
            loading={loading}
            selection={{ selectedKeys, onSelectionChange: setSelectedKeys }}
            sorting={{ column: sort, direction, onSort: handleSortChange }}
            onVerify={handleVerify}
            onReject={handleReject}
            onSuspend={handleSuspend}
            onUnsuspend={handleUnsuspend}
            onViewStorefront={handleViewStorefront}
            actionLoading={actionLoading}
          />

          <AdminPagination
            page={page}
            limit={limit}
            total={total}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            loading={loading}
          />
        </CardContent>
      </Card>

      <AdminStoreActionModals onStoresChange={loadStores} />
    </div>
  );
};