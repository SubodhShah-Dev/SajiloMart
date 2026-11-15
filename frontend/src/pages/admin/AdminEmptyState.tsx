import { Search, Package, Filter, Store } from "lucide-react";
import { Button } from "../../components/ui";

interface AdminEmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: "default" | "search" | "filter";
}

const variantIcons = {
  default: Store,
  search: Search,
  filter: Filter,
};

const variantMessages = {
  default: "No stores found. Get started by creating your first store.",
  search: 'No stores match your search. Try adjusting your search terms.',
  filter: "No stores match the current filters. Try clearing some filters.",
};

export const AdminEmptyState = ({
  title,
  message,
  icon,
  action,
  variant = "default",
}: AdminEmptyStateProps) => {
  const Icon = variantIcons[variant];
  const defaultMessage = variantMessages[variant];

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="p-4 bg-surface border border-border rounded-full mb-4">
        {icon || <Icon className="h-10 w-10 text-text-muted" aria-hidden="true" />}
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-text-secondary max-w-sm mb-6">{message || defaultMessage}</p>
      {action && (
        <Button variant="primary" leftIcon={<Package className="h-4 w-4" aria-hidden="true" />} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};