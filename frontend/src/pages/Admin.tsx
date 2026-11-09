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
  CheckCircle,
  XCircle,
  Clock,
  Download,
  ArrowRight,
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, type BadgeProps } from "../components/ui";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "VENDOR" | "ADMIN";
  status: "active" | "suspended" | "pending";
  joined: string;
  orders: number;
}

interface VendorApplication {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  category: string;
  submitted: string;
  status: "pending" | "approved" | "rejected";
}

interface AdminProduct {
  id: string;
  name: string;
  vendor: string;
  category: string;
  price: number;
  status: "active" | "pending_review" | "flagged" | "removed";
  reports: number;
}

const mockUsers: AdminUser[] = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "CUSTOMER", status: "active", joined: "2024-01-15", orders: 12 },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "CUSTOMER", status: "active", joined: "2024-01-10", orders: 8 },
  { id: "3", name: "Bob Wilson", email: "bob@example.com", role: "VENDOR", status: "active", joined: "2023-12-20", orders: 0 },
  { id: "4", name: "Alice Brown", email: "alice@example.com", role: "CUSTOMER", status: "suspended", joined: "2024-01-05", orders: 3 },
  { id: "5", name: "Charlie Davis", email: "charlie@example.com", role: "VENDOR", status: "pending", joined: "2024-01-18", orders: 0 },
];

const mockVendorApplications: VendorApplication[] = [
  { id: "VA-001", businessName: "TechGadgets Pro", ownerName: "Mike Johnson", email: "mike@techgadgets.com", category: "Electronics", submitted: "2024-01-18", status: "pending" },
  { id: "VA-002", businessName: "Fashion Forward", ownerName: "Sarah Williams", email: "sarah@fashionforward.com", category: "Fashion", submitted: "2024-01-17", status: "pending" },
  { id: "VA-003", businessName: "Home Essentials Co", ownerName: "David Lee", email: "david@homeessentials.com", category: "Home & Kitchen", submitted: "2024-01-16", status: "approved" },
  { id: "VA-004", businessName: "Beauty Bliss", ownerName: "Emma Wilson", email: "emma@beautybliss.com", category: "Beauty", submitted: "2024-01-15", status: "rejected" },
];

