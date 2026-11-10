import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  User,
  LogIn,
  LogOut,
  Heart,
  Package,
  Settings,
  ChevronDown,
  Store,
} from "lucide-react";
import { Button } from "../ui";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

interface MenuItem {
  label: string;
  to?: string;
  icon: React.ComponentType<{ className?: string }>;
  isLogout?: boolean;
}

interface UserMenuProps {
  isAuthenticated?: boolean;
  userName?: string;
  className?: string;
}

const guestItems: MenuItem[] = [
  { label: "Login", to: "/login", icon: LogIn },
  { label: "Register", to: "/register", icon: User },
];

const authItems: MenuItem[] = [
  { label: "My Profile", to: "/profile", icon: User },
  { label: "My Orders", to: "/orders", icon: Package },
  { label: "Wishlist", to: "/wishlist", icon: Heart },
  { label: "Settings", to: "/settings", icon: Settings },
  { label: "Logout", to: "/logout", icon: LogOut, isLogout: true },
];

const vendorItems: MenuItem[] = [
  { label: "Seller Dashboard", to: "/seller", icon: Store },
];

export const UserMenu = ({
  isAuthenticated = false,
  userName = "User",
  className = "",
}: UserMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const userRole = useSelector((state: RootState) => state.auth.user?.role ?? null);

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        if (
          menuRef.current &&
          !menuRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case "Escape":
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      case "ArrowDown":
        event.preventDefault();
        setIsOpen(true);
        break;
      case "Tab":
        if (!event.shiftKey) {
          setIsOpen(false);
        }
        break;
    }
  };

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  };

  const getItems = () => {
    if (!isAuthenticated) return guestItems;
    if (userRole === "VENDOR" || userRole === "ADMIN") {
      return [...authItems, ...vendorItems];
    }
    return authItems;
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="md"
        leftIcon={<User className="h-5 w-5" aria-hidden="true" />}
        rightIcon={<ChevronDown className="h-4 w-4" aria-hidden="true" />}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={
          isAuthenticated ? `Account menu for ${userName}` : "Account menu"
        }
      >
        {isAuthenticated ? (
          <>
            <span className="hidden sm:block truncate max-w-[120px]">
              {userName}
            </span>
            <span className="sm:hidden" aria-hidden="true">
              Account
            </span>
          </>
        ) : (
          "Account"
        )}
      </Button>

      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute right-0 mt-2 w-56 bg-surface rounded-lg shadow-xl border border-border py-1 animate-slide-down z-50"
          onKeyDown={handleMenuKeyDown}
        >
          {isAuthenticated && (
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-medium text-text-primary truncate">
                {userName}
              </p>
              <p className="text-xs text-text-muted truncate">
                {location.pathname}
              </p>
            </div>
          )}
          <nav
            aria-label={isAuthenticated ? "Account options" : "Guest options"}
          >
            <ul role="list" className="py-1">
              {getItems().map((item) => (
                <li key={item.label}>
                  {item.isLogout ? (
                    <NavLink
                      to={item.to as string}
                      role="menuitem"
                      onClick={() => setIsOpen(false)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-2.5 text-sm text-accent hover:bg-accent/10
                        focus-visible:outline-none focus-visible:bg-accent/10
                        transition-colors duration-150
                      `}
                    >
                      <item.icon
                        className="h-5 w-5 flex-shrink-0"
                        aria-hidden="true"
                      />
                      {item.label}
                    </NavLink>
                  ) : (
                    <NavLink
                      to={item.to as string}
                      end
                      role="menuitem"
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-4 py-2.5 text-sm
                        ${
                          isActive
                            ? "bg-primary-light text-primary font-medium"
                            : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                        }
                        focus-visible:outline-none focus-visible:bg-primary-light focus-visible:text-primary
                        transition-colors duration-150
                      `}
                    >
                      <item.icon
                        className="h-5 w-5 flex-shrink-0"
                        aria-hidden="true"
                      />
                      {item.label}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};
