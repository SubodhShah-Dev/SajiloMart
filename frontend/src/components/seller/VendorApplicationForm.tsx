import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button, Input, Textarea, Select, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui";
import { GoogleAuthButton } from "../auth/GoogleAuthButton";

const applicationSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  businessType: z.string().min(1, "Please select a business type"),
  businessDescription: z.string().min(100, "Please provide a detailed description (at least 100 characters)"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPhone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(10, "Please provide your business address"),
  taxId: z.string().min(1, "Tax ID is required"),
});

type ApplicationData = z.infer<typeof applicationSchema>;

const businessTypes = [
  { value: "sole-proprietorship", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "llc", label: "Limited Liability Company (LLC)" },
  { value: "corporation", label: "Corporation" },
  { value: "other", label: "Other" },
];

interface VendorApplicationFormProps {
  onSubmit: (data: ApplicationData) => void;
  isSubmitting?: boolean;
}

export const VendorApplicationForm = ({
  onSubmit,
  isSubmitting = false,
}: VendorApplicationFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationData>({
    resolver: zodResolver(applicationSchema),
  });

  const handleSubmitForm = (data: ApplicationData) => {
    onSubmit(data);
  };

  return (
    <Card variant="outlined" padding="none" className="w-full max-w-2xl">
      <CardHeader className="p-6 pb-0">
        <CardTitle className="text-2xl">Apply to Become a Vendor</CardTitle>
        <CardDescription>
          Fill out the application below. Our team will review it and get back to you within 3-5 business days.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4" noValidate>
          <Input
            label="Business Name"
            placeholder="Your Business Name"
            error={errors.businessName?.message}
            {...register("businessName")}
            required
          />

          <Select
            label="Business Type"
            placeholder="Select business type"
            options={businessTypes}
            error={errors.businessType?.message}
            {...register("businessType")}
            required
          />

          <Textarea
            label="Business Description"
            placeholder="Tell us about your business, what you plan to sell, your target market, and what makes your products unique..."
            rows={5}
            error={errors.businessDescription?.message}
            {...register("businessDescription")}
            required
          />

          <Input
            label="Website (Optional)"
            type="url"
            placeholder="https://yourwebsite.com"
            error={errors.website?.message}
            {...register("website")}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Contact Email"
              type="email"
              placeholder="business@example.com"
              error={errors.contactEmail?.message}
              {...register("contactEmail")}
              required
            />
            <Input
              label="Contact Phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              error={errors.contactPhone?.message}
              {...register("contactPhone")}
              required
            />
          </div>

          <Input
            label="Business Address"
            placeholder="123 Business St, City, State 12345"
            error={errors.address?.message}
            {...register("address")}
            required
          />

          <Input
            label="Tax ID / Business Registration Number"
            placeholder="Your tax identification number"
            error={errors.taxId?.message}
            {...register("taxId")}
            required
          />

          <div className="pt-4">
            <Button type="submit" fullWidth isLoading={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </div>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-surface px-2 text-text-muted">Or continue with</span>
          </div>
        </div>

        <GoogleAuthButton onClick={() => alert("Google OAuth coming soon!")} />
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <div className="text-center text-sm text-text-secondary">
          <p>By submitting this application, you agree to our</p>
          <div className="flex justify-center gap-2 mt-1">
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
            <span className="text-text-muted">and</span>
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};