const mockAdminProducts: AdminProduct[] = [
  { id: "1", name: "Wireless Headphones", vendor: "TechGadgets Pro", category: "Electronics", price: 299.99, status: "active", reports: 0 },
  { id: "2", name: "Smart Watch", vendor: "TechGadgets Pro", category: "Electronics", price: 399.99, status: "active", reports: 2 },
  { id: "3", name: "Designer Dress", vendor: "Fashion Forward", category: "Fashion", price: 89.99, status: "pending_review", reports: 0 },
  { id: "4", name: "Counterfeit Item", vendor: "Unknown Vendor", category: "Electronics", price: 19.99, status: "flagged", reports: 15 },
  { id: "5", name: "Removed Product", vendor: "Previous Vendor", category: "Home", price: 49.99, status: "removed", reports: 8 },
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

const getApplicationStatusBadge = (status: VendorApplication["status"]) => {
  const config: Record<VendorApplication["status"], { variant: BadgeProps["variant"]; label: string; icon: React.ReactNode }> = {
    pending: { variant: "warning", label: "Pending", icon: <Clock className="h-3 w-3" aria-hidden="true" /> },
    approved: { variant: "success", label: "Approved", icon: <CheckCircle className="h-3 w-3" aria-hidden="true" /> },
    rejected: { variant: "danger", label: "Rejected", icon: <XCircle className="h-3 w-3" aria-hidden="true" /> },
  };
  const c = config[status];
  return <Badge variant={c.variant} size="sm" className="gap-1">{c.icon}{c.label}</Badge>;
};

const getProductStatusBadge = (status: AdminProduct["status"]) => {
  const config: Record<AdminProduct["status"], { variant: BadgeProps["variant"]; label: string }> = {
    active: { variant: "success", label: "Active" },
    pending_review: { variant: "warning", label: "Pending Review" },
    flagged: { variant: "danger", label: "Flagged" },
    removed: { variant: "default", label: "Removed" },
  };
  const c = config[status];
  return <Badge variant={c.variant} size="sm">{c.label}</Badge>;
};

export const AdminPage = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userRole = useSelector((state: RootState) => state.auth.user?.role ?? null);

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

  const pendingApplications = mockVendorApplications.filter((a) => a.status === "pending").length;
  const flaggedProducts = mockAdminProducts.filter((p) => p.status === "flagged").length;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Admin Dashboard</h1>
            <p className="text-text-secondary">Manage users, vendors, products, and platform settings</p>
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
              <CardTitle className="flex items-center gap-2"><Store className="h-5 w-5" aria-hidden="true" /> Vendor Applications</CardTitle>
              <Badge variant={pendingApplications > 0 ? "warning" : "success"} size="sm">{pendingApplications} Pending</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-text-secondary">Business</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Owner</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Category</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Submitted</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Status</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mockVendorApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-surface-hover">
                        <td className="p-4">
                          <div className="font-medium text-text-primary">{app.businessName}</div>
                          <div className="text-sm text-text-secondary">{app.email}</div>
                        </td>
                        <td className="p-4 text-sm text-text-secondary">{app.ownerName}</td>
                        <td className="p-4 text-sm text-text-secondary">{app.category}</td>
                        <td className="p-4 text-sm text-text-secondary">{app.submitted}</td>
                        <td className="p-4">{getApplicationStatusBadge(app.status)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {app.status === "pending" && (
                              <>
                                <Button variant="ghost" size="sm" leftIcon={<CheckCircle className="h-4 w-4" aria-hidden="true" />} className="h-8 w-8 p-0 text-success hover:bg-success/10" aria-label="Approve" />
                                <Button variant="ghost" size="sm" leftIcon={<XCircle className="h-4 w-4" aria-hidden="true" />} className="h-8 w-8 p-0 text-accent hover:bg-accent/10" aria-label="Reject" />
                              </>
                            )}
                            <Button variant="ghost" size="sm" leftIcon={<Eye className="h-4 w-4" aria-hidden="true" />} className="h-8 w-8 p-0" aria-label="View details" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 mb-8">
          <Card variant="outlined">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" aria-hidden="true" /> Product Moderation</CardTitle>
              <Badge variant={flaggedProducts > 0 ? "danger" : "success"} size="sm">{flaggedProducts} Flagged</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-text-secondary">Product</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Vendor</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Category</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Price</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Status</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Reports</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mockAdminProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-surface-hover">
                        <td className="p-4">
                          <div className="font-medium text-text-primary">{product.name}</div>
                        </td>
                        <td className="p-4 text-sm text-text-secondary">{product.vendor}</td>
                        <td className="p-4 text-sm text-text-secondary">{product.category}</td>
                        <td className="p-4 font-medium text-text-primary">${product.price.toFixed(2)}</td>
                        <td className="p-4">{getProductStatusBadge(product.status)}</td>
                        <td className="p-4">
                          {product.reports > 0 ? (
                            <Badge variant="danger" size="sm" dot>{product.reports}</Badge>
                          ) : (
                            <span className="text-text-muted">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" leftIcon={<Eye className="h-4 w-4" aria-hidden="true" />} className="h-8 w-8 p-0" aria-label="View product" />
                            {product.status === "flagged" && (
                              <>
                                <Button variant="ghost" size="sm" leftIcon={<CheckCircle className="h-4 w-4" aria-hidden="true" />} className="h-8 w-8 p-0 text-success hover:bg-success/10" aria-label="Approve" />
                                <Button variant="ghost" size="sm" leftIcon={<XCircle className="h-4 w-4" aria-hidden="true" />} className="h-8 w-8 p-0 text-accent hover:bg-accent/10" aria-label="Remove" />
                              </>
                            )}
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
              <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" aria-hidden="true" /> Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <NavLink to="/admin/users" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors">
                <Users className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="text-text-primary">Manage All Users</span>
                <ArrowRight className="h-4 w-4 text-text-muted ml-auto" aria-hidden="true" />
              </NavLink>
              <NavLink to="/admin/vendors" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors">
                <Store className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="text-text-primary">Vendor Management</span>
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