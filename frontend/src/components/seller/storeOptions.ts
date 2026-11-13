export const STORE_CATEGORIES = [
  { value: "electronics", label: "Electronics" },
  { value: "fashion", label: "Fashion" },
  { value: "home", label: "Home & Kitchen" },
  { value: "beauty", label: "Beauty" },
  { value: "sports", label: "Sports" },
  { value: "books", label: "Books" },
  { value: "toys", label: "Toys & Games" },
  { value: "automotive", label: "Automotive" },
] as const;

export function storeCategoryLabel(value: string | null | undefined): string {
  return STORE_CATEGORIES.find((category) => category.value === value)?.label ?? "Not set";
}
