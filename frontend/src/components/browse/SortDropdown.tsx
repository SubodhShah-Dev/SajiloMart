import { Select } from "../ui";

interface SortDropdownProps {
  value: "price_asc" | "price_desc" | "rating" | "newest" | "bestselling";
  onChange: (value: "price_asc" | "price_desc" | "rating" | "newest" | "bestselling") => void;
  className?: string;
}

export const SortDropdown = ({ value, onChange, className = "" }: SortDropdownProps) => {
  const options = [
    { value: "newest", label: "Newest" },
    { value: "bestselling", label: "Best Selling" },
    { value: "rating", label: "Highest Rated" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
  ];

  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value as typeof value)}
      options={options}
      placeholder="Sort by"
      className={className}
      size="sm"
    />
  );
};