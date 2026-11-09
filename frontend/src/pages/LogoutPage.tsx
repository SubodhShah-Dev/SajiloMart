import { useEffect } from "react";

import { useLogout } from "../hooks/useLogout";

export const LogoutPage = () => {
  const logout = useLogout();

  useEffect(() => {
    void logout();
  }, [logout]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <p className="text-text-secondary">Signing you out...</p>
    </div>
  );
};
