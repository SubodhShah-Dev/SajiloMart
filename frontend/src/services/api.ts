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

const DEFAULT_API_BASE_URL = "http://localhost:5000";

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
