import { NavLink } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className = "" }: LogoProps) => {
  return (
    <NavLink
      to="/"
      end
      className={`
        flex items-center gap-2 text-text-primary hover:text-primary transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md
        ${className}
      `}
      aria-label="SajiloMart Home"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-text-inverse" aria-hidden="true">
        <ShoppingBag className="h-5 w-5" />
      </span>
      <span className="font-bold text-xl tracking-tight hidden sm:block">SajiloMart</span>
      <span className="font-bold text-xl tracking-tight sm:hidden">SM</span>
    </NavLink>
  );
};