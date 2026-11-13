import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { LoginForm } from "../../components/auth/LoginForm";
import { RegisterForm } from "../../components/auth/RegisterForm";
import type { RootState, AppDispatch } from "../../store";
import { setAuthMode, setPendingRedirect } from "../../store/slices/authSlice";

export const AuthPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const authMode = useSelector((state: RootState) => state.auth.authMode);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [searchParams] = useSearchParams();
  const oauthError = searchParams.get("error");

  const oauthErrorMessages: Record<string, string> = {
    google_oauth_denied: "Google sign-in was cancelled.",
    invalid_state: "Google sign-in could not be verified. Please try again.",
    missing_code: "Google did not return an authorization code.",
    oauth_not_configured: "Google sign-in is not configured.",
    no_email: "Your Google account does not expose an email address.",
    email_not_verified: "Please verify your Google email address first.",
    account_inactive: "This account is not active.",
    account_exists_use_password:
      "An account with this email already exists. Sign in with your password instead.",
    google_oauth_failed: "Google sign-in failed. Please try again.",
  };

  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: string })?.from || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, location, navigate]);

  const handleSwitchMode = (mode: "login" | "register") => {
    dispatch(setAuthMode(mode));
  };

  const from = (location.state as { from?: string })?.from || "/";

  useEffect(() => {
    dispatch(setPendingRedirect(from));
  }, [dispatch, from]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {oauthError && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm text-accent"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {oauthErrorMessages[oauthError] ??
                "Sign-in failed. Please try again."}
            </span>
          </div>
        )}
        <div className="mb-8 flex justify-center">
          <nav aria-label="Auth tabs" role="tablist" className="flex bg-border p-1 rounded-lg w-full max-w-xs">
            <button
              role="tab"
              aria-selected={authMode === "login"}
              onClick={() => handleSwitchMode("login")}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                authMode === "login"
                  ? "bg-white text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Login
            </button>
            <button
              role="tab"
              aria-selected={authMode === "register"}
              onClick={() => handleSwitchMode("register")}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                authMode === "register"
                  ? "bg-white text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Register
            </button>
          </nav>
        </div>

        {authMode === "login" ? (
          <LoginForm onSwitchToRegister={() => handleSwitchMode("register")} />
        ) : (
          <RegisterForm onSwitchToLogin={() => handleSwitchMode("login")} />
        )}
      </div>
    </div>
  );
};
