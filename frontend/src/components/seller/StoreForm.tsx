import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Upload } from "lucide-react";
import { Button, Input, Textarea, Select, Card, CardHeader, CardTitle, CardContent } from "../ui";
import type { StoreOnboardingData } from "../../store/slices/sellerSlice";

const accountInfoSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
});

const storeDetailsSchema = z.object({
  storeName: z.string().min(2, "Store name must be at least 2 characters"),
  storeDescription: z.string().min(50, "Description must be at least 50 characters"),
  storeCategory: z.string().min(1, "Please select a category"),
  returnPolicy: z.string().min(20, "Return policy must be at least 20 characters"),
  shippingPolicy: z.string().min(20, "Shipping policy must be at least 20 characters"),
});

type AccountInfoData = z.infer<typeof accountInfoSchema>;
type StoreDetailsData = z.infer<typeof storeDetailsSchema>;

const storeCategories = [
  { value: "electronics", label: "Electronics" },
  { value: "fashion", label: "Fashion" },
  { value: "home-kitchen", label: "Home & Kitchen" },
  { value: "beauty", label: "Beauty" },
  { value: "sports", label: "Sports" },
  { value: "books", label: "Books" },
  { value: "toys-games", label: "Toys & Games" },
  { value: "automotive", label: "Automotive" },
];

interface StoreFormProps {
  currentStep: number;
  onSubmit: (data: Partial<StoreOnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
  initialData: Partial<StoreOnboardingData>;
  isSubmitting?: boolean;
}

export const StoreForm = ({
  currentStep,
  onSubmit,
  onNext,
  onPrev,
  initialData,
  isSubmitting = false,
}: StoreFormProps) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData.storeLogo ?? null);

  const accountForm = useForm<AccountInfoData>({
    resolver: zodResolver(accountInfoSchema),
    defaultValues: {
      email: initialData.email ?? "",
      name: initialData.name ?? "",
      phone: initialData.phone ?? "",
    },
  });

  const storeForm = useForm<StoreDetailsData>({
    resolver: zodResolver(storeDetailsSchema),
    defaultValues: {
      storeName: initialData.storeName ?? "",
      storeDescription: initialData.storeDescription ?? "",
      storeCategory: initialData.storeCategory ?? "",
      returnPolicy: initialData.returnPolicy ?? "",
      shippingPolicy: initialData.shippingPolicy ?? "",
    },
  });

  const handleLogoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const removeLogo = useCallback(() => {
    setLogoPreview(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-primary", "bg-primary-light");
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.currentTarget.classList.remove("border-primary", "bg-primary-light");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-primary", "bg-primary-light");
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleAccountSubmit = (data: AccountInfoData) => {
    onSubmit(data);
    onNext();
  };

  const handleStoreSubmit = (data: StoreDetailsData) => {
    onSubmit({ ...data, storeLogo: logoPreview });
    onNext();
  };

  const handleReviewSubmit = () => {
    onSubmit({});
  };

  const renderStep1 = () => (
    <form onSubmit={accountForm.handleSubmit(handleAccountSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Full Name"
          placeholder="John Doe"
          error={accountForm.formState.errors.name?.message}
          {...accountForm.register("name")}
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={accountForm.formState.errors.email?.message}
          {...accountForm.register("email")}
          required
        />
      </div>
      <Input
        label="Phone Number"
        type="tel"
        placeholder="+1 (555) 000-0000"
        error={accountForm.formState.errors.phone?.message}
        {...accountForm.register("phone")}
        required
      />
      <div className="pt-4">
        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Continue
        </Button>
      </div>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={storeForm.handleSubmit(handleStoreSubmit)} className="space-y-4" noValidate>
      <Input
        label="Store Name"
        placeholder="My Awesome Store"
        error={storeForm.formState.errors.storeName?.message}
        {...storeForm.register("storeName")}
        required
      />

      <Textarea
        label="Store Description"
        placeholder="Describe your store, what you sell, and what makes it unique..."
        rows={4}
        error={storeForm.formState.errors.storeDescription?.message}
        {...storeForm.register("storeDescription")}
        required
      />

      <Select
        label="Store Category"
        placeholder="Select a category"
        options={storeCategories}
        error={storeForm.formState.errors.storeCategory?.message}
        {...storeForm.register("storeCategory")}
        required
      />

      {/* Logo Upload */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-text-primary">Store Logo</label>
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            logoPreview ? "border-transparent" : "border-border hover:border-primary"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Upload store logo"
          />
          {logoPreview ? (
            <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden bg-surface">
              <img src={logoPreview} alt="Store logo preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removeLogo}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                aria-label="Remove logo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-text-secondary">
              <div className="p-3 rounded-full bg-primary-light text-primary">
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-sm">Drag & drop or click to upload</p>
              <p className="text-xs text-text-muted">PNG, JPG up to 5MB</p>
            </div>
          )}
        </div>
      </div>

      <Textarea
        label="Return Policy"
        placeholder="Describe your return and refund policy..."
        rows={3}
        error={storeForm.formState.errors.returnPolicy?.message}
        {...storeForm.register("returnPolicy")}
        required
      />

      <Textarea
        label="Shipping Policy"
        placeholder="Describe your shipping methods, costs, and delivery times..."
        rows={3}
        error={storeForm.formState.errors.shippingPolicy?.message}
        {...storeForm.register("shippingPolicy")}
        required
      />

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onPrev} fullWidth>
          Back
        </Button>
        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Continue
        </Button>
      </div>
    </form>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Email</span>
            <span className="text-text-primary font-medium">{initialData.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Name</span>
            <span className="text-text-primary font-medium">{initialData.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Phone</span>
            <span className="text-text-primary font-medium">{initialData.phone}</span>
          </div>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Store Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Store Name</span>
            <span className="text-text-primary font-medium">{initialData.storeName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Category</span>
            <span className="text-text-primary font-medium">
              {storeCategories.find((c) => c.value === initialData.storeCategory)?.label ?? initialData.storeCategory}
            </span>
          </div>
          {logoPreview && (
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Logo</span>
              <img src={logoPreview} alt="Store logo" className="h-12 w-12 rounded-lg object-cover" />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
        <p className="text-sm text-warning-dark flex items-center gap-2">
          <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Your application will be reviewed by our team. You'll be notified once approved.
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onPrev} fullWidth>
          Back
        </Button>
        <Button
          type="button"
          onClick={handleReviewSubmit}
          fullWidth
          isLoading={isSubmitting}
        >
          Submit Application
        </Button>
      </div>
    </div>
  );

  switch (currentStep) {
    case 1:
      return renderStep1();
    case 2:
      return renderStep2();
    case 3:
      return renderStep3();
    default:
      return null;
  }
};