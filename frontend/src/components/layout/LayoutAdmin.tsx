import { Outlet } from "react-router-dom";
import { Shield, LogOut } from "lucide-react";
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
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-bold text-text-primary md:text-xl">
            Admin Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {/* User identity group */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs text-text-muted">{user?.role}</span>
            <span className="w-2 h-2 rounded-full bg-success"></span>
            <p className="hidden sm:block text-sm font-medium text-text-primary">{user?.name}</p>
          </div>
          {/* Signout action - separated from identity group */}
          <Button
            variant="danger"
            size="sm"
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
