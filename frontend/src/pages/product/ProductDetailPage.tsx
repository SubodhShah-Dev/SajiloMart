import { useParams, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { Heart, ShoppingCart, Star, Truck, RotateCcw, Shield } from "lucide-react";
import { Button, Badge, Input } from "../../components/ui";
import { ProductGrid } from "../../pages/home/ProductGrid";
import { getProductById, type Product } from "../../services/api.js";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { selectWishlistIds } from "../../store/slices/wishlistSlice";
import { useWishlistToggle } from "../../hooks/useWishlistToggle";
import { addToCart } from "../../store/slices/cartSlice";

const PLACEHOLDER_IMAGE =
  "https://placehold.co/600x600/f3f4f6/6b7280?text=Product";

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const wishlistIds = useSelector((state: RootState) => selectWishlistIds(state));
  const dispatch = useDispatch<AppDispatch>();
  const toggleWishlist = useWishlistToggle();

  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const productData = await getProductById(id ?? "");
        if (!cancelled) {
          setProduct(productData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load product");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (id) {
      loadProduct();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  const inWishlist = id ? wishlistIds.includes(id) : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-text-secondary">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Product Not Found</h1>
          <p className="text-text-secondary mb-6">{error ?? "The product you're looking for doesn't exist or has been removed."}</p>
          <NavLink to="/browse" className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary-hover transition-colors">
            Browse Products
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NavLink>
        </div>
      </div>
    );
  }

  const relatedProducts: Product[] = [];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-text-secondary">
            <li>
              <NavLink to="/" className="hover:text-text-primary transition-colors">Home</NavLink>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <NavLink to="/browse" className="hover:text-text-primary transition-colors">Browse</NavLink>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-text-primary font-medium truncate max-w-[200px]" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="aspect-square rounded-xl overflow-hidden bg-surface-hover mb-4">
              <img
                src={product.image || PLACEHOLDER_IMAGE}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = PLACEHOLDER_IMAGE;
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-start gap-2 mb-4">
              {product.badge && (
                <Badge
                  variant={
                    product.badge === "sale" ? "danger" :
                    product.badge === "new" ? "primary" :
                    product.badge === "bestseller" ? "secondary" : "default"
                  }
                  size="md"
                >
                  {product.badge.charAt(0).toUpperCase() + product.badge.slice(1)}
                </Badge>
              )}
              {product.isFlashDeal && (
                <Badge variant="danger" size="md">Flash Deal</Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">{product.name}</h1>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 text-warning fill-current" aria-hidden="true" />
                <span className="text-lg font-medium text-text-primary">{product.rating.toFixed(1)}</span>
                <span className="text-text-muted">({product.reviewCount} reviews)</span>
              </div>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-text-primary">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-xl text-text-muted line-through">${product.originalPrice.toFixed(2)}</span>
              )}
            </div>

            <p className="text-text-secondary mb-8 leading-relaxed">{product.description}</p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center gap-4">
                <label htmlFor="quantity" className="text-sm font-medium text-text-primary">Quantity:</label>
                <div className="relative">
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    min={1}
                    max={99}
                    size="md"
                    className="w-24 text-center pr-10"
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      setQuantity(
                        Number.isFinite(next)
                          ? Math.min(99, Math.max(1, Math.floor(next)))
                          : 1,
                      );
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                variant="primary"
                size="lg"
                fullWidth={true}
                leftIcon={<ShoppingCart className="h-5 w-5" aria-hidden="true" />}
                onClick={() => dispatch(addToCart({ product, quantity }))}
              >
                Add to Cart
              </Button>
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-border text-text-secondary hover:bg-surface-hover hover:border-text-muted hover:text-accent transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                  aria-pressed={inWishlist}
                >
                  <Heart className={`h-5 w-5 transition-colors duration-200 ${inWishlist ? "fill-accent text-accent" : ""}`} aria-hidden="true" />
                  <span>{inWishlist ? "Saved" : "Save"}</span>
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3 mb-8">
              <div className="flex items-center gap-3 p-4 bg-surface rounded-lg border border-border">
                <Truck className="h-6 w-6 text-primary flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium text-text-primary">Free Shipping</p>
                  <p className="text-sm text-text-secondary">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-surface rounded-lg border border-border">
                <RotateCcw className="h-6 w-6 text-primary flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium text-text-primary">Easy Returns</p>
                  <p className="text-sm text-text-secondary">30-day return policy</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-surface rounded-lg border border-border">
                <Shield className="h-6 w-6 text-primary flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium text-text-primary">Secure Payment</p>
                  <p className="text-sm text-text-secondary">100% secure checkout</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section aria-labelledby="related-products-heading" className="mt-16">
            <div className="mb-8">
              <h2 id="related-products-heading" className="text-2xl font-bold text-text-primary">You May Also Like</h2>
            </div>
            <ProductGrid products={relatedProducts} title="You May Also Like" showViewAll={false} />
          </section>
        )}
      </div>
    </div>
  );
};
