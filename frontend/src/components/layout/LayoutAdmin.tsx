import { NavLink, Outlet } from "react-router-dom";
import { Home, Shield, LogOut } from "lucide-react";
import { useSelector } from "react-redux";
import { Button } from "../ui";
import type { RootState } from "../../store";
import { useLogout } from "../../hooks/useLogout";
import { AdminToastProvider } from "../admin";

export const LayoutAdmin = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const logout = useLogout();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar - full width */}
      <header className="sticky top-0 z-30 bg-background border-b border-border flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Shield className="h-6 w-6 shrink-0 text-primary" />
          <h1 className="truncate text-lg font-bold text-text-primary md:text-xl">
            Admin Dashboard
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          {/* Back to storefront */}
          <NavLink
            to="/"
            aria-label="Back to SajiloMart storefront"
            title="Back to SajiloMart storefront"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors duration-200 ease-in-out hover:bg-surface-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Home className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Storefront</span>
          </NavLink>
          {/* User identity group */}
          <div className="hidden items-center gap-2 rounded-lg border border-surface-hover bg-surface/50 px-3 py-1.5 md:flex">
            <span className="w-2 h-2 rounded-full bg-success"></span>
            <p className="hidden sm:block text-sm font-medium text-text-primary">{user?.name}</p>
            <span className="hidden sm:block text-[10px] text-text-muted uppercase tracking-wider">{user?.role}</span>
          </div>
          {/* Signout action - matches the group styling */}
          <Button
            variant="outline"
            size="sm"
            className="whitespace-nowrap"
            onClick={() => {
              if (window.confirm("Are you sure you want to sign out?")) {
                logout();
              }
            }}
            leftIcon={<LogOut className="h-4 w-4" />}
          >
            Sign out
          </Button>
        </div>
      </header>

      {/* Main content - full width */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        <AdminToastProvider>
          <Outlet />
        </AdminToastProvider>
      </main>
    </div>
  );
};

export default LayoutAdmin;
