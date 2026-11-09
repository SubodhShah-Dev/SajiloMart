import { Button } from "../ui";
import { Mail } from "lucide-react";

interface GoogleAuthButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const GoogleAuthButton = ({
  onClick,
  disabled = false,
  className = "",
}: GoogleAuthButtonProps) => {
  return (
    <Button
      type="button"
      variant="outline"
      fullWidth
      leftIcon={<Mail className="h-5 w-5" aria-hidden="true" />}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      Continue with Google
    </Button>
  );
};