import { AlertCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { AdminModal } from "./AdminModal";
import { Button } from "../ui";

export interface AdminConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
}

const variantIcons = {
  danger: AlertCircle,
  warning: AlertTriangle,
  primary: ShieldCheck,
};

const variantIconColors = {
  danger: "text-accent",
  warning: "text-warning",
  primary: "text-primary",
};

export const AdminConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
}: AdminConfirmDialogProps) => {
  const Icon = variantIcons[variant];
  const iconColor = variantIconColors[variant];

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
      footer={
        <>
          <Button variant="outline" size="md" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            size="md"
            onClick={handleConfirm}
            isLoading={isLoading}
            disabled={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <div className={`flex-shrink-0 ${iconColor}`}>
          <Icon className="h-6 w-6 mt-0.5" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <p className="text-text-secondary">{message}</p>
        </div>
      </div>
    </AdminModal>
  );
};