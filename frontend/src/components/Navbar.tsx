import { Menu } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../store";
import { Logo } from "./navbar/Logo";
import { SearchBar } from "./navbar/SearchBar";
import { NavLinks } from "./navbar/NavLinks";
import { UserMenu } from "./navbar/UserMenu";
import { CartIcon } from "./navbar/CartIcon";
import { MobileMenu } from "./navbar/MobileMenu";
import { useMobileMenu } from "../hooks/useMobileMenu";

export const Navbar = () => {
  const { isOpen, close, toggle } = useMobileMenu();
  const navigate = useNavigate();
  const cartCount = useSelector((state: RootState) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userName = useSelector((state: RootState) => state.auth.user?.name ?? "User");

  const handleSearch = (query: string) => {
    navigate(`/browse?search=${encodeURIComponent(query)}`);
    close();
  };

  return (
    <>
      <header role="banner" className="sticky top-0 z-30 bg-surface/95 backdrop-blur-sm border-b border-border">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Logo />

              <button
                type="button"
                className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={toggle}
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
                aria-label={isOpen ? "Close menu" : "Open menu"}
              >
                {isOpen ? (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>

              <div className="hidden md:block w-full max-w-xl">
                <SearchBar onSearch={handleSearch} />
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4 shrink-0">
              <NavLinks className="hidden md:flex" />

              <CartIcon count={cartCount} />

              <UserMenu isAuthenticated={isAuthenticated} userName={userName} />
            </div>
          </div>
        </div>

        <div className="md:hidden border-t border-border">
          <div className="mx-auto max-w-screen-2xl px-4 py-3">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isOpen}
        onClose={close}
        cartCount={cartCount}
      />
    </>
  );
};

export default Navbar;
