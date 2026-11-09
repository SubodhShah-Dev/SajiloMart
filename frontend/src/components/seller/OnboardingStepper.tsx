interface OnboardingStepperProps {
  currentStep: number;
  steps?: { label: string; description: string }[];
}

export const OnboardingStepper = ({
  currentStep,
  steps = [
    { label: "Account Info", description: "Your details" },
    { label: "Store Details", description: "Store setup" },
    { label: "Review", description: "Confirm & submit" },
  ],
}: OnboardingStepperProps) => {
  return (
    <nav aria-label="Onboarding progress" className="w-full">
      <ol className="flex items-center" role="list">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isLast = index === steps.length - 1;

          return (
            <li key={step.label} className="flex flex-col items-center relative z-10">
              <div
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold
                  transition-all duration-300
                  ${isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : isCompleted
                    ? "bg-success text-white"
                    : "bg-border text-text-muted"
                  }
                `}
                aria-current={isActive ? "step" : undefined}
              >
                {isCompleted ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span aria-hidden="true">{stepNumber}</span>
                )}
              </div>
              <div className="mt-2 text-center px-2">
                <p className={`text-sm font-medium ${isActive ? "text-text-primary" : "text-text-secondary"}`}>
                  {step.label}
                </p>
                <p className="text-xs text-text-muted">{step.description}</p>
              </div>
              {!isLast && (
                <div
                  className={`
                    absolute top-5 left-1/2 w-full h-1 -translate-x-1/2 -translate-y-1/2
                    ${isCompleted ? "bg-success" : "bg-border"}
                  `}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};