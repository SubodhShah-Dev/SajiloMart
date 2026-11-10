import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Store, TrendingUp, Shield, Truck } from "lucide-react";
import { Button } from "../components/ui";

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

      {/* Seller CTA Band */}
      <section className="bg-primary-light border-y border-primary/20 py-6" aria-labelledby="seller-cta-heading">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-xl text-primary">
                <Store className="h-8 w-8" aria-hidden="true" />
              </div>
              <div>
                <h2 id="seller-cta-heading" className="text-xl font-semibold text-text-primary">Want to sell on SajiloMart?</h2>
                <p className="text-text-secondary text-sm">Open your store in minutes. No approval wait, no hidden fees.</p>
              </div>
            </div>
            <NavLink to="/sell">
              <Button variant="primary" size="lg" leftIcon={<Store className="h-5 w-5" aria-hidden="true" />}>
                Start Selling
              </Button>
            </NavLink>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <TrendingUp className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-medium text-text-primary">Global Reach</p>
                <p className="text-sm text-text-secondary">Millions of customers</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Shield className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-medium text-text-primary">Secure Payments</p>
                <p className="text-sm text-text-secondary">Protected transactions</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Truck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-medium text-text-primary">Easy Shipping</p>
                <p className="text-sm text-text-secondary">Integrated logistics</p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
