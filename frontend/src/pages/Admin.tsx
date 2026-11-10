import { useEffect, useCallback } from "react";
import { NavLink } from "react-router-dom";
import {
  Users,
  Store,
  Package,
  DollarSign,
  TrendingUp,
  Shield,
  BarChart3,
  Settings,
  Eye,
  Edit,
  Flag,
  XCircle,
  Clock,
  Download,
  ArrowRight,
  Search,
  MoreVertical,
  ShieldCheck,
  ShieldAlert,
  Ban,
  UserCheck,
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, type BadgeProps, Input, Select } from "../components/ui";
import { useSelector as useSelectorRedux } from "react-redux";
import { useState } from "react";
import type { RootState } from "../store";
import { adminSuspendStore, adminUnsuspendStore, adminVerifyStore, adminRejectStore, getAdminStores, type AdminStoreSummary } from "../services/api";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "VENDOR" | "ADMIN";
  status: "active" | "suspended" | "pending";
  joined: string;
  orders: number;
}

const mockUsers: AdminUser[] = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "CUSTOMER", status: "active", joined: "2024-01-15", orders: 12 },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "CUSTOMER", status: "active", joined: "2024-01-10", orders: 8 },
  { id: "3", name: "Bob Wilson", email: "bob@example.com", role: "VENDOR", status: "active", joined: "2023-12-20", orders: 0 },
  { id: "4", name: "Alice Brown", email: "alice@example.com", role: "CUSTOMER", status: "suspended", joined: "2024-01-05", orders: 3 },
  { id: "5", name: "Charlie Davis", email: "charlie@example.com", role: "VENDOR", status: "pending", joined: "2024-01-18", orders: 0 },
];

const getUserRoleBadge = (role: AdminUser["role"]) => {
  const config: Record<AdminUser["role"], { variant: BadgeProps["variant"]; label: string }> = {
    CUSTOMER: { variant: "default", label: "Customer" },
    VENDOR: { variant: "primary", label: "Vendor" },
    ADMIN: { variant: "secondary", label: "Admin" },
  };
  const c = config[role];
  return <Badge variant={c.variant} size="sm">{c.label}</Badge>;
};

