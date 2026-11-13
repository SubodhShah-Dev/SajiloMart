import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Edit,
  ExternalLink,
  Package,
  Plus,
  Trash2,
} from "lucide-react";

import { Badge, Button, Card, type BadgeProps } from "../../components/ui";
import { ProductForm, type ProductFormData } from "../../components/seller/ProductForm";
import {
  createProduct,
  deleteProduct,
  getVendorProducts,
  updateProduct,
  type StoreSummary,
  type VendorProduct,
} from "../../services/api";

type StatusFilter = "all" | "active" | "draft" | "removed";

interface SellerProductsProps {
  store: StoreSummary;
  onStoreChanged: () => Promise<void> | void;
}

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All products" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Out of stock" },
  { value: "removed", label: "Removed" },
];

const productStatusMeta: Record<
  VendorProduct["status"],
  { variant: BadgeProps["variant"]; label: string }
> = {
  active: { variant: "success", label: "Active" },
  removed: { variant: "danger", label: "Removed" },
};

function ProductThumb({ product }: { product: VendorProduct }) {
  if (product.image) {
    return (
      <img
        src={product.image}
        alt=""
        className="h-11 w-11 flex-shrink-0 rounded-lg border border-border object-cover"
      />
    );
  }

  return (
    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-surface-hover text-text-muted">
      <Package className="h-5 w-5" aria-hidden="true" />
    </span>
  );
}

