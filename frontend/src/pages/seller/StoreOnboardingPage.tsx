import { useEffect } from "react";
import { Shield, Store, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Button, Card, CardHeader, CardTitle, CardContent } from "../../components/ui";
import { OnboardingStepper } from "../../components/seller/OnboardingStepper";
import { StoreForm } from "../../components/seller/StoreForm";
import { VendorApplicationForm } from "../../components/seller/VendorApplicationForm";
import { useStoreOnboarding } from "../../hooks/useStoreOnboarding";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { updateUserRole } from "../../store/slices/authSlice";

export const StoreOnboardingPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);
  const userRole = useSelector((state: RootState) => state.auth.user?.role ?? null);

  const {
    onboardingData,
    currentStep,
    submitted,
    approvalStatus,
    isVendor,
    updateStepData,
    goToNextStep,
    goToPrevStep,
    reset,
    updateVendorStatus,
    updateApprovalStatus,
  } = useStoreOnboarding();

  // Mock: simulate user becoming vendor after approval
  useEffect(() => {
    if (approvalStatus === "approved" && !isVendor) {
      updateVendorStatus(true);
      if (user) {
        dispatch(updateUserRole("VENDOR"));
      }
    }
  }, [approvalStatus, isVendor, user, updateVendorStatus, dispatch]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <Clock className="h-12 w-12 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Sign in to continue</h2>
          <p className="text-text-secondary mb-6">You need an account to apply as a vendor.</p>
          <a href="/login">
            <Button variant="primary">Sign In</Button>
          </a>
        </div>
      </div>
    );
  }

  // Show vendor application form for non-vendors
  if (!isVendor && userRole !== "VENDOR") {
    return (
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-10">
            <Store className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-text-primary mb-2">Sell on SajiloMart</h1>
            <p className="text-lg text-text-secondary">
              Join thousands of sellers and grow your business on our marketplace.
            </p>
          </div>

          <Card variant="outlined" className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">Why Sell With Us?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center p-4">
                  <Shield className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="font-medium text-text-primary mb-1">Secure Platform</h3>
                  <p className="text-sm text-text-secondary">Protected payments and seller protection</p>
                </div>
                <div className="text-center p-4">
                  <Store className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="font-medium text-text-primary mb-1">Global Reach</h3>
                  <p className="text-sm text-text-secondary">Access to millions of customers</p>
                </div>
                <div className="text-center p-4">
                  <CheckCircle className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="font-medium text-text-primary mb-1">Easy Setup</h3>
                  <p className="text-sm text-text-secondary">Start selling in minutes with our tools</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <VendorApplicationForm
            onSubmit={(data) => {
              console.log("Application submitted:", data);
              updateApprovalStatus("pending");
              alert("Application submitted! Our team will review it within 3-5 business days.");
            }}
          />
        </div>
      </div>
    );
  }

  // Show onboarding for vendors
  if (submitted) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {approvalStatus === "pending" && (
            <>
              <Clock className="h-16 w-16 text-warning mx-auto mb-4 animate-pulse" />
              <h1 className="text-3xl font-bold text-text-primary mb-2">Application Submitted</h1>
              <p className="text-lg text-text-secondary mb-8">
                Your store application is under review. We'll notify you once approved.
              </p>
              <div className="space-y-4 text-left max-w-md mx-auto">
                <div className="flex items-center gap-3 p-4 bg-surface rounded-lg border border-border">
                  <Clock className="h-6 w-6 text-warning flex-shrink-0" />
                  <div>
                    <p className="font-medium text-text-primary">Under Review</p>
                    <p className="text-sm text-text-secondary">Our team is reviewing your application</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-surface rounded-lg border border-border opacity-50">
                  <Shield className="h-6 w-6 text-text-muted flex-shrink-0" />
                  <div>
                    <p className="font-medium text-text-secondary">Approval</p>
                    <p className="text-sm text-text-muted">You'll receive an email notification</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-surface rounded-lg border border-border opacity-50">
                  <Store className="h-6 w-6 text-text-muted flex-shrink-0" />
                  <div>
                    <p className="font-medium text-text-secondary">Go Live</p>
                    <p className="text-sm text-text-muted">Start selling once approved</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {approvalStatus === "approved" && (
            <>
              <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-text-primary mb-2">Congratulations!</h1>
              <p className="text-lg text-text-secondary mb-8">
                Your store has been approved. You can now start adding products and selling.
              </p>
              <Button variant="primary" size="lg" onClick={reset} className="w-full max-w-xs">
                Go to Seller Dashboard
              </Button>
            </>
          )}

          {approvalStatus === "rejected" && (
            <>
              <AlertCircle className="h-16 w-16 text-accent mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-text-primary mb-2">Application Not Approved</h1>
              <p className="text-lg text-text-secondary mb-8">
                Unfortunately, your application was not approved at this time. Please review our guidelines and try again.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={reset}>
                  Try Again
                </Button>
                <Button variant="primary" onClick={() => alert("Contact support")}>
                  Contact Support
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <OnboardingStepper currentStep={currentStep} />
        </div>

        <Card variant="outlined">
          <CardContent className="p-6">
            <StoreForm
              currentStep={currentStep}
              onSubmit={updateStepData}
              onNext={goToNextStep}
              onPrev={goToPrevStep}
              initialData={onboardingData}
            />
          </CardContent>
        </Card>

        {currentStep === 3 && (
          <div className="mt-6 p-4 bg-primary-light border border-primary/20 rounded-lg">
            <p className="text-sm text-primary flex items-center gap-2">
              <Shield className="h-4 w-4 flex-shrink-0" />
              By submitting, you agree to our <a href="/terms" className="underline hover:text-primary-hover">Seller Terms</a> and <a href="/privacy" className="underline hover:text-primary-hover">Privacy Policy</a>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};