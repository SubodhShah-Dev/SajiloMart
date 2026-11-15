import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Button } from "../ui";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastColors = {
  success: "border-l-4 border-success bg-success/5 text-success",
  error: "border-l-4 border-accent bg-accent/5 text-accent",
  warning: "border-l-4 border-warning bg-warning/5 text-warning",
  info: "border-l-4 border-primary bg-primary/5 text-primary",
};

const toastIconColors = {
  success: "text-success",
  error: "text-accent",
  warning: "text-warning",
  info: "text-primary",
};

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const Toast = ({ toast, onClose }: ToastProps) => {
  const [isExiting, setIsExiting] = useState(false);

  const Icon = toastIcons[toast.type];
  const colorClass = toastColors[toast.type];
  const iconColorClass = toastIconColors[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(toast.id), 200);
    }, toast.duration ?? 5000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  return createPortal(
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg shadow-xl border
        transform transition-all duration-300 ease-in-out
        animate-in slide-in-from-right-full
        ${isExiting ? "animate-out fade-out slide-out-to-right-full" : ""}
        ${colorClass}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className={`flex-shrink-0 ${iconColorClass}`}>
        <Icon className="h-5 w-5 mt-0.5" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary">{toast.title}</p>
        {toast.message && (
          <p className="mt-1 text-sm text-text-secondary">{toast.message}</p>
        )}
        {toast.action && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-sm"
            onClick={() => {
              toast.action?.onClick();
              onClose(toast.id);
            }}
          >
            {toast.action.label}
          </Button>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="flex-shrink-0 p-1 text-text-muted hover:text-text-primary"
        onClick={() => onClose(toast.id)}
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>,
    document.getElementById("toast-portal") ?? document.body
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  if (toasts.length === 0) return null;

  return (
    <div id="toast-portal" className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm sm:max-w-md pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};