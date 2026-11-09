import { Link } from "react-router-dom";
import { Home, Search, Compass, Box, Heart, TrendingUp } from "lucide-react";
import { Button, Card, CardContent } from "../components/ui";
import { mockCategories } from "../data/mockData";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="mx-auto mb-6 w-24 h-24 rounded-full bg-primary-light flex items-center justify-center">
            <Compass className="h-12 w-12 text-primary" aria-hidden="true" />
          </div>
          <h1 className="text-4xl font-bold text-text-primary mb-2">404</h1>
          <h2 className="text-xl text-text-secondary mb-4">Page Not Found</h2>
          <p className="text-text-secondary mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <Link to="/">
            <Button variant="primary" fullWidth leftIcon={<Home className="h-4 w-4" aria-hidden="true" />}>
              Go Home
            </Button>
          </Link>
          <Link to="/browse">
            <Button variant="outline" fullWidth leftIcon={<Search className="h-4 w-4" aria-hidden="true" />}>
              Browse Products
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <p className="text-sm text-text-muted mb-4">Or explore popular categories:</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {mockCategories.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                to={`/browse?category=${category.slug}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface hover:bg-surface-hover hover:border-primary/50 transition-colors text-left"
              >
                <span className="text-2xl" aria-hidden="true">{category.icon}</span>
                <div>
                  <p className="font-medium text-text-primary">{category.name}</p>
                  <p className="text-xs text-text-muted">{category.productCount} products</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <Card variant="outlined">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Box className="h-6 w-6 text-primary" aria-hidden="true" />
              <h3 className="font-medium text-text-primary">Popular Sections</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link to="/browse?sort=bestselling" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors">
                <TrendingUp className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
                <span className="text-text-secondary">Best Sellers</span>
              </Link>
              <Link to="/deals" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors">
                <Heart className="h-5 w-5 text-accent flex-shrink-0" aria-hidden="true" />
                <span className="text-text-secondary">Deals & Offers</span>
              </Link>
              <Link to="/new-arrivals" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors">
                <Compass className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
                <span className="text-text-secondary">New Arrivals</span>
              </Link>
              <Link to="/store" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors">
                <Box className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
                <span className="text-text-secondary">All Products</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;