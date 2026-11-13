import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Shield } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

export const RequireAdmin = () => {
  const location = useLocation();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userRole = useSelector((state: RootState) => state.auth.user?.role ?? null);

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (userRole !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">Access Denied</h1>
          <p className="text-text-secondary mb-6">You don't have permission to access the admin dashboard.</p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  return <Outlet />;
};