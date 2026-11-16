export interface HealthData {
  status: string;
  service: string;
  environment: string;
  timestamp: string;
  uptime: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  isFlashDeal?: boolean;
  flashDealEndTime?: string;
  badge?: "new" | "bestseller" | "limited" | "sale";
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  priceMin?: number;
  priceMax?: number;
  minRating?: number;
  inStockOnly?: boolean;
  sort?: "price_asc" | "price_desc" | "rating" | "newest" | "bestselling";
  page?: number;
  limit?: number;
}

export type AuthUserRole = "CUSTOMER" | "VENDOR" | "ADMIN";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  username: string;
  email: string;
  role: AuthUserRole;
  phone: string | null;
  profileImageUrl: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  username?: string;
}

interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiFailure {
  success: false;
  error: {
    message: string;
  };
}

// Dev falls back to the local API; production builds default to a relative base
// so the SPA works when served from the same origin as the API.
const DEFAULT_API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:4000"
  : "";

const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL
).replace(/\/$/, "");

export function getApiBaseUrl(): string {
  return apiBaseUrl;
}

function isApiSuccess<T>(value: unknown): value is ApiSuccess<T> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as { success?: unknown; data?: unknown };

  return candidate.success === true && candidate.data !== undefined;
}

function isApiFailure(value: unknown): value is ApiFailure {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as { success?: unknown; error?: unknown };

  if (typeof candidate.error !== "object" || candidate.error === null) {
    return false;
  }

  const error = candidate.error as { message?: unknown };

  return candidate.success === false && typeof error.message === "string";
}

async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init.body === undefined ? {} : { "Content-Type": "application/json" }),
      ...init.headers,
    },
  });

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok || !isApiSuccess<T>(body)) {
    const message = isApiFailure(body)
      ? body.error.message
      : `Request failed with status ${response.status}.`;

    throw new Error(message);
  }

  return body.data;
}

export async function getHealth(signal?: AbortSignal): Promise<HealthData> {
  return apiRequest<HealthData>("/api/health", { signal });
}

export async function getProducts(
  filters: ProductFilters,
  signal?: AbortSignal,
): Promise<ProductsResponse> {
  const params = new URLSearchParams();

  if (filters.category) {
    params.set("category", filters.category);
  }
  if (filters.search) {
    params.set("search", filters.search);
  }
  if (filters.priceMin !== undefined) {
    params.set("priceMin", String(filters.priceMin));
  }
  if (filters.priceMax !== undefined) {
    params.set("priceMax", String(filters.priceMax));
  }
  if (filters.minRating !== undefined) {
    params.set("minRating", String(filters.minRating));
  }
  if (filters.inStockOnly !== undefined) {
    params.set("inStockOnly", String(filters.inStockOnly));
  }
  if (filters.sort) {
    params.set("sort", filters.sort);
  }
  if (filters.page !== undefined) {
    params.set("page", String(filters.page));
  }
  if (filters.limit !== undefined) {
    params.set("limit", String(filters.limit));
  }

  return apiRequest<ProductsResponse>(`/api/products?${params.toString()}`, {
    signal,
  });
}

export async function getProductById(
  id: string,
  signal?: AbortSignal,
): Promise<Product> {
  const data = await apiRequest<{ product: Product }>(
    `/api/products/${encodeURIComponent(id)}`,
    { signal },
  );

  return data.product;
}

