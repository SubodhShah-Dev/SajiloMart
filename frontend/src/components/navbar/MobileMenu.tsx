import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { X, ShoppingBag, ShoppingCart, ChevronRight, User } from "lucide-react";
import { Button } from "../ui";

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact: boolean;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  cartCount?: number;
}

const navItems: NavItem[] = [
  { path: "/", label: "Home", icon: ShoppingBag, exact: true },
  { path: "/browse", label: "Browse", icon: ShoppingBag, exact: false },
];

export const MobileMenu = ({
  isOpen,
  onClose,
  cartCount = 0,
}: MobileMenuProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      drawerRef.current?.focus();
    } else {
      document.body.style.overflow = "";
      previousActiveElement.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (event: globalThis.KeyboardEvent) => {
        if (event.key === "Escape") {
          onClose();
        }
        if (event.key === "Tab") {
          const focusableElements = drawerRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements && focusableElements.length > 0) {
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            if (event.shiftKey && document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        id="mobile-menu"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile menu"
        className="fixed top-0 right-0 h-full w-full max-w-sm bg-surface z-50 flex flex-col animate-slide-down"
        tabIndex={-1}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <NavLink
            to="/"
            end
            onClick={onClose}
            className="flex items-center gap-2 text-text-primary"
            aria-label="SajiloMart Home"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-text-inverse">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <span className="font-bold text-xl tracking-tight">SajiloMart</span>
          </NavLink>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close menu"
            className="p-1"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4" aria-label="Mobile navigation">
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Shop
            </h2>
            <ul role="list" className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.exact}
                    onClick={onClose}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium
                      ${isActive
                        ? "bg-primary-light text-primary"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                      }
                      transition-colors duration-150
                    `}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    {item.label}
                    <ChevronRight className="h-4 w-4 ml-auto text-text-muted" aria-hidden="true" />
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Account
            </h2>
            <ul role="list" className="space-y-1">
              <li>
                <NavLink
                  to="/account"
                  onClick={onClose}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium
                    ${isActive
                      ? "bg-primary-light text-primary"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                    }
                    transition-colors duration-150
                  `}
                >
                  <User className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  Account
                  <ChevronRight className="h-4 w-4 ml-auto text-text-muted" aria-hidden="true" />
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-border">
            <NavLink
              to="/cart"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
            >
              <ShoppingCart className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="ml-auto px-2 py-0.5 bg-primary-light text-primary text-xs font-medium rounded-full">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
              <ChevronRight className="h-4 w-4 ml-auto text-text-muted" aria-hidden="true" />
            </NavLink>
          </div>
        </nav>

        <div className="p-4 border-t border-border">
          <p className="text-xs text-text-muted text-center">
            &copy; {new Date().getFullYear()} SajiloMart. All rights reserved.
          </p>
        </div>
      </aside>
    </>
  );
};