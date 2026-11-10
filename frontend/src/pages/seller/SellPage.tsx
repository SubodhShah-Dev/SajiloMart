import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Store, AlertCircle, CheckCircle, Clock, Shield, Loader2, ExternalLink, Eye } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea, Select, Badge } from "../../components/ui";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { setCredentials } from "../../store/slices/authSlice";
import {
  getMyStore,
  createStore,
  requestVerification,
  type CreateStoreInput,
  type StoreSummary,
} from "../../services/api";
import { getCurrentUser, refreshSession } from "../../services/api";

const storeCategories = [
  { value: "electronics", label: "Electronics" },
  { value: "fashion", label: "Fashion" },
  { value: "home", label: "Home & Kitchen" },
  { value: "beauty", label: "Beauty" },
  { value: "sports", label: "Sports" },
  { value: "books", label: "Books" },
  { value: "toys", label: "Toys & Games" },
  { value: "automotive", label: "Automotive" },
] as const;

type SellView = "pitch" | "create" | "dashboard" | "suspended" | "verification";

interface StoreFormData {
  name: string;
  description: string;
  category: string;
  phone: string;
  returnPolicy: string;
  shippingPolicy: string;
  logoUrl: string;
}

const initialFormData: StoreFormData = {
  name: "",
  description: "",
  category: "",
  phone: "",
  returnPolicy: "",
  shippingPolicy: "",
  logoUrl: "",
};

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
        <p className="text-text-secondary">Loading your store...</p>
      </div>
    </div>
  );
}

function PitchPage() {
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
                <Shield className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-medium text-text-primary mb-1">Secure Platform</h3>
                <p className="text-sm text-text-secondary">Protected payments and seller protection</p>
              </div>
              <div className="text-center p-4">
                <ExternalLink className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-medium text-text-primary mb-1">Global Reach</h3>
                <p className="text-sm text-text-secondary">Access to millions of customers</p>
              </div>
              <div className="text-center p-4">
                <CheckCircle className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-medium text-text-primary mb-1">Easy Setup</h3>
                <p className="text-sm text-text-secondary">Start selling in minutes with our tools</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <NavLink to="/login" state={{ from: "/sell" }}>
            <Button variant="primary" size="lg" leftIcon={<Store className="h-5 w-5" aria-hidden="true" />}>
              Sign In to Start Selling
            </Button>
          </NavLink>
          <p className="mt-4 text-sm text-text-secondary">
            Don't have an account?{" "}
            <NavLink to="/register" state={{ from: "/sell" }} className="text-primary hover:underline">
              Create one
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
}

