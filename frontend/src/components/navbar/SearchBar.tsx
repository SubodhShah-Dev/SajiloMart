import { useState, type ChangeEvent, type FormEvent } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  className?: string;
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export const SearchBar = ({
  className = "",
  onSearch,
  placeholder = "Search products, brands, categories...",
}: SearchBarProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query.trim());
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <form role="search" onSubmit={handleSubmit} className={`w-full max-w-2xl ${className}`}>
      <label htmlFor="global-search" className="sr-only">
        Search products
      </label>
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted pointer-events-none"
          aria-hidden="true"
        />
        <input
          id="global-search"
          type="search"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-base placeholder:text-text-muted
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent
            transition-colors duration-200
            hover:border-text-muted"
          autoComplete="off"
          aria-label="Search products, brands, categories"
        />
      </div>
    </form>
  );
};