export async function loginUser(input: LoginInput): Promise<AuthUser> {
  const data = await apiRequest<{ user: AuthUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return data.user;
}

export async function registerUser(input: RegisterInput): Promise<AuthUser> {
  const data = await apiRequest<{ user: AuthUser }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return data.user;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const data = await apiRequest<{ user: AuthUser }>("/api/auth/me");
  return data.user;
}

export async function refreshSession(): Promise<AuthUser> {
  const data = await apiRequest<{ user: AuthUser }>("/api/auth/refresh", {
    method: "POST",
  });

  return data.user;
}

export async function logoutUser(): Promise<void> {
  await apiRequest<{ message: string }>("/api/auth/logout", {
    method: "POST",
  });
}

export async function updateCurrentUser(
  input: UpdateProfileInput,
): Promise<AuthUser> {
  const data = await apiRequest<{ user: AuthUser }>("/api/auth/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  return data.user;
}

export interface UsernameAvailableResponse {
  available: boolean;
  username: string;
}

export async function checkUsernameAvailable(
  username: string,
): Promise<UsernameAvailableResponse> {
  return apiRequest<UsernameAvailableResponse>(
    `/api/auth/username-available?username=${encodeURIComponent(username)}`,
  );
}

export interface CartItemResponse {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface CartResponse {
  id: string;
  items: CartItemResponse[];
  subtotal: number;
  itemCount: number;
}

export interface AddCartItemInput {
  productId: string;
  quantity?: number;
}

export interface UpdateCartQtyInput {
  quantity: number;
}

export interface AnonymousCartItem {
  productId: string;
  quantity: number;
}

export async function getCart(): Promise<CartResponse> {
  return apiRequest<CartResponse>("/api/cart");
}

export async function addCartItem(input: AddCartItemInput): Promise<CartResponse> {
  return apiRequest<CartResponse>("/api/cart", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCartQty(
  productId: string,
  input: UpdateCartQtyInput,
): Promise<CartResponse> {
  return apiRequest<CartResponse>(`/api/cart/${encodeURIComponent(productId)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function removeCartItem(productId: string): Promise<CartResponse> {
  return apiRequest<CartResponse>(`/api/cart/${encodeURIComponent(productId)}`, {
    method: "DELETE",
  });
}

export async function clearCart(): Promise<CartResponse> {
  return apiRequest<CartResponse>("/api/cart", {
    method: "DELETE",
  });
}

export async function mergeAnonymousCart(
  items: AnonymousCartItem[],
): Promise<CartResponse> {
  return apiRequest<CartResponse>("/api/cart/merge", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

export interface WishlistResponse {
  items: Product[];
}

export async function getWishlist(): Promise<WishlistResponse> {
  return apiRequest<WishlistResponse>("/api/wishlist");
}

export async function addWishlistItem(
  productId: string,
): Promise<WishlistResponse> {
  return apiRequest<WishlistResponse>("/api/wishlist", {
    method: "POST",
    body: JSON.stringify({ productId }),
  });
}

export async function removeWishlistItem(
  productId: string,
): Promise<WishlistResponse> {
  return apiRequest<WishlistResponse>(
    `/api/wishlist/${encodeURIComponent(productId)}`,
    { method: "DELETE" },
  );
}

export async function clearWishlist(): Promise<WishlistResponse> {
  return apiRequest<WishlistResponse>("/api/wishlist", {
    method: "DELETE",
  });
}

export interface VendorProduct extends Product {
  totalStock: number;
  reservedStock: number;
  status: "active" | "removed";
}

export interface VendorProductsResponse {
  products: VendorProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  totalStock: number;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  totalStock?: number;
}

export async function getVendorProducts(
  filters: { page?: number; limit?: number; status?: "all" | "active" | "draft" | "removed" },
  signal?: AbortSignal,
): Promise<VendorProductsResponse> {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.status) params.set("status", filters.status);

  return apiRequest<VendorProductsResponse>(`/api/seller/products?${params.toString()}`, { signal });
}

export async function createProduct(
  input: CreateProductInput,
  signal?: AbortSignal,
): Promise<VendorProduct> {
  const data = await apiRequest<{ product: VendorProduct }>("/api/seller/products", {
    method: "POST",
    body: JSON.stringify(input),
    signal,
  });
  return data.product;
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput,
  signal?: AbortSignal,
): Promise<VendorProduct> {
  const data = await apiRequest<{ product: VendorProduct }>(`/api/seller/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    signal,
  });
  return data.product;
}

export async function deleteProduct(
  id: string,
  signal?: AbortSignal,
): Promise<void> {
  await apiRequest<{ message: string }>(`/api/seller/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
    signal,
  });
}

export interface StoreSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  category: string | null;
  phone: string | null;
  status: "PENDING" | "APPROVED" | "SUSPENDED";
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  listingLimit: number | null;
  productCount: number;
  createdAt: string;
  verifiedAt: string | null;
  verificationRequestedAt: string | null;
  suspensionReason: string | null;
  returnPolicy: string | null;
  shippingPolicy: string | null;
}

export interface StoreSummaryResponse {
  store: StoreSummary | null;
}

export interface CreateStoreInput {
  name: string;
  description: string;
  category: string;
  phone?: string;
  returnPolicy?: string;
  shippingPolicy?: string;
  logoUrl?: string;
}

export interface UpdateStoreInput {
  name?: string;
  description?: string;
  category?: string;
  phone?: string;
  returnPolicy?: string;
  shippingPolicy?: string;
  logoUrl?: string;
}

export interface AdminStoreSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  category: string | null;
  phone: string | null;
  status: "PENDING" | "APPROVED" | "SUSPENDED";
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  listingLimit: number | null;
  productCount: number;
  createdAt: string;
  verifiedAt: string | null;
  suspensionReason: string | null;
  owner: {
    name: string;
    username: string;
    email: string;
  };
}

export interface AdminStoresResponse {
  stores: AdminStoreSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminSalesSummary {
  totalRevenue: number;
  paidOrders: number;
  averageOrderValue: number;
  pendingPayments: number;
}

export interface AdminProvinceSales {
  province: string;
  revenue: number;
  orders: number;
}

export interface AdminAnalyticsOverview {
  sales: {
    summary: AdminSalesSummary;
    byProvince: AdminProvinceSales[];
    unknownProvince: {
      revenue: number;
      orders: number;
    };
  };
  stores: {
    total: number;
    pendingVerification: number;
    verified: number;
    suspended: number;
  };
}

export interface AdminVerifyStoreInput {
  listingLimit?: number | null;
}

export interface AdminRejectStoreInput {
  reason: string;
}

export interface AdminSuspendStoreInput {
  reason: string;
}

export async function getMyStore(): Promise<StoreSummaryResponse> {
  return apiRequest<StoreSummaryResponse>("/api/seller/store");
}

export async function createStore(input: CreateStoreInput): Promise<StoreSummaryResponse> {
  return apiRequest<StoreSummaryResponse>("/api/seller/store", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateStore(input: UpdateStoreInput): Promise<StoreSummaryResponse> {
  return apiRequest<StoreSummaryResponse>("/api/seller/store", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function requestVerification(): Promise<StoreSummaryResponse> {
  return apiRequest<StoreSummaryResponse>("/api/seller/store/verification", {
    method: "POST",
  });
}

export async function getAdminAnalyticsOverview(): Promise<AdminAnalyticsOverview> {
  return apiRequest<AdminAnalyticsOverview>("/api/admin/analytics/overview");
}

export async function getAdminStores(
  filters: { page?: number; limit?: number; status?: string; verificationStatus?: string; search?: string } = {},
): Promise<AdminStoresResponse> {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.status) params.set("status", filters.status);
  if (filters.verificationStatus) params.set("verificationStatus", filters.verificationStatus);
  if (filters.search) params.set("search", filters.search);

  return apiRequest<AdminStoresResponse>(`/api/admin/stores?${params.toString()}`);
}

export async function adminSuspendStore(
  storeId: string,
  input: AdminSuspendStoreInput,
): Promise<{ store: AdminStoreSummary }> {
  return apiRequest<{ store: AdminStoreSummary }>(`/api/admin/stores/${encodeURIComponent(storeId)}/suspend`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function adminUnsuspendStore(
  storeId: string,
): Promise<{ store: AdminStoreSummary }> {
  return apiRequest<{ store: AdminStoreSummary }>(`/api/admin/stores/${encodeURIComponent(storeId)}/unsuspend`, {
    method: "POST",
  });
}

export async function adminVerifyStore(
  storeId: string,
  input: AdminVerifyStoreInput,
): Promise<{ store: AdminStoreSummary }> {
  return apiRequest<{ store: AdminStoreSummary }>(`/api/admin/stores/${encodeURIComponent(storeId)}/verify`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function adminRejectStore(
  storeId: string,
  input: AdminRejectStoreInput,
): Promise<{ store: AdminStoreSummary }> {
  return apiRequest<{ store: AdminStoreSummary }>(`/api/admin/stores/${encodeURIComponent(storeId)}/reject-verification`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
export interface District {
  id: string;
  name: string;
  province: string;
}

export interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  districtId: string;
  district: {
    id: string;
    name: string;
    province: string;
  };
  isDefault: boolean;
}

export interface CreateAddressInput {
  label?: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  districtId: string;
  isDefault?: boolean;
}

export async function getDistricts(): Promise<District[]> {
  return apiRequest<District[]>("/api/districts");
}

export async function getAddresses(): Promise<Address[]> {
  return apiRequest<Address[]>("/api/addresses");
}

export async function createAddress(input: CreateAddressInput): Promise<Address> {
  return apiRequest<Address>("/api/addresses", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PARTIAL"
  | "FULFILLED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export type PaymentMethod = "COD" | "STRIPE";

export interface ShippingAddressSnapshot {
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  district: string;
  province: string;
}

export interface OrderItemView {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPriceAtPurchase: string;
  lineTotal: string;
}

export interface OrderDetail {
  id: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  subtotal: string;
  shippingFee: string;
  total: string;
  shippingAddress: ShippingAddressSnapshot;
  createdAt: string;
  items: OrderItemView[];
}

export interface CheckoutInput {
  addressId: string;
  paymentMethod: PaymentMethod;
}

export async function checkout(input: CheckoutInput): Promise<OrderDetail> {
  return apiRequest<OrderDetail>("/api/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getOrders(): Promise<OrderDetail[]> {
  return apiRequest<OrderDetail[]>("/api/orders");
}

export async function getOrder(orderId: string): Promise<OrderDetail> {
  return apiRequest<OrderDetail>(`/api/orders/${encodeURIComponent(orderId)}`);
}

export interface StripeSessionView {
  id: string;
  url: string;
  expiresAt: number;
}

export async function createStripeSession(
  orderId: string,
): Promise<StripeSessionView> {
  return apiRequest<StripeSessionView>(
    `/api/payments/stripe/${encodeURIComponent(orderId)}/session`,
    { method: "POST" },
  );
}
