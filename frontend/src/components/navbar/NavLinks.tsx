import { NavLink } from "react-router-dom";

interface NavLinksProps {
  className?: string;
}

const navItems = [
  { path: "/", label: "Home", exact: true },
  { path: "/browse", label: "Browse", exact: false },
  { path: "/sell", label: "Sell", exact: false },
];

export const NavLinks = ({ className = "" }: NavLinksProps) => {
  return (
    <nav className={`flex items-center gap-1 md:gap-4 ${className}`} aria-label="Main navigation">
      <ul className="flex items-center gap-1 md:gap-2" role="list">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `
                px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                ${isActive
                  ? "bg-primary-light text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                }
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
              `}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};