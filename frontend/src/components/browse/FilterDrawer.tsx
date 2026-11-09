import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "../ui";
import { FilterSidebar } from "./FilterSidebar";
import type { BrowseFilters } from "../../data/mockData";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: BrowseFilters;
  onToggleCategory: (category: string) => void;
  onSetPriceRange: (min: number | null, max: number | null) => void;
  onSetMinRating: (rating: number | null) => void;
  onSetInStockOnly: (value: boolean) => void;
  onSetSort: (sort: BrowseFilters["sort"]) => void;
}

export const FilterDrawer = ({
  isOpen,
  onClose,
  filters,
  onToggleCategory,
  onSetPriceRange,
  onSetMinRating,
  onSetInStockOnly,
  onSetSort,
}: FilterDrawerProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="fixed inset-y-0 right-0 w-full max-w-sm bg-surface z-50 lg:hidden flex flex-col animate-slide-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
            aria-label="Close filters"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <FilterSidebar
            filters={filters}
            onToggleCategory={onToggleCategory}
            onSetPriceRange={onSetPriceRange}
            onSetMinRating={onSetMinRating}
            onSetInStockOnly={onSetInStockOnly}
            onSetSort={onSetSort}
            isMobile={true}
          />
        </div>
        <div className="p-4 border-t border-border bg-surface/50">
          <Button fullWidth onClick={onClose} variant="primary">
            Apply Filters
          </Button>
        </div>
      </aside>
    </>
  );
};