const getUserStatusBadge = (status: AdminUser["status"]) => {
  const config: Record<AdminUser["status"], { variant: BadgeProps["variant"]; label: string }> = {
    active: { variant: "success", label: "Active" },
    suspended: { variant: "danger", label: "Suspended" },
    pending: { variant: "warning", label: "Pending" },
  };
  const c = config[status];
  return <Badge variant={c.variant} size="sm">{c.label}</Badge>;
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

export const AdminPage = () => {
  const isAuthenticated = useSelectorRedux((state: RootState) => state.auth.isAuthenticated);
  const userRole = useSelectorRedux((state: RootState) => state.auth.user?.role ?? null);

  const [stores, setStores] = useState<AdminStoreSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>("");
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
        status: statusFilter || undefined,
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
  }, [page, limit, statusFilter, verificationFilter, search]);

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

  const stats = [
    { label: "Total Users", value: "12,450", change: "+12.5%", icon: Users },
    { label: "Active Vendors", value: "342", change: "+8%", icon: Store },
    { label: "Total Orders", value: "8,934", change: "+15%", icon: Package },
    { label: "Revenue (Month)", value: "$245,670", change: "+22%", icon: DollarSign },
  ];

  const storeRows = stores.length === 0 ? (
    <tr>
      <td colSpan={9} className="p-8 text-center text-text-secondary">No stores found</td>
    </tr>
  ) : (
    stores.map((store: AdminStoreSummary) => (
      <tr key={store.id} className="hover:bg-surface-hover">
        <td className="p-4">
          <div className="font-medium text-text-primary">{store.name}</div>
          <div className="text-sm text-text-secondary">{store.slug}</div>
        </td>
        <td className="p-4">
          <div className="font-medium text-text-primary">{store.owner.name}</div>
          <div className="text-sm text-text-secondary">@{store.owner.username} • {store.owner.email}</div>
        </td>
        <td className="p-4 text-sm text-text-secondary">{store.category ?? "N/A"}</td>
        <td className="p-4 text-sm text-text-secondary">{store.productCount}</td>
        <td className="p-4">{getStoreStatusBadge(store.status)}</td>
        <td className="p-4">{getVerificationStatusBadge(store.verificationStatus)}</td>
        <td className="p-4 text-sm text-text-secondary">
          {store.listingLimit !== null ? store.listingLimit : "Unlimited"}
        </td>
        <td className="p-4 text-sm text-text-secondary">
          {new Date(store.createdAt).toLocaleDateString()}
        </td>
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
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Admin Dashboard</h1>
            <p className="text-text-secondary">Manage users, sellers, products, and platform settings</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" aria-hidden="true" />}>Export Report</Button>
            <Button variant="primary" leftIcon={<Settings className="h-4 w-4" aria-hidden="true" />}>Settings</Button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} variant="outlined" hoverable>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">{stat.label}</p>
                    <p className="text-2xl font-bold text-text-primary mt-1">{stat.value}</p>
                    <p className="text-sm text-success mt-1">{stat.change} vs last month</p>
                  </div>
                  <div className="p-3 bg-primary-light rounded-xl text-primary">
                    <stat.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-2 mb-8">
          <Card variant="outlined">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" aria-hidden="true" /> User Management</CardTitle>
              <NavLink to="/admin/users" className="text-sm text-primary hover:text-primary-hover">View All</NavLink>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-text-secondary">User</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Role</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Status</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Joined</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Orders</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mockUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-surface-hover">
                        <td className="p-4">
                          <div className="font-medium text-text-primary">{user.name}</div>
                          <div className="text-sm text-text-secondary">{user.email}</div>
                        </td>
                        <td className="p-4">{getUserRoleBadge(user.role)}</td>
                        <td className="p-4">{getUserStatusBadge(user.status)}</td>
                        <td className="p-4 text-sm text-text-secondary">{user.joined}</td>
                        <td className="p-4 text-sm text-text-secondary">{user.orders}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" leftIcon={<Eye className="h-4 w-4" aria-hidden="true" />} className="h-8 w-8 p-0" aria-label="View user" />
                            <Button variant="ghost" size="sm" leftIcon={<Edit className="h-4 w-4" aria-hidden="true" />} className="h-8 w-8 p-0" aria-label="Edit user" />
                            <Button variant="ghost" size="sm" leftIcon={<Flag className="h-4 w-4" aria-hidden="true" />} className="h-8 w-8 p-0 text-accent hover:bg-accent/10" aria-label="Flag user" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Store className="h-5 w-5" aria-hidden="true" /> Sellers</CardTitle>
              <Badge variant="warning" size="sm">{stores.filter((s: AdminStoreSummary) => s.verificationStatus === "PENDING").length} Pending Verification</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Search by name, email, username..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    leftIcon={<Search className="h-4 w-4" aria-hidden="true" />}
                    className="w-full sm:w-64"
                  />
                  <Select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    options={[
                      { value: "", label: "All Status" },
                      { value: "APPROVED", label: "Approved" },
                      { value: "SUSPENDED", label: "Suspended" },
                      { value: "PENDING", label: "Pending" },
                    ]}
                    className="w-full sm:w-40"
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
                    className="w-full sm:w-48"
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
                    className="w-36"
                  />
                </div>
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-4 font-medium text-text-secondary">Store</th>
                          <th className="text-left p-4 font-medium text-text-secondary">Owner</th>
                          <th className="text-left p-4 font-medium text-text-secondary">Category</th>
                          <th className="text-left p-4 font-medium text-text-secondary">Products</th>
                          <th className="text-left p-4 font-medium text-text-secondary">Status</th>
                          <th className="text-left p-4 font-medium text-text-secondary">Verification</th>
                          <th className="text-left p-4 font-medium text-text-secondary">Listing Limit</th>
                          <th className="text-left p-4 font-medium text-text-secondary">Created</th>
                          <th className="text-left p-4 font-medium text-text-secondary">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {storeRows}
                      </tbody>
                    </table>
                  </div>

                  {total > limit && (
                    <div className="p-4 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <span className="text-sm text-text-secondary">
                        Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} stores
                      </span>
                      <div className="flex gap-2">
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

        <div className="grid gap-8 lg:grid-cols-2 mb-8">
          <Card variant="outlined">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" aria-hidden="true" /> Product Moderation</CardTitle>
              <Badge variant="danger" size="sm">0 Flagged</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-8 text-center">
                <Shield className="h-12 w-12 text-text-muted mx-auto mb-4" />
                <p className="text-text-secondary mb-4">Product moderation coming soon</p>
                <Badge variant="default" size="sm">Coming soon</Badge>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" aria-hidden="true" /> Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <NavLink to="/admin/users" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors">
                <Users className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="text-text-primary">Manage All Users</span>
                <ArrowRight className="h-4 w-4 text-text-muted ml-auto" aria-hidden="true" />
              </NavLink>
              <NavLink to="/admin/sellers" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors">
                <Store className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="text-text-primary">Seller Management</span>
                <ArrowRight className="h-4 w-4 text-text-muted ml-auto" aria-hidden="true" />
              </NavLink>
              <NavLink to="/admin/products" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors">
                <Package className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="text-text-primary">Product Moderation</span>
                <ArrowRight className="h-4 w-4 text-text-muted ml-auto" aria-hidden="true" />
              </NavLink>
              <NavLink to="/admin/orders" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors">
                <Package className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="text-text-primary">Order Oversight</span>
                <ArrowRight className="h-4 w-4 text-text-muted ml-auto" aria-hidden="true" />
              </NavLink>
              <NavLink to="/admin/analytics" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors">
                <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="text-text-primary">Analytics & Reports</span>
                <ArrowRight className="h-4 w-4 text-text-muted ml-auto" aria-hidden="true" />
              </NavLink>
              <NavLink to="/admin/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors">
                <Settings className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="text-text-primary">Platform Settings</span>
                <ArrowRight className="h-4 w-4 text-text-muted ml-auto" aria-hidden="true" />
              </NavLink>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};