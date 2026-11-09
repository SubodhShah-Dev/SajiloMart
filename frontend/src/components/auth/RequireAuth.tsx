import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import type { RootState } from "../../store";
import {
  selectAuthStatus,
  selectIsAuthenticated,
} from "../../store/slices/authSlice";

export const RequireAuth = () => {
  const location = useLocation();
  const status = useSelector((state: RootState) => selectAuthStatus(state));
  const isAuthenticated = useSelector((state: RootState) =>
    selectIsAuthenticated(state),
  );

  if (status === "idle" || status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <p className="text-text-secondary">Checking your session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <Outlet />;
};
