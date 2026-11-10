import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Store,
  Package,
  DollarSign,
  TrendingUp,
  Settings,
  Plus,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Shield,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Loader2,
  ExternalLink,
  BarChart2,
  X,
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, type BadgeProps, Select, Input, Textarea } from "../components/ui";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { ProductForm, type ProductFormData } from "../components/seller/ProductForm";
import {
  getVendorProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyStore,
  updateStore,
  requestVerification,
  type VendorProduct,
  type StoreSummary,
  type UpdateStoreInput,
} from "../services/api";

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { variant: BadgeProps["variant"]; label: string }> = {
    active: { variant: "success", label: "Active" },
    draft: { variant: "default", label: "Draft" },
    out_of_stock: { variant: "danger", label: "Out of Stock" },
    removed: { variant: "danger", label: "Removed" },
    pending: { variant: "warning", label: "Pending" },
    processing: { variant: "primary", label: "Processing" },
    shipped: { variant: "secondary", label: "Shipped" },
    delivered: { variant: "success", label: "Delivered" },
    cancelled: { variant: "danger", label: "Cancelled" },
  };
  const config = statusConfig[status] || { variant: "default", label: status };
  return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
};

export const SellerPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);
  const userRole = useSelector((state: RootState) => state.auth.user?.role ?? null);

  const [store, setStore] = useState<StoreSummary | null>(null);
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "removed">("all");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<VendorProduct | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [storeLoading, setStoreLoading] = useState(true);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [storeError, setStoreError] = useState<string | null>(null);
  const [showStoreSettings, setShowStoreSettings] = useState(false);
  const [settingsFormData, setSettingsFormData] = useState<Partial<UpdateStoreInput>>({});
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Load store info first
  useEffect(() => {
    let cancelled = false;

    const loadStore = async () => {
      setStoreLoading(true);
      try {
        const response = await getMyStore();
        if (!cancelled) {
          setStore(response.store);
        }
      } catch (error) {
        console.error("Failed to fetch store:", error);
        if (!cancelled) {
          setStoreError("Failed to load store information");
        }
      } finally {
        if (!cancelled) {
          setStoreLoading(false);
        }
      }
    };

    loadStore();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load products when store exists
  useEffect(() => {
    if (!store || storeLoading) return;

    let cancelled = false;

    const loadProducts = async () => {
      try {
        const response = await getVendorProducts({ page: currentPage, limit: 20, status: statusFilter });
        if (!cancelled) {
          setProducts(response.products);
          setTotalPages(response.totalPages);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [store, storeLoading, currentPage, statusFilter]);

  const handleCreateProduct = async (data: ProductFormData) => {
    setFormLoading(true);
    try {
      await createProduct(data);
      setShowForm(false);
      setEditingProduct(null);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to create product:", error);
      alert(error instanceof Error ? error.message : "Failed to create product");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateProduct = async (data: ProductFormData) => {
    if (!editingProduct) return;
    setFormLoading(true);
    try {
      await updateProduct(editingProduct.id, data);
      setShowForm(false);
      setEditingProduct(null);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to update product:", error);
      alert(error instanceof Error ? error.message : "Failed to update product");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(productId);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert(error instanceof Error ? error.message : "Failed to delete product");
    }
  };

  const openCreateForm = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const openEditForm = (product: VendorProduct) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleActionClick = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionMenuOpen(actionMenuOpen === productId ? null : productId);
  };

  useEffect(() => {
    const handleClickOutside = () => setActionMenuOpen(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleRequestVerification = async () => {
    if (!store) return;
    setVerificationLoading(true);
    try {
      await requestVerification();
      setStore({ ...store, verificationStatus: "PENDING", verificationRequestedAt: new Date().toISOString() });
    } catch (error) {
      console.error("Failed to request verification:", error);
      alert(error instanceof Error ? error.message : "Failed to request verification");
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!store) return;
    setSettingsLoading(true);
    try {
      const updatedStore = await updateStore(settingsFormData);
      setStore(updatedStore.store);
      setShowStoreSettings(false);
    } catch (error) {
      console.error("Failed to update store:", error);
      alert(error instanceof Error ? error.message : "Failed to update store");
    } finally {
      setSettingsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <Store className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Sign in to sell</h2>
          <p className="text-text-secondary mb-6">You need an account to access the seller dashboard.</p>
          <NavLink to="/login">
            <Button variant="primary">Sign In</Button>
          </NavLink>
        </div>
      </div>
    );
  }

  if (userRole !== "VENDOR" && userRole !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-10">
            <Store className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-text-primary mb-2">Sell on SajiloMart</h1>
            <p className="text-lg text-text-secondary">
              Join thousands of sellers and grow your business on our marketplace.
            </p>
          </div>

          <Card variant="outlined" className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">Why Sell With Us?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center p-4">
                  <div className="h-10 w-10 text-primary mx-auto mb-3">
                    <Shield className="h-10 w-10" aria-hidden="true" />
                  </div>
                  <h3 className="font-medium text-text-primary mb-1">Secure Platform</h3>
                  <p className="text-sm text-text-secondary">Protected payments and seller protection</p>
                </div>
                <div className="text-center p-4">
                  <div className="h-10 w-10 text-primary mx-auto mb-3">
                    <TrendingUp className="h-10 w-10" aria-hidden="true" />
                  </div>
                  <h3 className="font-medium text-text-primary mb-1">Global Reach</h3>
                  <p className="text-sm text-text-secondary">Access to millions of customers</p>
                </div>
                <div className="text-center p-4">
                  <div className="h-10 w-10 text-primary mx-auto mb-3">
                    <CheckCircle className="h-10 w-10" aria-hidden="true" />
                  </div>
                  <h3 className="font-medium text-text-primary mb-1">Easy Setup</h3>
                  <p className="text-sm text-text-secondary">Start selling in minutes with our tools</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            leftIcon={<Plus className="h-5 w-5" aria-hidden="true" />}
            onClick={() => navigate("/sell")}
          >
            Start Selling
          </Button>
        </div>
      </div>
    );
  }

  if (storeLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-text-secondary">Loading your store...</p>
        </div>
      </div>
    );
  }

  if (storeError || !store) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <AlertCircle className="h-16 w-16 text-accent mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-text-primary mb-2">Store Not Found</h1>
          <p className="text-lg text-text-secondary mb-8">
            You don't have a store yet. Create one to start selling.
          </p>
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Plus className="h-5 w-5" aria-hidden="true" />}
            onClick={() => navigate("/sell")}
          >
            Create Your Store
          </Button>
        </div>
      </div>
    );
  }

  // Store exists but status checks
  if (store.status === "SUSPENDED") {
    return (
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <AlertCircle className="h-16 w-16 text-accent mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-text-primary mb-2">Store Suspended</h1>
          <p className="text-lg text-text-secondary mb-6">
            Your store has been suspended. You cannot add products or sell until this is resolved.
          </p>
          {store.suspensionReason && (
            <Card variant="outlined" className="mb-6 text-left">
              <CardContent className="p-6">
                <p className="font-medium text-text-primary mb-2">Reason:</p>
                <p className="text-text-secondary">{store.suspensionReason}</p>
              </CardContent>
            </Card>
          )}
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">
              Contact support if you believe this is an error.
            </p>
            <Button variant="primary" onClick={() => alert("Contact support")} leftIcon={<ExternalLink className="h-4 w-4" aria-hidden="true" />}>
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Total Revenue", value: "$12,450.00", icon: DollarSign, change: "+12.5%", changeType: "positive" },
    { label: "Orders This Month", value: "234", icon: Package, change: "+8%", changeType: "positive" },
    { label: "Active Products", value: String(products.filter(p => p.status === "active").length), icon: Store, change: "+3", changeType: "positive" },
    { label: "Conversion Rate", value: "3.2%", icon: TrendingUp, change: "+0.4%", changeType: "positive" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {showForm && (
        <ProductForm
          initialData={editingProduct ?? undefined}
          onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
          onCancel={() => { setShowForm(false); setEditingProduct(null); }}
          isLoading={formLoading}
          title={editingProduct ? "Edit Product" : "Add New Product"}
        />
      )}

      {showStoreSettings && store && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface rounded-xl shadow-xl">
            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-border bg-surface rounded-t-xl">
              <h2 className="text-xl font-semibold text-text-primary">Store Settings</h2>
              <button
                type="button"
                onClick={() => setShowStoreSettings(false)}
                className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveSettings(); }} className="p-4 space-y-4">
              <Input
                label="Store Name"
                value={settingsFormData.name || store.name}
                onChange={(e) => setSettingsFormData({ ...settingsFormData, name: e.target.value })}
                required
              />
              <Select
                label="Category"
                placeholder="Select a category"
                options={[
                  { value: "electronics", label: "Electronics" },
                  { value: "fashion", label: "Fashion" },
                  { value: "home", label: "Home & Kitchen" },
                  { value: "beauty", label: "Beauty" },
                  { value: "sports", label: "Sports" },
                  { value: "books", label: "Books" },
                  { value: "toys", label: "Toys & Games" },
                  { value: "automotive", label: "Automotive" },
                ]}
                value={settingsFormData.category || store.category || ""}
                onChange={(e) => setSettingsFormData({ ...settingsFormData, category: e.target.value })}
              />
              <Textarea
                label="Description"
                value={settingsFormData.description || store.description || ""}
                onChange={(e) => setSettingsFormData({ ...settingsFormData, description: e.target.value })}
                rows={3}
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={settingsFormData.phone || store.phone || ""}
                onChange={(e) => setSettingsFormData({ ...settingsFormData, phone: e.target.value })}
              />
              <Textarea
                label="Return Policy"
                placeholder="Describe your return and refund policy..."
                rows={3}
                value={settingsFormData.returnPolicy || store.returnPolicy || ""}
                onChange={(e) => setSettingsFormData({ ...settingsFormData, returnPolicy: e.target.value })}
              />
              <Textarea
                label="Shipping Policy"
                placeholder="Describe your shipping methods, costs, and delivery times..."
                rows={3}
                value={settingsFormData.shippingPolicy || store.shippingPolicy || ""}
                onChange={(e) => setSettingsFormData({ ...settingsFormData, shippingPolicy: e.target.value })}
              />
              <Input
                label="Logo URL (Optional)"
                type="url"
                placeholder="https://example.com/logo.png"
                value={settingsFormData.logoUrl || ""}
                onChange={(e) => setSettingsFormData({ ...settingsFormData, logoUrl: e.target.value })}
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowStoreSettings(false)} disabled={settingsLoading}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={settingsLoading}>
                  {settingsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with badges */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Seller Dashboard</h1>
            <p className="text-text-secondary">Welcome back, {user?.name || "Vendor"}! Manage your store and track performance.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={
                store.status === "APPROVED" ? "success" :
                (store.status as StoreSummary["status"]) === "SUSPENDED" ? "danger" :
                "warning"
              }
              size="sm"
            >
              {store.status}
            </Badge>
            <Badge
              variant={
                store.verificationStatus === "VERIFIED" ? "success" :
                (store.verificationStatus as StoreSummary["verificationStatus"]) === "PENDING" ? "warning" :
                "danger"
              }
              size="sm"
            >
              {store.verificationStatus}
            </Badge>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} variant="outlined" hoverable>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">{stat.label}</p>
                    <p className="text-2xl font-bold text-text-primary mt-1">{stat.value}</p>
                    <p className={`text-sm mt-1 ${stat.changeType === "positive" ? "text-success" : "text-accent"}`}>
                      {stat.change} vs last month
                    </p>
                  </div>
                  <div className="p-3 bg-primary-light rounded-xl text-primary">
                    <stat.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Verification card & listing limit meter */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <Card variant="outlined">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" aria-hidden="true" /> Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-primary">Status: </p>
                  <Badge
                    variant={
                      store.verificationStatus === "VERIFIED" ? "success" :
                      store.verificationStatus === "PENDING" ? "warning" :
                      "danger"
                    }
                  >
                    {store.verificationStatus}
                  </Badge>
                </div>
                <div className="p-2 rounded-lg">
                  {store.verificationStatus === "VERIFIED" ? (
                    <div className="text-success">✓ Verified</div>
                  ) : store.verificationStatus === "PENDING" ? (
                    <div className="text-warning animate-pulse">⏳ Under Review</div>
                  ) : (
                    <div className="text-accent">✗ Rejected</div>
                  )}
                </div>
              </div>

              <p className="text-sm text-text-secondary">
                {store.verificationStatus === "VERIFIED"
                  ? "Verified stores enjoy unlimited listings and priority support."
                  : store.verificationStatus === "PENDING"
                  ? "Your verification request is under review. You'll be notified once processed."
                  : "Your verification was rejected. Address the issues and request again."}
              </p>

              {store.verificationStatus !== "VERIFIED" && (
                <Button
                  variant="primary"
                  fullWidth
                  leftIcon={<Shield className="h-4 w-4" aria-hidden="true" />}
                  onClick={handleRequestVerification}
                  isLoading={verificationLoading}
                >
                  {verificationLoading ? "Requesting..." : "Request Verification"}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart2 className="h-5 w-5" aria-hidden="true" /> Listing Limit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-3 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{
                    width: store.listingLimit
                      ? `${Math.min((store.productCount / store.listingLimit) * 100, 100)}%`
                      : "0%",
                  }}
                />
              </div>
              <p className="text-sm text-text-secondary">
                {store.listingLimit !== null
                  ? `${store.productCount} of ${store.listingLimit} products used`
                  : "Unlimited (Verified)"}
              </p>
              {store.listingLimit !== null && store.productCount >= store.listingLimit && (
                <p className="text-sm text-warning flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  Limit reached — verify to add more
                </p>
              )}
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Store className="h-5 w-5" aria-hidden="true" /> Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="primary" fullWidth leftIcon={<ExternalLink className="h-4 w-4" aria-hidden="true" />} onClick={() => setShowStoreSettings(true)}>
                Store Settings
              </Button>
              <Button variant="outline" fullWidth leftIcon={<Eye className="h-4 w-4" aria-hidden="true" />} onClick={() => window.open(`/products/${store.slug}`, "_blank")}>
                View Storefront
              </Button>
              <Button variant="primary" fullWidth leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />} onClick={openCreateForm}>
                Add Product
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Products and Orders sections */}
        <div className="grid gap-8 lg:grid-cols-2">
          <Card variant="outlined">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <NavLink to="/seller/orders" className="text-sm text-primary hover:text-primary-hover">View All</NavLink>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-8 text-center">
                <Package className="h-12 w-12 text-text-muted mx-auto mb-4" />
                <p className="text-text-secondary mb-4">Order management coming soon</p>
                <Badge variant="default" size="sm">Orders coming soon</Badge>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Products</CardTitle>
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setCurrentPage(1); }}
                  className="px-3 py-1.5 text-sm border border-border rounded-lg bg-surface text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft (0 stock)</option>
                  <option value="removed">Removed</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {products.length === 0 && !formLoading ? (
                <div className="p-8 text-center">
                  <Store className="h-12 w-12 text-text-muted mx-auto mb-4" />
                  <p className="text-text-secondary mb-4">No products found</p>
                  <Button variant="primary" leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />} onClick={openCreateForm}>
                    Add Your First Product
                  </Button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-4 font-medium text-text-secondary">Product</th>
                          <th className="text-left p-4 font-medium text-text-secondary">Price</th>
                          <th className="text-left p-4 font-medium text-text-secondary">Stock</th>
                          <th className="text-left p-4 font-medium text-text-secondary">Status</th>
                          <th className="text-right p-4 font-medium text-text-secondary">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {products.map((product) => (
                          <tr key={product.id} className="hover:bg-surface-hover">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {product.image && (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-12 h-12 object-cover rounded-lg"
                                  />
                                )}
                                <div>
                                  <div className="font-medium text-text-primary">{product.name}</div>
                                  <div className="text-sm text-text-secondary">{product.category}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 font-medium text-text-primary">${product.price.toFixed(2)}</td>
                            <td className="p-4 text-sm text-text-secondary">
                              {product.totalStock} ({product.reservedStock} reserved)
                            </td>
                            <td className="p-4">{getStatusBadge(product.status)}</td>
                            <td className="p-4 text-right">
                              <div className="relative inline-block">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => handleActionClick(product.id, e)}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                                {actionMenuOpen === product.id && (
                                  <div className="absolute right-0 top-full mt-1 z-10 w-40 bg-surface border border-border rounded-lg shadow-lg py-1">
                                    <NavLink
                                      to={`/products/${product.id}`}
                                      onClick={() => setActionMenuOpen(null)}
                                      className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-surface-hover"
                                    >
                                      <Eye className="h-4 w-4" />
                                      View Public Page
                                    </NavLink>
                                    <button
                                      onClick={() => { openEditForm(product); setActionMenuOpen(null); }}
                                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-surface-hover"
                                    >
                                      <Edit className="h-4 w-4" />
                                      Edit
                                    </button>
                                    {product.status !== "removed" && (
                                      <button
                                        onClick={() => { handleDeleteProduct(product.id); setActionMenuOpen(null); }}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-accent hover:bg-accent/5"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div className="p-4 border-t border-border flex items-center justify-between">
                      <span className="text-sm text-text-secondary">
                        Page {currentPage} of {totalPages}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1 || formLoading}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages || formLoading}
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

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <Card variant="outlined">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Store className="h-5 w-5" aria-hidden="true" /> Product Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <NavLink to="/seller/products" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors">
                <Store className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="text-text-primary">All Products</span>
                <ArrowRight className="h-4 w-4 text-text-muted ml-auto" aria-hidden="true" />
              </NavLink>
              <NavLink to="/seller/products?status=active" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors">
                <CheckCircle className="h-5 w-5 text-success" aria-hidden="true" />
                <span className="text-text-primary">Active Products</span>
                <Badge variant="success" size="sm">{products.filter(p => p.status === "active").length}</Badge>
              </NavLink>
              <Button
                variant="primary"
                fullWidth
                leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}
                onClick={openCreateForm}
              >
                Add New Product
              </Button>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" aria-hidden="true" /> Order Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-surface rounded-lg text-center">
                <p className="text-sm text-text-secondary mb-2">Order management coming soon</p>
                <Badge variant="default" size="sm">Coming soon</Badge>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" aria-hidden="true" /> Store Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="primary"
                fullWidth
                leftIcon={<Settings className="h-4 w-4" aria-hidden="true" />}
                onClick={() => setShowStoreSettings(true)}
              >
                Store Profile & Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};