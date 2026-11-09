import { useForm, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Image } from "lucide-react";
import { Button, Input, Textarea, Select } from "../../components/ui";
import type { CreateProductInput } from "../../services/api";

const categories = [
  "electronics",
  "fashion",
  "home",
  "beauty",
  "sports",
  "books",
  "toys",
  "automotive",
] as const;

const categoryOptions = categories.map((cat) => ({
  value: cat,
  label: cat.charAt(0).toUpperCase() + cat.slice(1),
}));

const createProductSchema = z.object({
  name: z.string().trim().min(2).max(255),
  description: z.string().trim().max(5000).optional(),
  price: z.coerce.number().min(0.01).max(999999.99),
  category: z.enum(categories),
  imageUrl: z.string().url().optional().or(z.literal("")),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  totalStock: z.coerce.number().int().min(0).max(999999).default(0),
});

type ProductFormData = z.infer<typeof createProductSchema>;

export type { ProductFormData };

interface ProductFormProps {
  initialData?: Partial<CreateProductInput> & { id?: string };
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  title: string;
}

function getErrorMessage(error: unknown): string | undefined {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return undefined;
}

export const ProductForm = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  title,
}: ProductFormProps) => {
  const isEditing = Boolean(initialData?.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<any>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createProductSchema) as any,
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      price: String(initialData?.price ?? 0),
      category: initialData?.category ?? "electronics",
      imageUrl: initialData?.imageUrl ?? "",
      thumbnailUrl: initialData?.thumbnailUrl ?? "",
      totalStock: String(initialData?.totalStock ?? 0),
    },
    mode: "onChange",
  });

  const { register, watch, formState: { errors }, handleSubmit } = form;

  const watchedImageUrl = watch("imageUrl");
  const watchedThumbUrl = watch("thumbnailUrl");

  const handleImageChange = (field: "imageUrl" | "thumbnailUrl", value: string) => {
    register(field).onChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleFormSubmit = (data: FieldValues) => {
    const cleanData: ProductFormData = {
      name: data.name,
      description: data.description,
      price: Number(data.price),
      category: data.category,
      totalStock: Number(data.totalStock) || 0,
      imageUrl: data.imageUrl?.trim() || undefined,
      thumbnailUrl: data.thumbnailUrl?.trim() || undefined,
    };
    onSubmit(cleanData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface rounded-xl shadow-xl">
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-border bg-surface rounded-t-xl">
          <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-4 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1">
              Product Name <span className="text-accent">*</span>
            </label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter product name"
              error={getErrorMessage(errors.name)}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-1">
              Description
            </label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter product description"
              rows={3}
              error={getErrorMessage(errors.description)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-text-primary mb-1">
                Price ($) <span className="text-accent">*</span>
              </label>
              <Input
                id="price"
                type="text"
                inputMode="decimal"
                {...register("price")}
                placeholder="0.00"
                error={getErrorMessage(errors.price)}
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-text-primary mb-1">
                Category <span className="text-accent">*</span>
              </label>
              <Select
                id="category"
                options={categoryOptions}
                placeholder="Select category"
                {...register("category")}
                error={getErrorMessage(errors.category)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-text-primary mb-1">
                Main Image URL
              </label>
              <Input
                id="imageUrl"
                {...register("imageUrl")}
                placeholder="https://example.com/image.jpg"
                onChange={(e) => handleImageChange("imageUrl", e.target.value)}
                error={getErrorMessage(errors.imageUrl)}
              />
              {watchedImageUrl && watchedImageUrl.startsWith("http") && (
                <div className="mt-2 relative w-32 h-32">
                  <Image className="h-5 w-5 absolute top-1 right-1 text-text-muted" />
                  <img
                    src={watchedImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg border border-border"
                  />
                </div>
              )}
            </div>

            <div>
              <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-text-primary mb-1">
                Thumbnail URL
              </label>
              <Input
                id="thumbnailUrl"
                {...register("thumbnailUrl")}
                placeholder="https://example.com/thumb.jpg"
                onChange={(e) => handleImageChange("thumbnailUrl", e.target.value)}
                error={getErrorMessage(errors.thumbnailUrl)}
              />
              {watchedThumbUrl && watchedThumbUrl.startsWith("http") && (
                <div className="mt-2 relative w-24 h-24">
                  <img
                    src={watchedThumbUrl}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg border border-border"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="totalStock" className="block text-sm font-medium text-text-primary mb-1">
              Initial Stock
            </label>
            <Input
              id="totalStock"
              type="text"
              inputMode="numeric"
              {...register("totalStock")}
              placeholder="0"
              error={getErrorMessage(errors.totalStock)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditing ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};