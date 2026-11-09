import { Heart } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";

import { Badge, Button, Card, CardContent } from "../ui";
import type { Product } from "../../services/api";
import type { AppDispatch } from "../../store";
import { addToCart } from "../../store/slices/cartSlice";

const PLACEHOLDER_IMAGE =
  "https://placehold.co/600x600/f3f4f6/6b7280?text=Product";

export interface ProductCardProps {
  product: Product;
  isAuthenticated: boolean;
  inWishlist: boolean;
  onToggleWishlist: (product: Product) => void;
}

export const ProductCard = ({
  product,
  isAuthenticated,
  inWishlist,
  onToggleWishlist,
}: ProductCardProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = PLACEHOLDER_IMAGE;
  };

  return (
    <article role="listitem">
      <Card variant="outlined" padding="none" hoverable className="h-full flex flex-col group">
        <div className="relative aspect-square overflow-hidden bg-surface-hover">
          <NavLink
            to={`/products/${product.id}`}
            className="block h-full w-full"
            aria-label={`View ${product.name}`}
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={handleImageError}
            />
          </NavLink>
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.badge && (
              <Badge
                variant={
                  product.badge === "sale" ? "danger" :
                  product.badge === "new" ? "primary" :
                  product.badge === "bestseller" ? "secondary" : "default"
                }
                size="sm"
              >
                {product.badge.charAt(0).toUpperCase() + product.badge.slice(1)}
              </Badge>
            )}
            {product.originalPrice && (
              <Badge variant="danger" size="sm">
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </Badge>
            )}
          </div>

          {isAuthenticated && (
            <button
              type="button"
              onClick={() => onToggleWishlist(product)}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md
                transition-all duration-200 hover:scale-110 hover:shadow-lg
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                group-hover:opacity-100 opacity-80"
              aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
              aria-pressed={inWishlist}
            >
              <Heart
                className={`h-5 w-5 transition-colors duration-200 ${
                  inWishlist ? "fill-accent text-accent" : "text-text-secondary hover:text-accent"
                }`}
                aria-hidden="true"
              />
            </button>
          )}
        </div>

        <CardContent className="flex-1 flex flex-col p-4">
          <h3 className="font-medium text-text-primary line-clamp-2 group-hover:text-primary transition-colors mb-2">
            <NavLink to={`/products/${product.id}`}>{product.name}</NavLink>
          </h3>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-text-primary">
              ${Number(product.price).toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-text-muted line-through">
                ${Number(product.originalPrice).toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center gap-1 text-sm text-text-secondary">
              <svg className="h-4 w-4 text-warning fill-current" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {Number(product.rating).toFixed(1)}
              <span className="text-text-muted">({product.reviewCount})</span>
            </span>
          </div>

          <Button
            variant="outline"
            fullWidth
            size="sm"
            className="mt-auto"
            onClick={() => dispatch(addToCart({ product }))}
          >
            Add to Cart
          </Button>
        </CardContent>
      </Card>
    </article>
  );
};
