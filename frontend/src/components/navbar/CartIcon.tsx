import { NavLink } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Badge } from "../ui";

interface CartIconProps {
  count?: number;
  className?: string;
}

export const CartIcon = ({ count = 0, className = "" }: CartIconProps) => {
  const displayCount = count > 99 ? "99+" : count.toString();
  const showBadge = count > 0;

  return (
    <NavLink
      to="/cart"
      className={`
        relative p-2 rounded-lg text-text-secondary
        hover:text-text-primary hover:bg-surface-hover
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        transition-colors duration-200
        ${className}
      `}
      aria-label={count > 0 ? `Shopping cart with ${count} items` : "Shopping cart"}
    >
      <ShoppingCart className="h-6 w-6" aria-hidden="true" />
      {showBadge && (
        <Badge
          variant="danger"
          size="sm"
          className="absolute -top-1 -right-1 min-w-[18px] h-5 px-1.5"
        >
          {displayCount}
        </Badge>
      )}
    </NavLink>
  );
};