import { useState } from "react";
import type { FormEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Link2,
  Save,
  Shield,
  Undo2,
} from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  Textarea,
} from "../../components/ui";
import { STORE_CATEGORIES } from "../../components/seller/storeOptions";
import { verificationMeta } from "../../components/seller/storeStatus";
import {
  requestVerification,
  updateStore,
  type StoreSummary,
  type UpdateStoreInput,
} from "../../services/api";

interface StoreFormData {
  name: string;
  category: string;
  description: string;
  phone: string;
  logoUrl: string;
  returnPolicy: string;
  shippingPolicy: string;
}

type FormErrors = Partial<Record<keyof StoreFormData, string>>;

interface SellerSettingsProps {
  store: StoreSummary;
  onStoreUpdated: (store: StoreSummary) => void;
}

const toFormData = (store: StoreSummary): StoreFormData => ({
  name: store.name,
  category: store.category ?? "",
  description: store.description ?? "",
  phone: store.phone ?? "",
  logoUrl: store.logoUrl ?? "",
  returnPolicy: store.returnPolicy ?? "",
  shippingPolicy: store.shippingPolicy ?? "",
});

const PHONE_PATTERN = /^[+\d\s()-]*$/;

function validate(form: StoreFormData): FormErrors {
  const errors: FormErrors = {};

  const name = form.name.trim();
  if (name.length < 3) {
    errors.name = "Store name must be at least 3 characters.";
  } else if (name.length > 150) {
    errors.name = "Store name must be 150 characters or fewer.";
  }

  const description = form.description.trim();
  if (description.length < 20) {
    errors.description = "Description must be at least 20 characters.";
  } else if (description.length > 2000) {
    errors.description = "Description must be 2000 characters or fewer.";
  }

  if (!form.category.trim()) {
    errors.category = "Choose a category for your store.";
  }

  const phone = form.phone.trim();
  if (phone.length > 20) {
    errors.phone = "Phone number must be 20 characters or fewer.";
  } else if (phone && !PHONE_PATTERN.test(phone)) {
    errors.phone = "Enter a valid phone number.";
  }

  const logoUrl = form.logoUrl.trim();
  if (logoUrl) {
    try {
      new URL(logoUrl);
    } catch {
      errors.logoUrl = "Enter a full URL, for example https://example.com/logo.png.";
    }
  }

  if (form.returnPolicy.trim().length > 2000) {
    errors.returnPolicy = "Return policy must be 2000 characters or fewer.";
  }

  if (form.shippingPolicy.trim().length > 2000) {
    errors.shippingPolicy = "Shipping policy must be 2000 characters or fewer.";
  }

  return errors;
}

function buildUpdateInput(
  form: StoreFormData,
  store: StoreSummary,
): UpdateStoreInput {
  const input: UpdateStoreInput = {};

  if (form.name.trim() !== store.name) input.name = form.name.trim();
  if (form.category.trim() !== (store.category ?? "")) {
    input.category = form.category.trim();
  }
  if (form.description.trim() !== (store.description ?? "")) {
    input.description = form.description.trim();
  }
  if (form.phone.trim() !== (store.phone ?? "")) input.phone = form.phone.trim();
  if (form.logoUrl.trim() !== (store.logoUrl ?? "")) {
    input.logoUrl = form.logoUrl.trim();
  }
  if (form.returnPolicy.trim() !== (store.returnPolicy ?? "")) {
    input.returnPolicy = form.returnPolicy.trim();
  }
  if (form.shippingPolicy.trim() !== (store.shippingPolicy ?? "")) {
    input.shippingPolicy = form.shippingPolicy.trim();
  }

  return input;
}

