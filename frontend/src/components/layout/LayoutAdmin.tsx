import { NavLink, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  TrendingUp,
  Settings,
  Shield,
  LogOut,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "../ui";
import type { RootState } from "../../store";
import { useLogout } from "../../hooks/useLogout";

interface SidebarItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sidebarItems: SidebarItem[] = [
  { label: "Stores", to: "/admin", icon: LayoutDashboard },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Products", to: "/admin/products", icon: Package },
  { label: "Orders", to: "/admin/orders", icon: TrendingUp },
  { label: "Analytics", to: "/admin/analytics", icon: TrendingUp },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

export const LayoutAdmin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);
  const logout = useLogout();

  const isActive = (to: string) => location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:relative md:shadow-none md:border-r`}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-sm font-bold text-text-primary tracking-tight uppercase">Admin</span>
          </div>
          <button className="md:hidden p-2 text-text-secondary hover:text-text-primary" onClick={() => setSidebarOpen(false)}>
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1" aria-label="Admin navigation">
          {sidebarItems.map((item) => {
            return (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.label === "Stores"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-primary-light text-primary"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                  }`
                }
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto p-6 border-t border-border">
          <div className="px-2 py-1">
            <p className="text-xs font-medium text-text-primary">{user?.name}</p>
            <p className="text-xs text-text-muted truncate">{user?.email}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">{user?.role}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => logout()}
            className="w-full"
            leftIcon={<LogOut className="h-4 w-4" />}
          >
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={`flex-1 transition-all duration-300 md:pl-64 ${
          sidebarOpen ? "pl-0 md:pl-0" : ""
        }`}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background border-b border-border flex items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 text-text-secondary hover:text-text-primary"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold text-text-primary">
              {sidebarItems.find((i) => isActive(i.to))?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-sm text-text-muted">{user?.role}</span>
            <span className="w-2 h-2 rounded-full bg-success"></span>
            <p className="hidden sm:block text-sm text-text-primary">{user?.name}</p>
          </div>
        </header>

        <main className="p-4 md:p-8"><Outlet /></main>
      </div>
    </div>
  );
};

export default LayoutAdmin;
