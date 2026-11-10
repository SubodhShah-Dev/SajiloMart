import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import type { Product } from "../../services/api";
import { ProductCard } from "../../components/product/ProductCard";
import type { RootState } from "../../store";
import { selectWishlistIds } from "../../store/slices/wishlistSlice";
import { useWishlistToggle } from "../../hooks/useWishlistToggle";

interface ProductGridProps {
  products?: Product[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
  viewAllLink?: string;
  columns?: { base: number; sm: number; md: number; lg: number; xl: number };
}

const columnClasses: Record<
  number,
  { base: string; sm: string; md: string; lg: string; xl: string }
> = {
  1: {
    base: "grid-cols-1",
    sm: "sm:grid-cols-1",
    md: "md:grid-cols-1",
    lg: "lg:grid-cols-1",
    xl: "xl:grid-cols-1",
  },
  2: {
    base: "grid-cols-2",
    sm: "sm:grid-cols-2",
    md: "md:grid-cols-2",
    lg: "lg:grid-cols-2",
    xl: "xl:grid-cols-2",
  },
  3: {
    base: "grid-cols-3",
    sm: "sm:grid-cols-3",
    md: "md:grid-cols-3",
    lg: "lg:grid-cols-3",
    xl: "xl:grid-cols-3",
  },
  4: {
    base: "grid-cols-4",
    sm: "sm:grid-cols-4",
    md: "md:grid-cols-4",
    lg: "lg:grid-cols-4",
    xl: "xl:grid-cols-4",
  },
  5: {
    base: "grid-cols-5",
    sm: "sm:grid-cols-5",
    md: "md:grid-cols-5",
    lg: "lg:grid-cols-5",
    xl: "xl:grid-cols-5",
  },
};

export const ProductGrid = ({
  products = [],
  title = "Featured Products",
  subtitle,
  showViewAll = true,
  viewAllLink = "/browse",
  columns = { base: 1, sm: 2, md: 2, lg: 3, xl: 4 },
}: ProductGridProps) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const wishlistIds = useSelector((state: RootState) => selectWishlistIds(state));
  const toggleWishlist = useWishlistToggle();

  if (products.length === 0) return null;

  const gridCols = [
    columnClasses[columns.base]?.base ?? "grid-cols-1",
    columnClasses[columns.sm]?.sm ?? "sm:grid-cols-2",
    columnClasses[columns.md]?.md ?? "md:grid-cols-2",
    columnClasses[columns.lg]?.lg ?? "lg:grid-cols-3",
    columnClasses[columns.xl]?.xl ?? "xl:grid-cols-4",
  ].join(" ");

  return (
    <section className="py-12 sm:py-16" aria-labelledby={title.toLowerCase().replace(/\s+/g, "-")}>
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 id={title.toLowerCase().replace(/\s+/g, "-")} className="text-2xl sm:text-3xl font-bold text-text-primary">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-text-secondary">{subtitle}</p>
            )}
          </div>
          {showViewAll && (
            <NavLink
              to={viewAllLink}
              className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary-hover transition-colors self-end"
            >
              View All
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </NavLink>
          )}
        </header>

        <div
          className={`grid gap-6 ${gridCols}`}
          role="list"
          aria-label={title}
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isAuthenticated={isAuthenticated}
              inWishlist={wishlistIds.includes(product.id)}
              onToggleWishlist={toggleWishlist}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
