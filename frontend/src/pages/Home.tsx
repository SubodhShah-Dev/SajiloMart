import { useState, useEffect } from "react";

import { HeroBanner } from "./home/HeroBanner";
import { CategoryGrid } from "./home/CategoryGrid";
import { ProductGrid } from "./home/ProductGrid";
import { PromoBanners } from "./home/PromoBanners";
import { NewsletterSignup } from "./home/NewsletterSignup";
import { Footer } from "./home/Footer";
import { mockBanners, mockCategories, mockPromoBanners } from "../data/mockData";
import { getProducts, type Product } from "../services/api.js";

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getProducts({ page: 1, limit: 16 });
        if (!cancelled) {
          setProducts(response.products);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load products");
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-screen">
          <p className="text-text-secondary">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Error loading products</h1>
          <p className="text-text-secondary mb-6">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <HeroBanner banners={mockBanners} />

      <CategoryGrid categories={mockCategories} maxItems={8} />

      <ProductGrid
        products={products.slice(0, 8)}
        title="Featured Products"
        subtitle="Handpicked favorites from our collection"
        viewAllLink="/browse"
      />

      <PromoBanners banners={mockPromoBanners} />

      <ProductGrid
        products={products.slice(8, 16)}
        title="New Arrivals"
        subtitle="Fresh additions to our catalog"
        viewAllLink="/browse?sort=newest"
      />

      <NewsletterSignup />

      <Footer />
    </div>
  );
};

export default Home;
