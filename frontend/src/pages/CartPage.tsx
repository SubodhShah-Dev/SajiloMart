import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowLeft, CreditCard } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Input } from "../components/ui";
import type { CartItem } from "../store/slices/cartSlice";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { updateQuantity, removeFromCart, clearCart, setCart } from "../store/slices/cartSlice";
import { getCart, updateCartQty, removeCartItem, clearCart as apiClearCart } from "../services/api";
import { selectIsAuthenticated } from "../store/slices/authSlice";

export const CartPage = () => {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(true);

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal >= 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Fetch cart on mount for authenticated users
  useEffect(() => {
    let mounted = true;

    const fetchCart = async () => {
      if (!isAuthenticated) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const cart = await getCart();
        if (mounted && cart.items?.length) {
          dispatch(setCart(cart.items));
        }
      } catch {
        // Failed to fetch cart, keep local state
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCart();

    return () => {
      mounted = false;
    };
  }, [dispatch, isAuthenticated]);

  const handleQuantityChange = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemove(productId);
      return;
    }

    // Optimistic update
    dispatch(updateQuantity({ productId, quantity }));

    if (isAuthenticated) {
      try {
        await updateCartQty(productId, { quantity });
      } catch (error) {
        // Revert on error - fetch fresh cart
        const message = error instanceof Error ? error.message : "Failed to update quantity";
        console.error(message);
        try {
          const cart = await getCart();
          if (cart.items?.length) {
            dispatch(setCart(cart.items));
          }
        } catch {
          // Keep optimistic update if fetch also fails
        }
      }
    }
  };

  const handleRemove = async (productId: string) => {
    // Optimistic update
    dispatch(removeFromCart(productId));

    if (isAuthenticated) {
      try {
        await removeCartItem(productId);
      } catch (error) {
        // Revert on error - fetch fresh cart
        const message = error instanceof Error ? error.message : "Failed to remove item";
        console.error(message);
        try {
          const cart = await getCart();
          if (cart.items?.length) {
            dispatch(setCart(cart.items));
          }
        } catch {
          // Keep optimistic update if fetch also fails
        }
      }
    }
  };

  const handleClearCart = async () => {
    // Optimistic update
    dispatch(clearCart());

    if (isAuthenticated) {
      try {
        await apiClearCart();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to clear cart";
        console.error(message);
        try {
          const cart = await getCart();
          if (cart.items?.length) {
            dispatch(setCart(cart.items));
          }
        } catch {
          // Keep optimistic update if fetch also fails
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-8 w-20 h-20 rounded-full bg-surface flex items-center justify-center">
            <svg className="h-10 w-10 text-text-muted animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-lg text-text-secondary">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-8 w-20 h-20 rounded-full bg-surface flex items-center justify-center">
            <svg className="h-10 w-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-4">Sign In to View Cart</h1>
          <p className="text-lg text-text-secondary mb-8">You need to be signed in to view and manage your cart.</p>
          <NavLink to="/auth" className="inline-flex items-center gap-2">
            <Button variant="primary" size="lg">
              Sign In
            </Button>
          </NavLink>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-8 w-20 h-20 rounded-full bg-surface flex items-center justify-center">
            <svg className="h-10 w-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-4">Your Cart is Empty</h1>
          <p className="text-lg text-text-secondary mb-8">Looks like you haven't added any products yet.</p>
          <NavLink to="/browse" className="inline-flex items-center gap-2">
            <Button variant="primary" size="lg" leftIcon={<ArrowLeft className="h-5 w-5" aria-hidden="true" />}>
              Continue Shopping
            </Button>
          </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Shopping Cart</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card variant="outlined">
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {cartItems.map((item: CartItem) => (
                    <div key={item.product.id} className="flex gap-4 p-6">
                      <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-surface-hover">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-medium text-text-primary line-clamp-2">{item.product.name}</h3>
                            <p className="text-sm text-text-secondary mt-1">Category: {item.product.category}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemove(item.product.id)}
                            className="text-text-muted hover:text-accent transition-colors p-1"
                            aria-label={`Remove ${item.product.name} from cart`}
                          >
                            <Trash2 className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                            <label htmlFor={`quantity-${item.product.id}`} className="sr-only">Quantity</label>
                            <div className="flex items-center border border-border rounded-lg overflow-hidden">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-4 w-4" aria-hidden="true" />
                              </button>
                              <Input
                                id={`quantity-${item.product.id}`}
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.product.id, parseInt(e.target.value) || 1)}
                                min={1}
                                max={99}
                                className="w-16 text-center border-0 focus-visible:ring-0 py-1.5"
                                size="sm"
                              />
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                                className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-4 w-4" aria-hidden="true" />
                              </button>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-bold text-text-primary">${(item.product.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-end">
              <Button variant="ghost" onClick={handleClearCart} className="text-accent hover:text-accent-hover">
                Clear Cart
              </Button>
            </div>
          </div>

          <div>
            <Card variant="outlined" className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Subtotal</span>
                    <span className="font-medium text-text-primary">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Shipping</span>
                    <span className="font-medium text-text-primary">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-text-muted">Add ${(50 - subtotal).toFixed(2)} more for free shipping!</p>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Estimated Tax (8%)</span>
                    <span className="font-medium text-text-primary">${tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-text-primary">Total</span>
                    <span className="text-text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  leftIcon={<CreditCard className="h-5 w-5" aria-hidden="true" />}
                >
                  Proceed to Checkout
                </Button>

                <p className="text-xs text-text-muted text-center">
                  Secure checkout powered by SajiloMart
                </p>

                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  <Badge variant="outline" size="sm" dot>Secure</Badge>
                  <Badge variant="outline" size="sm" dot>Encrypted</Badge>
                  <Badge variant="outline" size="sm" dot>Protected</Badge>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6">
              <NavLink to="/browse" className="inline-flex items-center justify-center gap-2 w-full">
                <Button variant="outline" fullWidth leftIcon={<ArrowLeft className="h-5 w-5" aria-hidden="true" />}>
                  Continue Shopping
                </Button>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};