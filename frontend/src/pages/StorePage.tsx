import { useEffect, useState } from "react";
import { Filter, X } from "lucide-react";
import { Button, Badge } from "../components/ui";
import { ProductCard } from "../components/product/ProductCard";
import type { Category } from "../data/mockData";
import { mockCategories } from "../data/mockData";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { selectWishlistIds, toggleWishlist } from "../store/slices/wishlistSlice";
import { getProducts, type Product } from "../services/api";

interface StoreFilters {
  categories: string[];
  sort: "price_asc" | "price_desc" | "rating" | "newest" | "bestselling";
  search: string;
}

export const StorePage = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const wishlistIds = useSelector((state: RootState) => selectWishlistIds(state));
  const dispatch = useDispatch<AppDispatch>();

  const [filters, setFilters] = useState<StoreFilters>({
    categories: [],
    sort: "bestselling",
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setLoading(true);
      try {
        const response = await getProducts({
          category: filters.categories[0],
          search: filters.search || undefined,
          sort: filters.sort,
          page: 1,
          limit: 50,
        });

        if (!cancelled) {
          setProducts(response.products);
        }
      } catch {
        if (!cancelled) {
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [filters]);

  const activeFilterCount = filters.categories.length + (filters.search ? 1 : 0);

  const handleCategoryToggle = (categoryId: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((c) => c !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const handleSortChange = (sort: StoreFilters["sort"]) => {
    setFilters((prev) => ({ ...prev, sort }));
  };

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  };

  const clearAllFilters = () => {
    setFilters({ categories: [], sort: "bestselling", search: "" });
  };

  const clearCategory = (categoryId: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== categoryId),
    }));
  };

  const clearSearch = () => {
    setFilters((prev) => ({ ...prev, search: "" }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">Our Store</h1>
          <p className="text-text-secondary">Discover thousands of products from top brands</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:hidden flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Filters</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                leftIcon={<Filter className="h-4 w-4" aria-hidden="true" />}
              >
                {showFilters ? "Hide" : "Show"} Filters
              </Button>
            </div>

            <div className={`${showFilters || undefined ? "block" : "hidden lg:block"} space-y-6`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-text-primary">Categories</h3>
                  {filters.categories.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
                      Clear all
                    </Button>
                  )}
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {mockCategories.map((category: Category) => (
                    <label key={category.id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-text-secondary">{category.name}</span>
                      <span className="ml-auto text-xs text-text-muted">({category.productCount})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-text-primary mb-3">Sort By</h3>
                <div className="space-y-2">
                  {[
                    { value: "bestselling", label: "Best Selling" },
                    { value: "newest", label: "Newest" },
                    { value: "price_asc", label: "Price: Low to High" },
                    { value: "price_desc", label: "Price: High to Low" },
                    { value: "rating", label: "Highest Rated" },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="sort"
                        value={option.value}
                        checked={filters.sort === option.value}
                        onChange={() => handleSortChange(option.value as StoreFilters["sort"])}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-text-secondary">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="relative max-w-xs w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {filters.search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 lg:ml-auto">
                <span className="text-sm text-text-secondary hidden sm:block">
                  {products.length} products
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  leftIcon={<Filter className="h-4 w-4" aria-hidden="true" />}
                  className="lg:hidden"
                >
                  Filters
                </Button>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6 min-h-[40px] animate-slide-down" role="status" aria-live="polite">
                {filters.categories.map((catId) => {
                  const category = mockCategories.find((c) => c.id === catId);
                  return category ? (
                    <Badge key={catId} variant="outline" size="sm" className="gap-1" onClick={() => clearCategory(catId)}>
                      {category.name}
                      <X className="h-3 w-3 cursor-pointer" aria-hidden="true" />
                    </Badge>
                  ) : null;
                })}
                {filters.search && (
                  <Badge variant="outline" size="sm" className="gap-1" onClick={clearSearch}>
                    Search: "{filters.search}"
                    <X className="h-3 w-3 cursor-pointer" aria-hidden="true" />
                  </Badge>
                )}
                {activeFilterCount > 1 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-text-muted hover:text-accent">
                    Clear all
                  </Button>
                )}
              </div>
            )}

            {loading ? (
              <div className="text-center py-16">
                <p className="text-text-secondary">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-surface flex items-center justify-center">
                  <svg className="h-8 w-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-text-primary mb-2">No products found</h2>
                <p className="text-text-secondary mb-6">Try adjusting your filters or search terms</p>
                <Button variant="outline" onClick={clearAllFilters}>Clear all filters</Button>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" role="list" aria-label="Products">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isAuthenticated={isAuthenticated}
                    inWishlist={wishlistIds.includes(product.id)}
                    onToggleWishlist={(item) => dispatch(toggleWishlist(item))}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
