import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui";
import type { AppDispatch, RootState } from "../../store";
import { setCredentials, setPendingRedirect } from "../../store/slices/authSlice";
import { getApiBaseUrl, loginUser } from "../../services/api";
import { GoogleAuthButton } from "./GoogleAuthButton";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  showPassword: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm = ({ onSwitchToRegister }: LoginFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const pendingRedirect = useSelector((state: RootState) => state.auth.pendingRedirect);
  const [serverError, setServerError] = useState<string | null>(null);

  const from = (location.state as { from?: string })?.from || pendingRedirect || "/";

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { showPassword: false },
  });

  const showPassword = useWatch({ control, name: "showPassword" });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);

    try {
      const user = await loginUser({
        email: data.email,
        password: data.password,
      });

      dispatch(setCredentials(user));
      dispatch(setPendingRedirect(null));
      navigate(from, { replace: true });
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Unable to sign in.",
      );
    }
  };

  const handleGoogleClick = () => {
    window.location.href = `${getApiBaseUrl()}/api/auth/google`;
  };

  return (
    <Card variant="outlined" padding="none" className="w-full max-w-md">
      <CardHeader className="p-6 pb-0">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {serverError && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm text-accent"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{serverError}</span>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
            autoComplete="email"
            required
          />

          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
            rightIcon={
              <button
                type="button"
                onClick={() => setValue("showPassword", !showPassword, { shouldValidate: false })}
                className="text-text-muted hover:text-text-primary"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            }
            autoComplete="current-password"
            required
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-border text-primary focus-visible:ring-primary" />
              <span className="text-sm text-text-secondary">Remember me</span>
            </label>
            <a href="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </a>
          </div>

          <Button type="submit" fullWidth isLoading={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-surface px-2 text-text-muted">Or continue with</span>
          </div>
        </div>

        <GoogleAuthButton onClick={handleGoogleClick} />
      </CardContent>
      <CardFooter className="p-6 pt-0 flex justify-center">
        <p className="text-sm text-text-secondary">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-primary font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
          >
            Register
          </button>
        </p>
      </CardFooter>
    </Card>
  );
};
