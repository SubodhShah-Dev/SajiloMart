import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Clock, Tag } from "lucide-react";
import type { Product } from "../../data/mockData";
import { Card, CardContent, Badge, Button } from "../../components/ui";

interface FlashDealsProps {
  products?: Product[];
  endTime?: string;
}

export const FlashDeals = ({
  products = [],
  endTime = "2024-12-31T23:59:59Z",
}: FlashDealsProps) => {
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const end = new Date(endTime).getTime();
      const now = new Date().getTime();
      const difference = end - now;

      if (difference <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  if (products.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-primary-light" aria-labelledby="flash-deals-heading">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 id="flash-deals-heading" className="text-2xl sm:text-3xl font-bold text-text-primary flex items-center gap-2">
              <Tag className="h-6 w-6 text-accent" aria-hidden="true" />
              Flash Deals
            </h2>
            <p className="mt-2 text-text-secondary">
              Limited time offers - ends soon!
            </p>
          </div>

          <div
            className="flex items-center gap-3 bg-surface rounded-lg px-4 py-2 border border-border"
            role="timer"
            aria-live="polite"
            aria-label="Time remaining"
          >
            <span className="text-sm text-text-secondary flex items-center gap-1">
              <Clock className="h-4 w-4" aria-hidden="true" />
              Ends in:
            </span>
            <div className="flex items-center gap-1">
              <span className="w-10 h-10 flex items-center justify-center bg-primary text-text-inverse rounded-lg font-mono text-lg">
                {formatNumber(timeRemaining.hours)}
              </span>
              <span className="text-primary font-mono text-lg">:</span>
              <span className="w-10 h-10 flex items-center justify-center bg-primary text-text-inverse rounded-lg font-mono text-lg">
                {formatNumber(timeRemaining.minutes)}
              </span>
              <span className="text-primary font-mono text-lg">:</span>
              <span className="w-10 h-10 flex items-center justify-center bg-primary text-text-inverse rounded-lg font-mono text-lg">
                {formatNumber(timeRemaining.seconds)}
              </span>
            </div>
          </div>
        </header>

        <div
          className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide"
          role="list"
          aria-label="Flash deal products"
        >
          {products.map((product) => (
            <article
              key={product.id}
              role="listitem"
              className="flex-shrink-0 w-[280px] sm:w-[300px]"
            >
              <NavLink to={`/products/${product.id}`}>
                <Card variant="elevated" padding="none" hoverable className="h-full flex flex-col">
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {product.badge && (
                      <Badge
                        variant={product.badge === "sale" ? "danger" : product.badge === "new" ? "primary" : "secondary"}
                        className="absolute top-3 left-3"
                      >
                        {product.badge.charAt(0).toUpperCase() + product.badge.slice(1)}
                      </Badge>
                    )}
                    {product.originalPrice && (
                      <Badge variant="danger" className="absolute top-3 right-3">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </Badge>
                    )}
                  </div>

                  <CardContent className="flex-1 flex flex-col p-4">
                    <h3 className="font-medium text-text-primary line-clamp-2 group-hover:text-primary transition-colors mb-2">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-text-primary">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-text-muted line-through">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="flex items-center gap-1 text-sm text-text-secondary">
                        <svg className="h-4 w-4 text-warning fill-current" viewBox="0 0 20 20" aria-hidden="true">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {product.rating.toFixed(1)}
                        <span className="text-text-muted">({product.reviewCount})</span>
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      fullWidth
                      size="sm"
                      className="mt-auto"
                    >
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              </NavLink>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};