export const SellerProducts = ({ store, onStoreChanged }: SellerProductsProps) => {
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<VendorProduct | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await getVendorProducts({
          page,
          limit: 20,
          status: statusFilter,
        });

        if (cancelled) {
          return;
        }

        setProducts(response.products);
        setTotalPages(response.totalPages);
        setLoadError(null);
        setIsLoading(false);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setLoadError(
          err instanceof Error ? err.message : "Failed to load your products.",
        );
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, statusFilter, reloadKey]);

  const canAddProducts = store.status === "APPROVED";
  const atListingLimit =
    store.listingLimit !== null && store.productCount >= store.listingLimit;

  const openCreateForm = () => {
    setEditingProduct(null);
    setActionError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (product: VendorProduct) => {
    setEditingProduct(product);
    setActionError(null);
    setIsFormOpen(true);
  };

  const refreshList = async () => {
    setPage(1);
    setReloadKey((key) => key + 1);
    await onStoreChanged();
  };

  const handleCreate = async (data: ProductFormData) => {
    setIsSaving(true);
    setActionError(null);

    try {
      await createProduct(data);
      setIsFormOpen(false);
      await refreshList();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to create the product.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (data: ProductFormData) => {
    if (!editingProduct) {
      return;
    }

    setIsSaving(true);
    setActionError(null);

    try {
      await updateProduct(editingProduct.id, data);
      setIsFormOpen(false);
      setEditingProduct(null);
      await refreshList();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to update the product.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (product: VendorProduct) => {
    const confirmed = window.confirm(
      `Remove "${product.name}" from your store? This can't be undone from here.`,
    );

    if (!confirmed) {
      return;
    }

    setActionError(null);

    try {
      await deleteProduct(product.id);
      await refreshList();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to remove the product.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <label htmlFor="product-status" className="text-sm text-text-secondary">
            Show
          </label>
          <select
            id="product-status"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as StatusFilter);
              setPage(1);
              setIsLoading(true);
            }}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {statusFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={openCreateForm}
          disabled={!canAddProducts || atListingLimit}
          leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}
        >
          Add product
        </Button>
      </div>

      {!canAddProducts ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4 text-sm"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" aria-hidden="true" />
          <p className="text-text-secondary">
            Your store is awaiting approval, so products can&apos;t be listed yet.
          </p>
        </div>
      ) : atListingLimit ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4 text-sm"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" aria-hidden="true" />
          <p className="text-text-secondary">
            You&apos;ve reached your listing limit of {store.listingLimit}. Request
            verification in{" "}
            <Link to="/seller/settings" className="font-medium text-primary hover:underline">
              Settings
            </Link>{" "}
            to add more.
          </p>
        </div>
      ) : null}

      {actionError ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm text-accent"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{actionError}</span>
        </div>
      ) : null}

      <Card padding="none">
        {isLoading ? (
          <div className="space-y-3 p-5" aria-busy="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-lg bg-border" />
            ))}
          </div>
        ) : loadError ? (
          <div className="p-10 text-center">
            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-accent" aria-hidden="true" />
            <p className="font-medium text-text-primary">Couldn&apos;t load products</p>
            <p className="mt-1 text-sm text-text-secondary">{loadError}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setIsLoading(true);
                setReloadKey((key) => key + 1);
              }}
            >
              Try again
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center">
            <Package className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
            <p className="font-medium text-text-primary">
              {statusFilter === "all" ? "No products yet" : "Nothing here"}
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              {statusFilter === "all"
                ? "Add your first product to start selling."
                : "No products match this filter."}
            </p>
            {statusFilter === "all" && canAddProducts && !atListingLimit ? (
              <Button className="mt-4" onClick={openCreateForm}>
                Add a product
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm text-text-secondary">
                    <th scope="col" className="p-4 font-medium">Product</th>
                    <th scope="col" className="p-4 font-medium">Price</th>
                    <th scope="col" className="p-4 font-medium">Stock</th>
                    <th scope="col" className="p-4 font-medium">Status</th>
                    <th scope="col" className="p-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((product) => {
                    const meta = productStatusMeta[product.status];

                    return (
                      <tr key={product.id} className="hover:bg-surface-hover">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <ProductThumb product={product} />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-text-primary">
                                {product.name}
                              </p>
                              <p className="text-sm capitalize text-text-secondary">
                                {product.category}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-text-primary">
                          ${product.price.toFixed(2)}
                        </td>
                        <td className="p-4 text-sm text-text-secondary">
                          {product.totalStock}
                          {product.reservedStock > 0
                            ? ` (${product.reservedStock} reserved)`
                            : ""}
                        </td>
                        <td className="p-4">
                          <Badge variant={meta.variant} size="sm">
                            {meta.label}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              to={`/products/${product.id}`}
                              aria-label={`View ${product.name} in the catalogue`}
                              className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                              <ExternalLink className="h-4 w-4" aria-hidden="true" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => openEditForm(product)}
                              aria-label={`Edit ${product.name}`}
                              className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                              <Edit className="h-4 w-4" aria-hidden="true" />
                            </button>
                            {product.status !== "removed" ? (
                              <button
                                type="button"
                                onClick={() => handleDelete(product)}
                                aria-label={`Remove ${product.name}`}
                                className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-accent/5 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="divide-y divide-border md:hidden">
              {products.map((product) => {
                const meta = productStatusMeta[product.status];

                return (
                  <li key={product.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <ProductThumb product={product} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-text-primary">
                          {product.name}
                        </p>
                        <p className="text-sm text-text-secondary">
                          <span className="capitalize">{product.category}</span> ·{" "}
                          {product.totalStock} in stock
                        </p>
                        <p className="mt-1 font-medium text-text-primary">
                          ${product.price.toFixed(2)}
                        </p>
                      </div>
                      <Badge variant={meta.variant} size="sm">
                        {meta.label}
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditForm(product)}
                        leftIcon={<Edit className="h-4 w-4" aria-hidden="true" />}
                      >
                        Edit
                      </Button>
                      <Link to={`/products/${product.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<ExternalLink className="h-4 w-4" aria-hidden="true" />}
                        >
                          View
                        </Button>
                      </Link>
                      {product.status !== "removed" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product)}
                          leftIcon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
                          className="text-accent hover:bg-accent/5"
                        >
                          Remove
                        </Button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>

            {totalPages > 1 ? (
              <div className="flex items-center justify-between border-t border-border p-4">
                <span className="text-sm text-text-secondary">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => {
                      setIsLoading(true);
                      setPage((current) => Math.max(1, current - 1));
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => {
                      setIsLoading(true);
                      setPage((current) => Math.min(totalPages, current + 1));
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </Card>

      {isFormOpen ? (
        <ProductForm
          initialData={editingProduct ?? undefined}
          onSubmit={editingProduct ? handleUpdate : handleCreate}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingProduct(null);
          }}
          isLoading={isSaving}
          title={editingProduct ? "Edit product" : "Add product"}
        />
      ) : null}
    </div>
  );
};
