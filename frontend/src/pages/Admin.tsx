import { useEffect, useCallback } from "react";
import { NavLink } from "react-router-dom";
import {
  Store,
  Shield,
  BarChart3,
  Settings,
  Eye,
  Clock,
  Download,
  Search,
  MoreVertical,
  ShieldCheck,
  ShieldAlert,
  Ban,
  UserCheck,
  XCircle,
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, type BadgeProps, Input, Select } from "../components/ui";
import { useSelector as useSelectorRedux } from "react-redux";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { RootState } from "../store";
import { adminSuspendStore, adminUnsuspendStore, adminVerifyStore, adminRejectStore, getAdminStores, type AdminStoreSummary } from "../services/api";

const getVerificationStatusBadge = (status: AdminStoreSummary["verificationStatus"]) => {
  const config: Record<AdminStoreSummary["verificationStatus"], { variant: BadgeProps["variant"]; label: string; icon: React.ReactNode }> = {
    UNVERIFIED: { variant: "danger", label: "Unverified", icon: <ShieldAlert className="h-3 w-3" aria-hidden="true" /> },
    PENDING: { variant: "warning", label: "Pending", icon: <Clock className="h-3 w-3" aria-hidden="true" /> },
    VERIFIED: { variant: "success", label: "Verified", icon: <ShieldCheck className="h-3 w-3" aria-hidden="true" /> },
    REJECTED: { variant: "default", label: "Rejected", icon: <XCircle className="h-3 w-3" aria-hidden="true" /> },
  };
  const c = config[status];
  return <Badge variant={c.variant} size="sm" className="gap-1">{c.icon}{c.label}</Badge>;
};

const getStoreStatusBadge = (status: AdminStoreSummary["status"]) => {
  const config: Record<AdminStoreSummary["status"], { variant: BadgeProps["variant"]; label: string }> = {
    PENDING: { variant: "warning", label: "Pending" },
    APPROVED: { variant: "success", label: "Approved" },
    SUSPENDED: { variant: "danger", label: "Suspended" },
  };
  const c = config[status];
  return <Badge variant={c.variant} size="sm">{c.label}</Badge>;
};

