import { useState, type FormEvent } from "react";
import { Mail, Check, Loader2 } from "lucide-react";
import { Input, Button } from "../../components/ui";

export const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-primary text-text-inverse" aria-labelledby="newsletter-heading">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6">
            <Mail className="h-12 w-12 mx-auto text-primary-light mb-4" aria-hidden="true" />
            <h2 id="newsletter-heading" className="text-2xl sm:text-3xl font-bold mb-2">
              Stay Updated
            </h2>
            <p className="text-primary-light">
              Subscribe to our newsletter for exclusive offers, new arrivals, and updates.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="flex flex-col sm:flex-row gap-3">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <Input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={status === "submitting" || status === "success"}
                className="flex-1"
                aria-describedby={status === "error" ? "newsletter-error" : status === "success" ? "newsletter-success" : undefined}
              />
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                disabled={status === "submitting" || status === "success"}
                className="whitespace-nowrap"
              >
                {status === "submitting" && (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                    <span>Subscribing...</span>
                  </>
                )}
                {status === "success" && (
                  <>
                    <Check className="h-5 w-5" aria-hidden="true" />
                    <span>Subscribed!</span>
                  </>
                )}
                {status === "idle" && "Subscribe"}
                {status === "error" && "Try Again"}
              </Button>
            </div>

            {status === "error" && (
              <p id="newsletter-error" className="text-sm text-secondary text-left flex items-center justify-center gap-1" role="alert">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errorMessage}
              </p>
            )}

            {status === "success" && (
              <p id="newsletter-success" className="text-sm text-secondary/80 text-left flex items-center justify-center gap-1" role="status">
                <Check className="h-4 w-4" aria-hidden="true" />
                Thanks for subscribing! Check your inbox for a welcome offer.
              </p>
            )}

            <p className="text-xs text-primary-light/70">
              By subscribing, you agree to our{" "}
              <a href="/privacy" className="underline hover:text-text-inverse">Privacy Policy</a>
              {" "}and{" "}
              <a href="/terms" className="underline hover:text-text-inverse">Terms of Service</a>
              . Unsubscribe anytime.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};