function CreateStoreForm({
  formData,
  setFormData,
  logoPreview,
  setLogoPreview,
  error,
  formLoading,
  onSubmit,
  onCancel,
}: {
  formData: StoreFormData;
  setFormData: React.Dispatch<React.SetStateAction<StoreFormData>>;
  logoPreview: string | null;
  setLogoPreview: React.Dispatch<React.SetStateAction<string | null>>;
  error: string | null;
  formLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <Store className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-text-primary mb-2">Create Your Store</h1>
          <p className="text-lg text-text-secondary">
            Set up your store in one step. No approval wait required.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 p-4 rounded-lg border border-accent/30 bg-accent/5 text-sm text-accent"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Store Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                label="Store Name"
                placeholder="My Awesome Store"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                error={!formData.name ? "Store name is required" : undefined}
              />

              <Textarea
                label="Store Description"
                placeholder="Describe your store, what you sell, and what makes it unique..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                error={!formData.description ? "Description is required" : undefined}
              />

              <Select
                label="Store Category"
                placeholder="Select a category"
                options={storeCategories.map((c) => ({ value: c.value, label: c.label }))}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                error={!formData.category ? "Category is required" : undefined}
              />

              {/* Logo Upload */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-text-primary">Store Logo (Optional)</label>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    logoPreview ? "border-transparent" : "border-border hover:border-primary"
                  }`}
                  onDragOver={(e) => e.preventDefault()}
                  onDragLeave={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024) {
                      const reader = new FileReader();
                      reader.onload = (event) => setLogoPreview(event.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (!file.type.startsWith("image/")) {
                          alert("Please select an image file");
                          return;
                        }
                        if (file.size > 5 * 1024 * 1024) {
                          alert("Image must be less than 5MB");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setLogoPreview(event.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    aria-label="Upload store logo"
                  />
                  {logoPreview ? (
                    <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden bg-surface">
                      <img src={logoPreview} alt="Store logo preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setLogoPreview(null)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                        aria-label="Remove logo"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-text-secondary">
                      <div className="p-3 rounded-full bg-primary-light text-primary">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm">Drag & drop or click to upload</p>
                      <p className="text-xs text-text-muted">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <Input
                  label="Phone (Optional)"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />

                <Input
                  label="Website (Optional)"
                  type="url"
                  placeholder="https://yourstore.com"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                />
              </div>

              <Textarea
                label="Return Policy"
                placeholder="Describe your return and refund policy..."
                rows={3}
                value={formData.returnPolicy}
                onChange={(e) => setFormData({ ...formData, returnPolicy: e.target.value })}
              />

              <Textarea
                label="Shipping Policy"
                placeholder="Describe your shipping methods, costs, and delivery times..."
                rows={3}
                value={formData.shippingPolicy}
                onChange={(e) => setFormData({ ...formData, shippingPolicy: e.target.value })}
              />
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-4">
            <Button type="submit" fullWidth isLoading={formLoading}>
              {formLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating Store...</span>
                </>
              ) : (
                "Create Store"
              )}
            </Button>
            <Button type="button" variant="outline" fullWidth onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SuspendedView({ store }: { store: StoreSummary }) {
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

function VerificationView({
  store,
  isPending,
  formLoading,
  onRequestVerification,
  onGoToDashboard,
}: {
  store: StoreSummary;
  isPending: boolean;
  formLoading: boolean;
  onRequestVerification: () => void;
  onGoToDashboard: () => void;
}) {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        {isPending ? (
          <>
            <Clock className="h-16 w-16 text-warning mx-auto mb-4 animate-pulse" />
            <h1 className="text-3xl font-bold text-text-primary mb-2">Verification Requested</h1>
            <p className="text-lg text-text-secondary mb-8">
              Your verification request is under review. We'll notify you once processed.
            </p>
          </>
        ) : (
          <>
            <AlertCircle className="h-16 w-16 text-accent mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-text-primary mb-2">Verification Rejected</h1>
            <p className="text-lg text-text-secondary mb-8">
              Your verification request was not approved. You can request again after addressing any issues.
            </p>
          </>
        )}

        <div className="space-y-4 text-left max-w-md mx-auto">
          <div className="flex items-center gap-3 p-4 bg-surface rounded-lg border border-border">
            {isPending ? (
              <>
                <Clock className="h-6 w-6 text-warning flex-shrink-0" />
                <div>
                  <p className="font-medium text-text-primary">Under Review</p>
                  <p className="text-sm text-text-secondary">Our team is reviewing your verification request</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-6 w-6 text-accent flex-shrink-0" />
                <div>
                  <p className="font-medium text-text-primary">Rejected</p>
                  <p className="text-sm text-text-secondary">Please address the issues and request again</p>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 p-4 bg-surface rounded-lg border border-border">
            <Eye className="h-6 w-6 text-primary flex-shrink-0" />
            <div>
              <p className="font-medium text-text-primary">Listing Limit: {store.listingLimit ?? "Unlimited"}</p>
              <p className="text-sm text-text-secondary">Verified stores get unlimited listings</p>
            </div>
          </div>
        </div>

        {!isPending && (
          <Button variant="primary" size="lg" fullWidth onClick={onRequestVerification} isLoading={formLoading}>
            {formLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Requesting Verification...</span>
              </>
            ) : (
              "Request Verification"
            )}
          </Button>
        )}

        <Button variant="outline" size="lg" fullWidth onClick={onGoToDashboard} className="mt-4">
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

function DashboardView({
  store,
  handleGoToDashboard,
  handleRequestVerification,
  formLoading,
}: {
  store: StoreSummary;
  handleGoToDashboard: () => void;
  handleRequestVerification: () => void;
  formLoading: boolean;
}) {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-1">{store.name}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant={store.status === "APPROVED" ? "success" : "warning"} size="sm">
                {store.status}
              </Badge>
              <Badge
                variant={
                  store.verificationStatus === "VERIFIED" ? "success" :
                  store.verificationStatus === "PENDING" ? "warning" :
                  "danger"
                }
                size="sm"
              >
                {store.verificationStatus}
              </Badge>
            </div>
          </div>
          <Button variant="primary" size="lg" leftIcon={<Eye className="h-5 w-5" aria-hidden="true" />} onClick={handleGoToDashboard}>
            Open Seller Dashboard
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card variant="outlined" hoverable>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Products Listed</p>
                  <p className="text-3xl font-bold text-text-primary mt-1">{store.productCount}</p>
                  <p className="text-sm text-text-secondary mt-1">
                    {store.listingLimit !== null ? (
                      <>
                        {store.productCount} of {store.listingLimit} —{" "}
                        <Button variant="ghost" size="sm" onClick={handleRequestVerification}>
                          Verify for Unlimited
                        </Button>
                      </>
                    ) : (
                      "Unlimited (Verified)"
                    )}
                  </p>
                </div>
                <div className="p-3 bg-primary-light rounded-xl text-primary">
                  <Store className="h-6 w-6" aria-hidden="true" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined" hoverable>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Store Status</p>
                  <p className="text-3xl font-bold text-text-primary mt-1">
                    <Badge
                      variant={
                        store.status === "APPROVED" ? "success" :
                        store.status === "SUSPENDED" ? "danger" : "warning"
                      }
                      size="lg"
                    >
                      {store.status}
                    </Badge>
                  </p>
                  <p className="text-sm text-text-secondary mt-1">
                    {store.verificationStatus === "VERIFIED" ? "Verified — unlimited listings" :
                     store.verificationStatus === "PENDING" ? "Verification under review" :
                     "Unverified — listing limit applies"}
                  </p>
                </div>
                <div className="p-3 bg-success-light rounded-xl text-success">
                  <CheckCircle className="h-6 w-6" aria-hidden="true" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card variant="outlined">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Store className="h-5 w-5" aria-hidden="true" /> Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="primary" fullWidth leftIcon={<Eye className="h-4 w-4" aria-hidden="true" />} onClick={handleGoToDashboard}>
                Open Seller Dashboard
              </Button>
              <NavLink to={`/products/${store.slug}`}>
                <Button variant="outline" fullWidth leftIcon={<ExternalLink className="h-4 w-4" aria-hidden="true" />}>
                  View Storefront
                </Button>
              </NavLink>
              {store.verificationStatus !== "VERIFIED" && (
                <Button variant="primary" fullWidth leftIcon={<Shield className="h-4 w-4" aria-hidden="true" />} onClick={handleRequestVerification} isLoading={formLoading}>
                  {formLoading ? "Requesting..." : "Request Verification"}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Store Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Category</span>
                <span className="text-text-primary font-medium">{store.category ?? "Not set"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Phone</span>
                <span className="text-text-primary font-medium">{store.phone ?? "Not set"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Created</span>
                <span className="text-text-primary font-medium">{new Date(store.createdAt).toLocaleDateString()}</span>
              </div>
              {store.verifiedAt && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Verified</span>
                  <span className="text-text-primary font-medium">{new Date(store.verifiedAt).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Listing Limit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-2 bg-border rounded-full overflow-hidden">
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
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Edit Store Details</h2>
          <Card variant="outlined">
            <CardContent className="p-6">
              <form className="space-y-6" noValidate>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Input
                    label="Store Name"
                    value={store.name}
                    readOnly
                  />
                  <Select
                    label="Category"
                    placeholder="Select a category"
                    options={storeCategories.map((c) => ({ value: c.value, label: c.label }))}
                    value={store.category ?? ""}
                    disabled
                  />
                </div>

                <Textarea
                  label="Description"
                  value={store.description ?? ""}
                  readOnly
                  rows={3}
                />

                <div className="grid gap-6 sm:grid-cols-2">
                  <Input
                    label="Phone"
                    type="tel"
                    value={store.phone ?? ""}
                    readOnly
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button variant="outline" onClick={handleGoToDashboard} leftIcon={<Eye className="h-4 w-4" aria-hidden="true" />}>
                    Open Full Dashboard
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StoreNotFoundView() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <Clock className="h-12 w-12 text-text-muted mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-text-primary mb-2">Loading store...</h2>
      </div>
    </div>
  );
}

export const SellPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userRole = useSelector((state: RootState) => state.auth.user?.role ?? null);

  const [view, setView] = useState<SellView>("pitch");
  const [store, setStore] = useState<StoreSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<StoreFormData>(initialFormData);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Determine initial view based on auth and store state
  const initializeView = async () => {
    if (!isAuthenticated) {
      setView("pitch");
      return;
    }

    if (userRole === "ADMIN") {
      navigate("/admin");
      return;
    }

    setLoading(true);
    try {
      const response = await getMyStore();
      const storeData = response.store;
      setStore(storeData);

      if (!storeData) {
        setView("create");
      } else if (storeData.status === "SUSPENDED") {
        setView("suspended");
      } else if (storeData.verificationStatus === "PENDING" || storeData.verificationStatus === "REJECTED") {
        setView("verification");
      } else {
        setView("dashboard");
      }
    } catch {
      setView("create");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFormLoading(true);

    try {
      const input: CreateStoreInput = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        phone: formData.phone || undefined,
        returnPolicy: formData.returnPolicy || undefined,
        shippingPolicy: formData.shippingPolicy || undefined,
        logoUrl: logoPreview || undefined,
      };

      await createStore(input);

      // Refresh user to get updated role
      try {
        const freshUser = await getCurrentUser();
        dispatch(setCredentials(freshUser));
      } catch {
        try {
          const freshUser = await refreshSession();
          dispatch(setCredentials(freshUser));
        } catch {
          // ignore
        }
      }

      // Re-initialize to show dashboard
      initializeView();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create store. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleRequestVerification = async () => {
    setError(null);
    setFormLoading(true);

    try {
      await requestVerification();
      if (store) {
        setStore({ ...store, verificationStatus: "PENDING", verificationRequestedAt: new Date().toISOString() });
      }
      setView("verification");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request verification. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    navigate("/seller");
  };

  const handleCancel = () => {
    navigate("/");
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <PitchPage />;
  }

  if (view === "create") {
    return (
      <CreateStoreForm
        formData={formData}
        setFormData={setFormData}
        logoPreview={logoPreview}
        setLogoPreview={setLogoPreview}
        error={error}
        formLoading={formLoading}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    );
  }

  if (!store) {
    return <StoreNotFoundView />;
  }

  if (view === "suspended") {
    return <SuspendedView store={store} />;
  }

  if (view === "verification") {
    return (
      <VerificationView
        store={store}
        isPending={store.verificationStatus === "PENDING"}
        formLoading={formLoading}
        onRequestVerification={handleRequestVerification}
        onGoToDashboard={handleGoToDashboard}
      />
    );
  }

  // Dashboard view
  return (
    <DashboardView
      store={store}
      handleGoToDashboard={handleGoToDashboard}
      handleRequestVerification={handleRequestVerification}
      formLoading={formLoading}
    />
  );
};