export const AdminPage = () => {
  const isAuthenticated = useSelectorRedux((state: RootState) => state.auth.isAuthenticated);
  const userRole = useSelectorRedux((state: RootState) => state.auth.user?.role ?? null);

  const [stores, setStores] = useState<AdminStoreSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [verificationFilter, setVerificationFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  // Load stores
  const loadStores = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAdminStores({
        page,
        limit,
        verificationStatus: verificationFilter || undefined,
        search: search || undefined,
      });
      setStores(result.stores);
      setTotal(result.total);
    } catch (error) {
      console.error("Failed to fetch stores:", error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, verificationFilter, search]);

  // Chart data from real store data
  const verificationChartData = [
    { name: "Unverified", count: stores.filter((s) => s.verificationStatus === "UNVERIFIED").length },
    { name: "Pending", count: stores.filter((s) => s.verificationStatus === "PENDING").length },
    { name: "Verified", count: stores.filter((s) => s.verificationStatus === "VERIFIED").length },
    { name: "Rejected", count: stores.filter((s) => s.verificationStatus === "REJECTED").length },
  ];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStores();
  }, [loadStores]);

  useEffect(() => {
    const handleClickOutside = () => setActionMenuOpen(null);
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check admin role
  if (!isAuthenticated || userRole !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">Access Denied</h1>
          <p className="text-text-secondary mb-6">You don't have permission to access the admin dashboard.</p>
          <NavLink to="/">
            <Button variant="primary">Go Home</Button>
          </NavLink>
        </div>
      </div>
    );
  }

  const handleActionClick = (storeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionMenuOpen(actionMenuOpen === storeId ? null : storeId);
  };

  const handleVerify = async (storeId: string) => {
    const limit = prompt("Enter listing limit (leave empty for unlimited):");
    if (limit === null) return; // User cancelled

    const listingLimit = limit ? parseInt(limit, 10) : null;
    if (limit && isNaN(listingLimit as number)) {
      alert("Please enter a valid number");
      return;
    }

    setActionLoading(storeId);
    try {
      await adminVerifyStore(storeId, { listingLimit });
      loadStores();
    } catch (error) {
      console.error("Failed to verify store:", error);
      alert(error instanceof Error ? error.message : "Failed to verify store");
    } finally {
      setActionLoading(null);
      setActionMenuOpen(null);
    }
  };

  const handleReject = async (storeId: string) => {
    const reason = prompt("Enter reason for rejection (10-500 characters):");
    if (!reason || reason.length < 10 || reason.length > 500) {
      alert("Reason must be between 10 and 500 characters");
      return;
    }

    setActionLoading(storeId);
    try {
      await adminRejectStore(storeId, { reason });
      loadStores();
    } catch (error) {
      console.error("Failed to reject store:", error);
      alert(error instanceof Error ? error.message : "Failed to reject store");
    } finally {
      setActionLoading(null);
      setActionMenuOpen(null);
    }
  };

  const handleSuspend = async (storeId: string) => {
    const reason = prompt("Enter suspension reason (10-500 characters):");
    if (!reason || reason.length < 10 || reason.length > 500) {
      alert("Reason must be between 10 and 500 characters");
      return;
    }

    setActionLoading(storeId);
    try {
      await adminSuspendStore(storeId, { reason });
      loadStores();
    } catch (error) {
      console.error("Failed to suspend store:", error);
      alert(error instanceof Error ? error.message : "Failed to suspend store");
    } finally {
      setActionLoading(null);
      setActionMenuOpen(null);
    }
  };

  const handleUnsuspend = async (storeId: string) => {
    if (!confirm("Are you sure you want to unsuspend this store?")) return;

    setActionLoading(storeId);
    try {
      await adminUnsuspendStore(storeId);
      loadStores();
    } catch (error) {
      console.error("Failed to unsuspend store:", error);
      alert(error instanceof Error ? error.message : "Failed to unsuspend store");
    } finally {
      setActionLoading(null);
      setActionMenuOpen(null);
    }
  };

  const storeRows = stores.length === 0 ? (
    <tr>
      <td colSpan={7} className="p-8 text-center text-text-secondary">No stores found</td>
    </tr>
  ) : (
    stores.map((store: AdminStoreSummary) => (
      <tr key={store.id} className="hover:bg-surface-hover">
        <td className="p-4">
          <div className="font-medium text-text-primary truncate max-w-[160px]">{store.name}</div>
          <div className="text-sm text-text-secondary truncate max-w-[160px]">{store.slug}</div>
        </td>
        <td className="p-4">
          <div className="font-medium text-text-primary truncate max-w-[140px]">{store.owner.name}</div>
          <div className="text-sm text-text-secondary truncate max-w-[140px]">{store.owner.username}</div>
          <div className="text-sm text-text-secondary truncate max-w-[140px]">{store.owner.email}</div>
        </td>
        <td className="p-4 text-sm text-text-secondary truncate max-w-[120px]">{store.category ?? "N/A"}</td>
        <td className="p-4 text-sm text-text-secondary">{store.productCount}</td>
        <td className="p-4">{getStoreStatusBadge(store.status)}</td>
        <td className="p-4">{getVerificationStatusBadge(store.verificationStatus)}</td>
        <td className="p-4">
          <div className="relative inline-block">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => handleActionClick(store.id, e)}
              disabled={actionLoading === store.id}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            {actionMenuOpen === store.id && (
              <div className="absolute right-0 top-full mt-1 z-10 w-56 bg-surface border border-border rounded-lg shadow-lg py-1">
                {store.verificationStatus === "UNVERIFIED" || store.verificationStatus === "PENDING" || store.verificationStatus === "REJECTED" ? (
                  <>
                    <button
                      onClick={() => { handleVerify(store.id); setActionMenuOpen(null); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-success hover:bg-success/5"
                      disabled={actionLoading === store.id}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Verify
                    </button>
                    <button
                      onClick={() => { handleReject(store.id); setActionMenuOpen(null); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-accent hover:bg-accent/5"
                      disabled={actionLoading === store.id}
                    >
                      <XCircle className="h-4 w-4" />
                      Reject Verification
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { handleSuspend(store.id); setActionMenuOpen(null); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-accent hover:bg-accent/5"
                      disabled={actionLoading === store.id}
                    >
                      <Ban className="h-4 w-4" />
                      Suspend
                    </button>
                    {store.status === "SUSPENDED" && (
                      <button
                        onClick={() => { handleUnsuspend(store.id); setActionMenuOpen(null); }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-success hover:bg-success/5"
                        disabled={actionLoading === store.id}
                      >
                        <UserCheck className="h-4 w-4" />
                        Unsuspend
                      </button>
                    )}
                  </>
                )}
                <NavLink
                  to={`/products/${store.slug}`}
                  onClick={() => setActionMenuOpen(null)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-surface-hover"
                >
                  <Eye className="h-4 w-4" />
                  View Storefront
                </NavLink>
              </div>
            )}
          </div>
        </td>
      </tr>
    ))
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary md:text-3xl">Admin Dashboard</h1>
          <p className="text-sm text-text-secondary">Manage stores, vendors, and platform settings</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Button variant="outline" leftIcon={<Download className="h-4 w-4" aria-hidden="true" />}>Export Report</Button>
          <Button variant="primary" leftIcon={<Settings className="h-4 w-4" aria-hidden="true" />}>Settings</Button>
        </div>
      </div>

      {/* Stat cards grid */}
      <div className="grid gap-4 sm:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-4 sm:mb-6">
        <Card variant="outlined">
          <CardContent className="p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Total Stores</p>
                <p className="text-2xl font-bold text-text-primary mt-1 md:mt-2 md:text-3xl">{total}</p>
              </div>
              <div className="p-2.5 sm:p-3 bg-primary-light rounded-lg text-primary">
                <Store className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent className="p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Pending Verification</p>
                <p className="text-2xl font-bold text-warning mt-1 md:mt-2 md:text-3xl">
                  {stores.filter((s) => s.verificationStatus === "PENDING").length}
                </p>
              </div>
              <div className="p-2.5 sm:p-3 bg-warning/10 rounded-lg text-warning">
                <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent className="p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Verified Stores</p>
                <p className="text-2xl font-bold text-success mt-1 md:mt-2 md:text-3xl">
                  {stores.filter((s) => s.verificationStatus === "VERIFIED").length}
                </p>
              </div>
              <div className="p-2.5 sm:p-3 bg-success/10 rounded-lg text-success">
                <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent className="p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Suspended Stores</p>
                <p className="text-2xl font-bold text-danger mt-1 md:mt-2 md:text-3xl">
                  {stores.filter((s) => s.status === "SUSPENDED").length}
                </p>
              </div>
              <div className="p-2.5 sm:p-3 bg-danger/10 rounded-lg text-danger">
                <Ban className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification chart */}
      <Card variant="outlined" className="mb-4 sm:mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-4">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            Stores by Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={verificationChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#58A6FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Stores table */}
      <Card variant="outlined">
        <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-4">
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            Sellers
          </CardTitle>
          <Badge variant="warning" size="sm">
            {stores.filter((s: AdminStoreSummary) => s.verificationStatus === "PENDING").length} Pending Verification
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          {/* Filter bar */}
          <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Input
                placeholder="Search stores by name, owner..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" aria-hidden="true" />}
                className="w-full sm:w-80 md:w-96"
              />
              <Select
                value={verificationFilter}
                onChange={(e) => { setVerificationFilter(e.target.value); setPage(1); }}
                options={[
                  { value: "", label: "All Verification" },
                  { value: "UNVERIFIED", label: "Unverified" },
                  { value: "PENDING", label: "Pending" },
                  { value: "VERIFIED", label: "Verified" },
                  { value: "REJECTED", label: "Rejected" },
                ]}
                className="w-full sm:w-64 md:w-80"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={String(limit)}
                onChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(1); }}
                options={[
                  { value: "10", label: "10 per page" },
                  { value: "20", label: "20 per page" },
                  { value: "50", label: "50 per page" },
                  { value: "100", label: "100 per page" },
                ]}
                className="w-36 sm:w-48"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-5 py-4 font-medium text-text-secondary">Store</th>
                      <th className="text-left px-5 py-4 font-medium text-text-secondary">Owner</th>
                      <th className="text-left px-5 py-4 font-medium text-text-secondary">Category</th>
                      <th className="text-center px-5 py-4 font-medium text-text-secondary">Products</th>
                      <th className="text-center px-5 py-4 font-medium text-text-secondary">Status</th>
                      <th className="text-center px-5 py-4 font-medium text-text-secondary">Verification</th>
                      <th className="text-center px-5 py-4 font-medium text-text-secondary">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {storeRows}
                  </tbody>
                </table>
              </div>

              {total > limit && (
                <div className="p-4 sm:p-5 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <span className="text-sm text-text-secondary">
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} stores
                  </span>
                  <div className="flex gap-2 sm:gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                      disabled={page === 1 || loading}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p: number) => Math.min(Math.ceil(total / limit), p + 1))}
                      disabled={page === Math.ceil(total / limit) || loading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};