import { useState } from "react";
import type { FormEvent } from "react";
import { useDispatch } from "react-redux";
import { AlertCircle, Loader2, Store } from "lucide-react";

import { Button, Card, Input, Select, Textarea } from "../ui";
import { STORE_CATEGORIES } from "./storeOptions";
import {
  createStore,
  getCurrentUser,
  refreshSession,
  type CreateStoreInput,
  type StoreSummary,
} from "../../services/api";
import { setCredentials } from "../../store/slices/authSlice";
import type { AppDispatch } from "../../store";

interface StoreFormData {
  name: string;
  description: string;
  category: string;
  phone: string;
  returnPolicy: string;
  shippingPolicy: string;
  logoUrl: string;
}

const initialFormData: StoreFormData = {
  name: "",
  description: "",
  category: "",
  phone: "",
  returnPolicy: "",
  shippingPolicy: "",
  logoUrl: "",
};

interface CreateStoreFormProps {
  onCreated: (store: StoreSummary) => void;
}

export const CreateStoreForm = ({ onCreated }: CreateStoreFormProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const [formData, setFormData] = useState<StoreFormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requiredError = (value: string, message: string) =>
    attemptedSubmit && !value.trim() ? message : undefined;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setAttemptedSubmit(true);
    setError(null);

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.category
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      const input: CreateStoreInput = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        phone: formData.phone.trim() || undefined,
        returnPolicy: formData.returnPolicy.trim() || undefined,
        shippingPolicy: formData.shippingPolicy.trim() || undefined,
        logoUrl: formData.logoUrl.trim() || undefined,
      };

      const response = await createStore(input);

      if (response.store) {
        onCreated(response.store);
      }

      // The account becomes a VENDOR; refresh it so the UI reflects the new role.
      try {
        dispatch(setCredentials(await getCurrentUser()));
      } catch {
        try {
          dispatch(setCredentials(await refreshSession()));
        } catch {
          // The store exists now; the role can refresh on the next page load.
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create your store. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-light text-primary">
          <Store className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Create your store
        </h1>
        <p className="mt-2 text-text-secondary">
          Set up your storefront in one step. You can add products once it is approved.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm text-accent"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <Card padding="lg">
          <div className="space-y-6">
            <Input
              label="Store name"
              placeholder="My Awesome Store"
              value={formData.name}
              onChange={(event) =>
                setFormData({ ...formData, name: event.target.value })
              }
              required
              error={requiredError(formData.name, "Store name is required")}
            />

            <Textarea
              label="Description"
              placeholder="What do you sell, and what makes your store unique?"
              rows={4}
              value={formData.description}
              onChange={(event) =>
                setFormData({ ...formData, description: event.target.value })
              }
              required
              error={requiredError(formData.description, "Description is required")}
              hint="At least 20 characters."
            />

            <Select
              label="Category"
              placeholder="Select a category"
              options={STORE_CATEGORIES.map((category) => ({ ...category }))}
              value={formData.category}
              onChange={(event) =>
                setFormData({ ...formData, category: event.target.value })
              }
              required
              error={requiredError(formData.category, "Category is required")}
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <Input
                label="Phone (optional)"
                type="tel"
                placeholder="+977 98XXXXXXXX"
                value={formData.phone}
                onChange={(event) =>
                  setFormData({ ...formData, phone: event.target.value })
                }
              />

              <Input
                label="Logo URL (optional)"
                type="url"
                placeholder="https://example.com/logo.png"
                value={formData.logoUrl}
                onChange={(event) =>
                  setFormData({ ...formData, logoUrl: event.target.value })
                }
              />
            </div>

            <Textarea
              label="Return policy (optional)"
              placeholder="How do returns and refunds work?"
              rows={3}
              value={formData.returnPolicy}
              onChange={(event) =>
                setFormData({ ...formData, returnPolicy: event.target.value })
              }
            />

            <Textarea
              label="Shipping policy (optional)"
              placeholder="Shipping methods, costs, and delivery times."
              rows={3}
              value={formData.shippingPolicy}
              onChange={(event) =>
                setFormData({ ...formData, shippingPolicy: event.target.value })
              }
            />
          </div>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="submit"
            size="lg"
            isLoading={isSubmitting}
            leftIcon={
              isSubmitting ? undefined : <Store className="h-5 w-5" aria-hidden="true" />
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                <span>Creating store…</span>
              </>
            ) : (
              "Create store"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
