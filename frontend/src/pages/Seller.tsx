import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Store,
  Package,
  DollarSign,
  TrendingUp,
  Settings,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Shield,
  RotateCcw,
  Truck,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, type BadgeProps } from "../components/ui";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { setIsVendor, setApprovalStatus } from "../store/slices/sellerSlice";
import { ProductForm, type ProductFormData } from "../components/seller/ProductForm";
import {
  getVendorProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type VendorProduct,
} from "../services/api";

interface SellerOrder {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: number;
}

const mockSellerOrders: SellerOrder[] = [
  { id: "ORD-001", customer: "John Doe", date: "2024-01-15", total: 299.99, status: "delivered", items: 1 },
  { id: "ORD-002", customer: "Jane Smith", date: "2024-01-14", total: 449.98, status: "shipped", items: 2 },
  { id: "ORD-003", customer: "Bob Wilson", date: "2024-01-13", total: 59.98, status: "processing", items: 2 },
  { id: "ORD-004", customer: "Alice Brown", date: "2024-01-12", total: 24.99, status: "pending", items: 1 },
  { id: "ORD-005", customer: "Charlie Davis", date: "2024-01-11", total: 399.99, status: "delivered", items: 1 },
];

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
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);
  const userRole = useSelector((state: RootState) => state.auth.user?.role ?? null);
  const isVendor = useSelector((state: RootState) => state.seller.isVendor);
  const approvalStatus = useSelector((state: RootState) => state.seller.approvalStatus);

  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "removed">("all");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<VendorProduct | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  useEffect(() => {
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
  }, [currentPage, statusFilter]);

  const handleCreateProduct = async (data: ProductFormData) => {
    setFormLoading(true);
    try {
      await createProduct(data);
      setShowForm(false);
      setEditingProduct(null);
      // Trigger refetch by updating currentPage to 1
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

  if (!isVendor && userRole !== "VENDOR") {
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
            onClick={() => navigate("/seller/onboarding")}
          >
            Start Selling
          </Button>
        </div>
      </div>
    );
  }

  if (approvalStatus === "pending") {
    return (
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Clock className="h-16 w-16 text-warning mx-auto mb-4 animate-pulse" />
          <h1 className="text-3xl font-bold text-text-primary mb-2">Application Under Review</h1>
          <p className="text-lg text-text-secondary mb-8">
            Your store application is being reviewed. We'll notify you once approved.
          </p>
          <div className="space-y-4 text-left max-w-md mx-auto">
            <div className="flex items-center gap-3 p-4 bg-surface rounded-lg border border-border">
              <Clock className="h-6 w-6 text-warning flex-shrink-0" />
              <div>
                <p className="font-medium text-text-primary">Under Review</p>
                <p className="text-sm text-text-secondary">Our team is reviewing your application</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-surface rounded-lg border border-border opacity-50">
              <Shield className="h-6 w-6 text-text-muted flex-shrink-0" />
              <div>
                <p className="font-medium text-text-secondary">Approval</p>
                <p className="text-sm text-text-muted">You'll receive an email notification</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-surface rounded-lg border border-border opacity-50">
              <Store className="h-6 w-6 text-text-muted flex-shrink-0" />
              <div>
                <p className="font-medium text-text-secondary">Go Live</p>
                <p className="text-sm text-text-muted">Start selling once approved</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (approvalStatus === "rejected") {
    return (
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <AlertCircle className="h-16 w-16 text-accent mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-text-primary mb-2">Application Not Approved</h1>
          <p className="text-lg text-text-secondary mb-8">
            Unfortunately, your application was not approved at this time. Please review our guidelines and try again.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { dispatch(setIsVendor(false)); dispatch(setApprovalStatus(null)); }}>
              Try Again
            </Button>
            <Button variant="primary" onClick={() => alert("Contact support")}>
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

      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Seller Dashboard</h1>
            <p className="text-text-secondary">Welcome back, {user?.name || "Vendor"}! Manage your store and track performance.</p>
          </div>
          <Button variant="primary" leftIcon={<Plus className="h-5 w-5" aria-hidden="true" />} onClick={openCreateForm}>
            Add Product
          </Button>
        </div>

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

        <div className="grid gap-8 lg:grid-cols-2">
          <Card variant="outlined">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <NavLink to="/seller/orders" className="text-sm text-primary hover:text-primary-hover">View All</NavLink>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-text-secondary">Order ID</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Customer</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Date</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Total</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mockSellerOrders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-surface-hover">
                        <td className="p-4 font-mono text-sm text-text-primary">{order.id}</td>
                        <td className="p-4 text-sm text-text-secondary">{order.customer}</td>
                        <td className="p-4 text-sm text-text-secondary">{order.date}</td>
                        <td className="p-4 font-medium text-text-primary">${order.total.toFixed(2)}</td>
                        <td className="p-4">{getStatusBadge(order.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
              <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" aria-hidden="true" /> Order Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <NavLink to="/seller/orders" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors">
                <Package className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="text-text-primary">All Orders</span>
                <ArrowRight className="h-4 w-4 text-text-muted ml-auto" aria-hidden="true" />
              </NavLink>
              <NavLink to="/seller/orders?status=pending" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors">
                <Clock className="h-5 w-5 text-warning" aria-hidden="true" />
                <span className="text-text-primary">Pending Orders</span>
                <Badge variant="warning" size="sm">5</Badge>
              </NavLink>
              <NavLink to="/seller/returns" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors">
                <RotateCcw className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="text-text-primary">Returns & Refunds</span>
                <Badge variant="default" size="sm">2</Badge>
              </NavLink>
            </CardContent>
          </Card>

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
              <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" aria-hidden="true" /> Store Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <NavLink to="/seller/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors">
                <Settings className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="text-text-primary">Store Profile</span>
                <ArrowRight className="h-4 w-4 text-text-muted ml-auto" aria-hidden="true" />
              </NavLink>
              <NavLink to="/seller/settings/payments" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors">
                <DollarSign className="h-5 w-5 text-success" aria-hidden="true" />
                <span className="text-text-primary">Payment Settings</span>
                <ArrowRight className="h-4 w-4 text-text-muted ml-auto" aria-hidden="true" />
              </NavLink>
              <NavLink to="/seller/settings/shipping" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors">
                <Truck className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="text-text-primary">Shipping Options</span>
                <ArrowRight className="h-4 w-4 text-text-muted ml-auto" aria-hidden="true" />
              </NavLink>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};