function LogoPreview({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);

  if (!url.trim()) {
    return (
      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl border border-dashed border-border bg-surface-hover text-text-muted">
        <ImageIcon className="h-6 w-6" aria-hidden="true" />
      </div>
    );
  }

  if (failed) {
    return (
      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-surface-hover text-text-muted">
        <ImageIcon className="h-6 w-6" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt="Store logo preview"
      onError={() => setFailed(true)}
      className="h-16 w-16 flex-shrink-0 rounded-xl border border-border bg-surface object-cover"
    />
  );
}

export const SellerSettings = ({ store, onStoreUpdated }: SellerSettingsProps) => {
  const [form, setForm] = useState<StoreFormData>(() => toFormData(store));
  const [errors, setErrors] = useState<FormErrors>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [isRequestingVerification, setIsRequestingVerification] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const isSuspended = store.status === "SUSPENDED";
  const verification = verificationMeta(store.verificationStatus);
  const canRequestVerification =
    !isSuspended &&
    store.verificationStatus !== "VERIFIED" &&
    store.verificationStatus !== "PENDING";

  const updateField = (key: keyof StoreFormData, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setStatusMessage(null);

    if (attemptedSubmit) {
      setErrors((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  };

  const persisted = toFormData(store);
  const isDirty = (Object.keys(form) as (keyof StoreFormData)[]).some(
    (key) => form[key] !== persisted[key],
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (isSuspended) {
      return;
    }

    setAttemptedSubmit(true);
    setStatusMessage(null);
    setSaveError(null);

    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const input = buildUpdateInput(form, store);

    if (Object.keys(input).length === 0) {
      setStatusMessage("No changes to save.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await updateStore(input);

      if (response.store) {
        onStoreUpdated(response.store);
        setForm(toFormData(response.store));
      }

      setAttemptedSubmit(false);
      setErrors({});
      setStatusMessage("Store details saved.");
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save your store details.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setForm(toFormData(store));
    setErrors({});
    setAttemptedSubmit(false);
    setSaveError(null);
    setStatusMessage(null);
  };

  const handleRequestVerification = async () => {
    setVerificationError(null);
    setIsRequestingVerification(true);

    try {
      const response = await requestVerification();

      if (response.store) {
        onStoreUpdated(response.store);
      }

      setStatusMessage("Verification requested. We'll review your store shortly.");
    } catch (err) {
      setVerificationError(
        err instanceof Error
          ? err.message
          : "Failed to request verification. Please try again.",
      );
    } finally {
      setIsRequestingVerification(false);
    }
  };

  return (
    <div className="space-y-6">
      {isSuspended ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/5 p-4"
        >
          <AlertCircle
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent"
            aria-hidden="true"
          />
          <div>
            <p className="font-medium text-text-primary">
              Store settings are locked
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              {store.suspensionReason ??
                "Your store is suspended, so details can't be edited and verification can't be requested."}
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {statusMessage ? (
            <div
              role="status"
              className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 p-4 text-sm"
            >
              <CheckCircle2
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-success"
                aria-hidden="true"
              />
              <span className="text-text-secondary">{statusMessage}</span>
            </div>
          ) : null}

          {saveError ? (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm text-accent"
            >
              <AlertCircle
                className="mt-0.5 h-4 w-4 flex-shrink-0"
                aria-hidden="true"
              />
              <span>{saveError}</span>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <fieldset disabled={isSuspended} className="space-y-6">
              <Card padding="lg">
                <CardHeader className="mb-5">
                  <CardTitle>Store details</CardTitle>
                  <p className="mt-1 text-sm text-text-secondary">
                    The name, category and description buyers see on your store.
                  </p>
                </CardHeader>

                <div className="space-y-5">
                  <Input
                    label="Store name"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    error={errors.name}
                    hint="Changing the name also updates your store link."
                    required
                  />

                  <Select
                    label="Category"
                    placeholder="Select a category"
                    options={STORE_CATEGORIES.map((category) => ({ ...category }))}
                    value={form.category}
                    onChange={(event) => updateField("category", event.target.value)}
                    error={errors.category}
                    required
                  />

                  <Textarea
                    label="Description"
                    rows={4}
                    value={form.description}
                    onChange={(event) =>
                      updateField("description", event.target.value)
                    }
                    error={errors.description}
                    hint={`${form.description.trim().length} of 2000 characters (minimum 20).`}
                    required
                  />
                </div>
              </Card>

              <Card padding="lg">
                <CardHeader className="mb-5">
                  <CardTitle>Contact &amp; branding</CardTitle>
                  <p className="mt-1 text-sm text-text-secondary">
                    Help buyers recognise and reach your store.
                  </p>
                </CardHeader>

                <div className="space-y-5">
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <Input
                        label="Logo URL"
                        type="url"
                        placeholder="https://example.com/logo.png"
                        value={form.logoUrl}
                        onChange={(event) =>
                          updateField("logoUrl", event.target.value)
                        }
                        error={errors.logoUrl}
                        hint="Optional. Square images look best."
                      />
                    </div>
                    <LogoPreview key={form.logoUrl} url={form.logoUrl} />
                  </div>

                  <Input
                    label="Phone"
                    type="tel"
                    placeholder="+977 98XXXXXXXX"
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    error={errors.phone}
                    hint="Optional. Shown to buyers who need to contact you."
                  />
                </div>
              </Card>

              <Card padding="lg">
                <CardHeader className="mb-5">
                  <CardTitle>Policies</CardTitle>
                  <p className="mt-1 text-sm text-text-secondary">
                    Clear policies reduce questions and build buyer trust.
                  </p>
                </CardHeader>

                <div className="space-y-5">
                  <Textarea
                    label="Return policy"
                    rows={3}
                    placeholder="How returns and refunds work."
                    value={form.returnPolicy}
                    onChange={(event) =>
                      updateField("returnPolicy", event.target.value)
                    }
                    error={errors.returnPolicy}
                  />

                  <Textarea
                    label="Shipping policy"
                    rows={3}
                    placeholder="Shipping methods, costs and delivery times."
                    value={form.shippingPolicy}
                    onChange={(event) =>
                      updateField("shippingPolicy", event.target.value)
                    }
                    error={errors.shippingPolicy}
                  />
                </div>
              </Card>
            </fieldset>

            {isDirty && !isSuspended ? (
              <div className="sticky bottom-0 z-10 -mx-1 rounded-xl border border-border bg-surface p-4 shadow-lg">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-text-secondary">
                    You have unsaved changes.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      disabled={isSaving}
                      leftIcon={<Undo2 className="h-4 w-4" aria-hidden="true" />}
                    >
                      Discard
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      isLoading={isSaving}
                      leftIcon={
                        isSaving ? undefined : (
                          <Save className="h-4 w-4" aria-hidden="true" />
                        )
                      }
                    >
                      {isSaving ? "Saving…" : "Save changes"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </form>
        </div>

        <div className="space-y-6">
          <Card padding="lg">
            <CardHeader className="mb-4">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
                Verification
              </CardTitle>
              <div className="mt-2">
                <Badge variant={verification.variant} size="sm">
                  {verification.label}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 p-0">
              <p className="text-sm text-text-secondary">
                {store.verificationStatus === "VERIFIED"
                  ? "Your store is verified and enjoys unlimited listings."
                  : store.verificationStatus === "PENDING"
                    ? "Your request is under review. You'll be notified once it's processed."
                    : store.verificationStatus === "REJECTED"
                      ? "Your last request was rejected. Update your store details and request again."
                      : "Verified stores get unlimited listings and priority support."}
              </p>

              <div>
                <div className="h-2 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{
                      width:
                        store.listingLimit === null
                          ? "100%"
                          : `${Math.min(
                              (store.productCount / store.listingLimit) * 100,
                              100,
                            )}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-sm text-text-secondary">
                  {store.listingLimit === null
                    ? "Unlimited listings"
                    : `${store.productCount} of ${store.listingLimit} listings used`}
                </p>
              </div>

              {verificationError ? (
                <p role="alert" className="text-sm text-accent">
                  {verificationError}
                </p>
              ) : null}

              {canRequestVerification ? (
                <Button
                  fullWidth
                  onClick={handleRequestVerification}
                  isLoading={isRequestingVerification}
                  leftIcon={
                    isRequestingVerification ? undefined : (
                      <Shield className="h-4 w-4" aria-hidden="true" />
                    )
                  }
                >
                  {isRequestingVerification
                    ? "Requesting…"
                    : store.verificationStatus === "REJECTED"
                      ? "Request verification again"
                      : "Request verification"}
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <Card padding="lg">
            <CardHeader className="mb-4">
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" aria-hidden="true" />
                Store link
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 p-0">
              <Input
                label="Store slug"
                id="store-slug"
                value={`/${store.slug}`}
                readOnly
                disabled
                hint="Generated from your store name. Changes automatically when you rename the store."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
