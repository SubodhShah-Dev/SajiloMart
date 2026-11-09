import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { X, SlidersHorizontal, Package, Filter } from "lucide-react";
import { Button } from "../../components/ui";
import { ProductGrid } from "../../pages/home/ProductGrid";
import { FilterSidebar } from "../../components/browse/FilterSidebar";
import { FilterDrawer } from "../../components/browse/FilterDrawer";
import { SortDropdown } from "../../components/browse/SortDropdown";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../store";
import {
  toggleCategory,
  setCategories,
  setPriceRange,
  setMinRating,
  setInStockOnly,
  setSort,
  clearFilters,
  setFilteredProducts,
  selectBrowseFilters,
  selectFilteredProducts,
  selectResultsCount,
} from "../../store/slices/browseSlice";
import { getProducts, type ProductFilters } from "../../services/api.js";
import type { BrowseFilters } from "../../store/slices/browseSlice";

export const BrowsePage = () => {
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("search")?.trim() ?? "";
  const urlCategory = searchParams.get("category");

  const dispatch = useDispatch<AppDispatch>();
  const filters = useSelector(selectBrowseFilters);
  const filteredProducts = useSelector(selectFilteredProducts);
  const resultsCount = useSelector(selectResultsCount);

  useEffect(() => {
    if (urlCategory) {
      dispatch(setCategories([urlCategory]));
    }
  }, [urlCategory, dispatch]);

  // Fetch products from API whenever filters change in Redux
  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      dispatch(setFilteredProducts([]));
      setLoading(true);

      try {
        const apiFilters: ProductFilters = {
          category: filters.categories.length > 0 ? filters.categories[0] : undefined,
          search: searchTerm || undefined,
          priceMin: filters.priceMin ?? undefined,
          priceMax: filters.priceMax ?? undefined,
          minRating: filters.minRating ?? undefined,
          inStockOnly: filters.inStockOnly,
          sort: filters.sort,
          page: 1,
          limit: 50,
        };

        const response = await getProducts(apiFilters);
        if (!cancelled) {
          dispatch(setFilteredProducts(response.products));
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          dispatch(setFilteredProducts([]));
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [filters, dispatch, searchTerm]);

  const handleToggleCategory = useCallback((category: string) => {
    dispatch(toggleCategory(category));
  }, [dispatch]);

  const handleSetPriceRange = useCallback(
    (min: number | null, max: number | null) => {
      dispatch(setPriceRange({ min, max }));
    },
    [dispatch]
  );

  const handleSetMinRating = useCallback((rating: number | null) => {
    dispatch(setMinRating(rating));
  }, [dispatch]);

  const handleSetInStockOnly = useCallback((value: boolean) => {
    dispatch(setInStockOnly(value));
  }, [dispatch]);

  const handleSetSort = useCallback((sort: BrowseFilters["sort"]) => {
    dispatch(setSort(sort));
  }, [dispatch]);

  const handleClearFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const activeFilterCount =
    filters.categories.length +
    (filters.priceMin !== null || filters.priceMax !== null ? 1 : 0) +
    (filters.minRating !== null ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.sort !== "newest" ? 1 : 0);

  const hasActiveFilters = activeFilterCount > 0;

  const renderFilterBadge = (
    label: React.ReactNode,
    onRemove: () => void
  ) => (
    <span className="inline-flex items-center gap-1.5 bg-surface border border-border rounded-lg px-3 py-1.5 hover:border-primary/50 transition-colors">
      <span className="text-sm text-text-secondary whitespace-nowrap">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="flex items-center justify-center w-6 h-6 rounded-md text-text-muted hover:text-accent hover:bg-accent/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`Remove filter: ${label}`}
      >
        <X className="h-4 w-4" />
      </button>
    </span>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-surface border-b border-border px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
                Browse Products
              </h1>
              <p className="mt-1 text-text-secondary">
                {resultsCount} product{resultsCount !== 1 ? "s" : ""} found
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<SlidersHorizontal className="h-4 w-4" />}
                className="lg:hidden"
                onClick={() => setIsFilterDrawerOpen(true)}
              >
                Filters ({activeFilterCount})
              </Button>
              <SortDropdown
                value={filters.sort}
                onChange={handleSetSort}
                className="w-48"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Bar - always rendered to prevent layout shift */}
      <div className="bg-background border-b border-border">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div
              className={`flex flex-wrap items-center gap-2 min-h-[40px] transition-all duration-200 ${
                hasActiveFilters ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              role="region"
              aria-label="Active filters"
            >
              {hasActiveFilters && (
                <>
                  <span className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
                    <Filter className="h-4 w-4" aria-hidden="true" />
                    Active filters:
                  </span>
                  {filters.categories.map((cat: string) => (
                    renderFilterBadge(cat, () => handleToggleCategory(cat))
                  ))}
                  {(filters.priceMin !== null || filters.priceMax !== null) && (
                    renderFilterBadge(
                      `$${filters.priceMin ?? 0} - $${filters.priceMax ?? "∞"}`,
                      () => handleSetPriceRange(null, null)
                    )
                  )}
                  {filters.minRating !== null && (
                    renderFilterBadge(
                      `${filters.minRating}+ stars`,
                      () => handleSetMinRating(null)
                    )
                  )}
                  {filters.inStockOnly && (
                    renderFilterBadge("In stock only", () =>
                      handleSetInStockOnly(false)
                    )
                  )}
                  {filters.sort !== "newest" && (
                    renderFilterBadge(
                      `Sort: ${filters.sort.replace("_", " ")}`,
                      () => handleSetSort("newest")
                    )
                  )}
                </>
              )}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-accent border-accent hover:bg-accent/10 hover:text-accent-hover ml-auto sm:ml-0"
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex lg:flex-row flex-col-reverse gap-8">
          {/* Desktop Sidebar */}
          <aside className="lg:w-72 flex-shrink-0 hidden lg:block">
            <FilterSidebar
              filters={filters}
              onToggleCategory={handleToggleCategory}
              onSetPriceRange={handleSetPriceRange}
              onSetMinRating={handleSetMinRating}
              onSetInStockOnly={handleSetInStockOnly}
              onSetSort={handleSetSort}
            />
          </aside>

          {/* Product Grid */}
          <main className="flex-1 min-w-0">
            {loading && filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-text-secondary">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <Package className="h-16 w-16 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  No products found
                </h3>
                <p className="text-text-secondary mb-6">
                  Try adjusting your filters to find what you're looking for.
                </p>
                <Button variant="primary" onClick={handleClearFilters}>
                  Clear all filters
                </Button>
              </div>
            ) : (
              <ProductGrid
                products={filteredProducts}
                title=""
                showViewAll={false}
              />
            )}
          </main>
        </div>
      </div>

      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onToggleCategory={handleToggleCategory}
        onSetPriceRange={handleSetPriceRange}
        onSetMinRating={handleSetMinRating}
        onSetInStockOnly={handleSetInStockOnly}
        onSetSort={handleSetSort}
      />
    </div>
  );
};
