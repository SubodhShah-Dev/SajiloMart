import { useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import { RequireAuth } from "./components/auth/RequireAuth";
import { RequireAdmin } from "./components/auth/RequireAdmin";
import { useAuthBootstrap } from "./hooks/useAuthBootstrap";
import { AdminPage } from "./pages/Admin";
import { CartPage } from "./pages/CartPage";
import Home from "./pages/Home";
import { LogoutPage } from "./pages/LogoutPage";
import NotFound from "./pages/NotFound";
import { OrdersPage } from "./pages/OrdersPage";
import { ProductDetailPage } from "./pages/product/ProductDetailPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SellerPage } from "./pages/seller/SellerPage";
import { SettingsPage } from "./pages/SettingsPage";
import { WishlistPage } from "./pages/WishlistPage";
import { AuthPage } from "./pages/auth";
import { BrowsePage } from "./pages/browse/BrowsePage";
import type { RootState } from "./store";
import { selectAuthStatus } from "./store/slices/authSlice";

const App = () => {
  useAuthBootstrap();
  const authStatus = useSelector((state: RootState) => selectAuthStatus(state));

  if (authStatus === "idle" || authStatus === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <p className="text-text-secondary">Loading SajiloMart...</p>
      </div>
    );
  }

  return (
    <div>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/store" element={<Navigate to="/browse" replace />} />
          <Route path="/products" element={<Navigate to="/browse" replace />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route
            path="/new-arrivals"
            element={<Navigate to="/browse?sort=newest" replace />}
          />
          <Route
            path="/deals"
            element={<Navigate to="/browse?sort=bestselling" replace />}
          />
          <Route path="/categories" element={<Navigate to="/browse" replace />} />
          <Route path="/shipping" element={<Navigate to="/browse" replace />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />

          <Route element={<RequireAuth />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/sell" element={<Navigate to="/seller" replace />} />
            <Route path="/seller" element={<SellerPage />} />
            <Route path="/seller/products" element={<SellerPage />} />
            <Route path="/seller/settings" element={<SellerPage />} />
            <Route
              path="/seller/onboarding"
              element={<Navigate to="/seller" replace />}
            />
          </Route>

          <Route element={<RequireAdmin />}>
            <Route path="/admin/*" element={<AdminPage />} />
          </Route>

          <Route path="/logout" element={<LogoutPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
