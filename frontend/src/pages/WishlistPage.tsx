import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Heart, Trash2, ShoppingCart, Share2 } from "lucide-react";
import { Button, Card, CardContent } from "../components/ui";
import { ProductCard } from "../components/product/ProductCard";
import type { Product } from "../services/api";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import {
  clearWishlistRemote,
  selectWishlistError,
  selectWishlistItems,
  selectWishlistStatus,
} from "../store/slices/wishlistSlice";
import { useWishlistToggle } from "../hooks/useWishlistToggle";
import { addToCart } from "../store/slices/cartSlice";

export const WishlistPage = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const wishlistProducts = useSelector((state: RootState) => selectWishlistItems(state));
  const wishlistError = useSelector((state: RootState) => selectWishlistError(state));
  const wishlistStatus = useSelector((state: RootState) => selectWishlistStatus(state));
  const dispatch = useDispatch<AppDispatch>();
  const toggleWishlist = useWishlistToggle();
  const [isClearing, setIsClearing] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);

  const handleRemove = (product: Product) => {
    toggleWishlist(product);
  };

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({ product }));
  };

  const handleClear = async () => {
    setClearError(null);
    setIsClearing(true);

    try {
      await dispatch(clearWishlistRemote()).unwrap();
    } catch (error) {
      setClearError(
        typeof error === "string"
          ? error
          : "Unable to clear your wishlist. Please try again.",
      );
    } finally {
      setIsClearing(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      void navigator.share({
        title: "My Wishlist on SajiloMart",
        text: `Check out my wishlist with ${wishlistProducts.length} items!`,
        url: window.location.href,
      });
    } else {
      void navigator.clipboard.writeText(window.location.href);
      alert("Wishlist link copied to clipboard!");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Sign In to View Wishlist</h2>
          <p className="text-text-secondary mb-6">Your wishlist is saved to your account. Sign in to access it from any device.</p>
          <NavLink to="/login" className="inline-flex items-center gap-2">
            <Button variant="primary" size="lg">Sign In</Button>
          </NavLink>
        </div>
      </div>
    );
  }

  const errorMessage = clearError ?? wishlistError;
  const isLoading =
    wishlistStatus === "idle" || wishlistStatus === "loading";

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">My Wishlist</h1>
            <p className="text-text-secondary">
              {isLoading
                ? "Loading…"
                : `${wishlistProducts.length} ${wishlistProducts.length === 1 ? "item" : "items"} saved`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" leftIcon={<Share2 className="h-4 w-4" aria-hidden="true" />} onClick={handleShare}>
              Share
            </Button>
          </div>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm text-accent"
          >
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <Card variant="outlined">
            <CardContent className="p-12 text-center">
              <p className="text-text-secondary">Loading your wishlist…</p>
            </CardContent>
          </Card>
        ) : wishlistProducts.length === 0 ? (
          <Card variant="outlined">
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 text-text-muted mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-text-primary mb-2">Your Wishlist is Empty</h2>
              <p className="text-text-secondary mb-6">Save products you love and buy them later.</p>
              <NavLink to="/browse">
                <Button variant="primary" leftIcon={<Heart className="h-4 w-4" aria-hidden="true" />}>
                  Start Shopping
                </Button>
              </NavLink>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" role="list" aria-label="Wishlist items">
              {wishlistProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isAuthenticated={true}
                  inWishlist={true}
                  onToggleWishlist={handleRemove}
                />
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-text-secondary">
                  {wishlistProducts.length} {wishlistProducts.length === 1 ? "item" : "items"} in your wishlist
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" fullWidth leftIcon={<ShoppingCart className="h-4 w-4" aria-hidden="true" />} onClick={() => wishlistProducts.forEach(handleAddToCart)}>
                    Add All to Cart
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    isLoading={isClearing}
                    leftIcon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
                    onClick={() => void handleClear()}
                  >
                    Clear Wishlist
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
