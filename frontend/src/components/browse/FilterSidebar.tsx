import { useState } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { Button, Badge, Input } from "../ui";
import type { BrowseFilters } from "../../data/mockData";
import { mockCategories } from "../../data/mockData";

interface FilterSidebarProps {
  filters: BrowseFilters;
  onToggleCategory: (category: string) => void;
  onSetPriceRange: (min: number | null, max: number | null) => void;
  onSetMinRating: (rating: number | null) => void;
  onSetInStockOnly: (value: boolean) => void;
  onSetSort: (sort: BrowseFilters["sort"]) => void;
  isMobile?: boolean;
}

const priceRange = { min: 0, max: 500 };

const ratingOptions = [
  { value: 4, label: "4 stars & up" },
  { value: 3, label: "3 stars & up" },
  { value: 2, label: "2 stars & up" },
  { value: 1, label: "1 star & up" },
];

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "bestselling", label: "Best Selling" },
  { value: "rating", label: "Highest Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export const FilterSidebar = ({
  filters,
  onToggleCategory,
  onSetPriceRange,
  onSetMinRating,
  onSetInStockOnly,
  onSetSort,
  isMobile = false,
}: FilterSidebarProps) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categories: true,
    price: true,
    rating: true,
    availability: true,
    sort: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, type: "min" | "max") => {
    const value = e.target.value ? Number(e.target.value) : null;
    if (type === "min") {
      onSetPriceRange(value, filters.priceMax);
    } else {
      onSetPriceRange(filters.priceMin, value);
    }
  };

  return (
    <aside
      className={`w-full lg:w-72 shrink-0 ${isMobile ? "fixed inset-y-0 right-0 z-50 bg-surface shadow-xl transform transition-transform duration-300" : ""}`}
      aria-label="Product filters"
    >
      <div className="lg:sticky lg:top-24 lg:self-start p-4 lg:p-6 border-r lg:border-r-0 border-border h-full overflow-y-auto">
        <h2 className="text-lg font-semibold text-text-primary mb-6 lg:mb-8">Filters</h2>

        {/* Categories */}
        <section className="mb-6">
          <button
            type="button"
            onClick={() => toggleSection("categories")}
            className="w-full flex items-center justify-between text-sm font-medium text-text-primary mb-3"
            aria-expanded={expandedSections.categories}
          >
            <span>Categories</span>
            {expandedSections.categories ? (
              <ChevronUp className="h-4 w-4 text-text-muted" />
            ) : (
              <ChevronDown className="h-4 w-4 text-text-muted" />
            )}
          </button>
          {expandedSections.categories && (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {mockCategories.map((category) => {
                const isSelected = filters.categories.includes(category.slug);
                return (
                  <label
                    key={category.slug}
                    className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-surface-hover transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleCategory(category.slug)}
                      className="h-4 w-4 rounded border-border text-primary focus-visible:ring-primary"
                    />
                    <span className="flex-1 text-sm text-text-secondary truncate">{category.name}</span>
                    <Badge variant="outline" size="sm" className="shrink-0">
                      {category.productCount}
                    </Badge>
                  </label>
                );
              })}
            </div>
          )}
        </section>

        {/* Price Range */}
        <section className="mb-6">
          <button
            type="button"
            onClick={() => toggleSection("price")}
            className="w-full flex items-center justify-between text-sm font-medium text-text-primary mb-3"
            aria-expanded={expandedSections.price}
          >
            <span>Price Range</span>
            {expandedSections.price ? (
              <ChevronUp className="h-4 w-4 text-text-muted" />
            ) : (
              <ChevronDown className="h-4 w-4 text-text-muted" />
            )}
          </button>
          {expandedSections.price && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Min"
                  type="number"
                  placeholder={String(priceRange.min)}
                  value={filters.priceMin ?? ""}
                  onChange={(e) => handlePriceChange(e, "min")}
                  size="sm"
                />
                <Input
                  label="Max"
                  type="number"
                  placeholder={String(priceRange.max)}
                  value={filters.priceMax ?? ""}
                  onChange={(e) => handlePriceChange(e, "max")}
                  size="sm"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>${priceRange.min}</span>
                <span>${priceRange.max}</span>
              </div>
            </div>
          )}
        </section>

        {/* Rating */}
        <section className="mb-6">
          <button
            type="button"
            onClick={() => toggleSection("rating")}
            className="w-full flex items-center justify-between text-sm font-medium text-text-primary mb-3"
            aria-expanded={expandedSections.rating}
          >
            <span>Rating</span>
            {expandedSections.rating ? (
              <ChevronUp className="h-4 w-4 text-text-muted" />
            ) : (
              <ChevronDown className="h-4 w-4 text-text-muted" />
            )}
          </button>
          {expandedSections.rating && (
            <div className="space-y-2">
              {ratingOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="rating"
                    value={String(option.value)}
                    checked={filters.minRating === option.value}
                    onChange={() => onSetMinRating(option.value)}
                    className="h-4 w-4 border-border text-primary focus-visible:ring-primary"
                  />
                  <span className="text-sm text-text-secondary flex items-center gap-1">
                    <svg className="h-4 w-4 text-warning fill-current" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {option.label}
                  </span>
                </label>
              ))}
              {filters.minRating !== null && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSetMinRating(null)}
                  className="text-accent hover:text-accent-hover justify-start"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Clear rating filter
                </Button>
              )}
            </div>
          )}
        </section>

        {/* Availability */}
        <section className="mb-6">
          <button
            type="button"
            onClick={() => toggleSection("availability")}
            className="w-full flex items-center justify-between text-sm font-medium text-text-primary mb-3"
            aria-expanded={expandedSections.availability}
          >
            <span>Availability</span>
            {expandedSections.availability ? (
              <ChevronUp className="h-4 w-4 text-text-muted" />
            ) : (
              <ChevronDown className="h-4 w-4 text-text-muted" />
            )}
          </button>
          {expandedSections.availability && (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.inStockOnly}
                onChange={(e) => onSetInStockOnly(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus-visible:ring-primary"
              />
              <span className="text-sm text-text-secondary">In stock only</span>
            </label>
          )}
        </section>

        {/* Sort */}
        <section className="mb-6">
          <button
            type="button"
            onClick={() => toggleSection("sort")}
            className="w-full flex items-center justify-between text-sm font-medium text-text-primary mb-3"
            aria-expanded={expandedSections.sort}
          >
            <span>Sort By</span>
            {expandedSections.sort ? (
              <ChevronUp className="h-4 w-4 text-text-muted" />
            ) : (
              <ChevronDown className="h-4 w-4 text-text-muted" />
            )}
          </button>
          {expandedSections.sort && (
            <select
              value={filters.sort}
              onChange={(e) => onSetSort(e.target.value as BrowseFilters["sort"])}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent appearance-none bg-no-repeat bg-right pr-8"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: "right 0.5rem center",
                backgroundSize: "1.5em 1.5em",
              }}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </section>
      </div>
    </aside>
  );
};
