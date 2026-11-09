import { NavLink } from "react-router-dom";
import type { Category } from "../../data/mockData";
import { Card } from "../../components/ui";

interface CategoryGridProps {
  categories?: Category[];
  maxItems?: number;
}

export const CategoryGrid = ({
  categories = [],
  maxItems = 8,
}: CategoryGridProps) => {
  const displayCategories = categories.slice(0, maxItems);

  if (displayCategories.length === 0) return null;

  return (
    <section className="py-12 sm:py-16" aria-labelledby="categories-heading">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h2 id="categories-heading" className="text-2xl sm:text-3xl font-bold text-text-primary">
            Shop by Category
          </h2>
          <p className="mt-2 text-text-secondary">
            Explore our wide range of product categories
          </p>
        </header>

        <div
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4"
          role="list"
          aria-label="Product categories"
        >
          {displayCategories.map((category) => (
            <article key={category.id} role="listitem">
              <NavLink
                to={`/browse?category=${encodeURIComponent(category.id)}`}
                className="group block"
              >
                <Card
                  variant="outlined"
                  padding="md"
                  hoverable
                  className="text-center h-full flex flex-col"
                >
                  <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-surface-hover group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={category.image}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                      aria-hidden="true"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-sm text-text-muted">
                      {category.productCount.toLocaleString()} products
                    </p>
                  </div>
                </Card>
              </NavLink>
            </article>
          ))}
        </div>

        <div className="mt-8 text-center">
          <NavLink
            to="/browse"
            className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary-hover transition-colors"
          >
            View All Categories
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
        </div>
      </div>
    </section>
  );
};