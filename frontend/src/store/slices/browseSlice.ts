import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "../../services/api";

export interface BrowseFilters {
  categories: string[];
  priceMin: number | null;
  priceMax: number | null;
  minRating: number | null;
  inStockOnly: boolean;
  sort: "price_asc" | "price_desc" | "rating" | "newest" | "bestselling";
}

interface BrowseState {
  filters: BrowseFilters;
  filteredProducts: Product[];
  resultsCount: number;
}

const initialFilters: BrowseFilters = {
  categories: [],
  priceMin: null,
  priceMax: null,
  minRating: null,
  inStockOnly: false,
  sort: "newest",
};

const initialState: BrowseState = {
  filters: initialFilters,
  filteredProducts: [],
  resultsCount: 0,
};

const browseSlice = createSlice({
  name: "browse",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<BrowseFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setCategories: (state, action: PayloadAction<string[]>) => {
      state.filters.categories = action.payload;
    },
    toggleCategory: (state, action: PayloadAction<string>) => {
      const category = action.payload;
      const index = state.filters.categories.indexOf(category);
      if (index >= 0) {
        state.filters.categories.splice(index, 1);
      } else {
        state.filters.categories.push(category);
      }
    },
    setPriceRange: (state, action: PayloadAction<{ min: number | null; max: number | null }>) => {
      state.filters.priceMin = action.payload.min;
      state.filters.priceMax = action.payload.max;
    },
    setMinRating: (state, action: PayloadAction<number | null>) => {
      state.filters.minRating = action.payload;
    },
    setInStockOnly: (state, action: PayloadAction<boolean>) => {
      state.filters.inStockOnly = action.payload;
    },
    setSort: (state, action: PayloadAction<BrowseFilters["sort"]>) => {
      state.filters.sort = action.payload;
    },
    clearFilters: (state) => {
      state.filters = initialFilters;
    },
    setFilteredProducts: (state, action: PayloadAction<Product[]>) => {
      state.filteredProducts = action.payload;
      state.resultsCount = action.payload.length;
    },
  },
});

export const {
  setFilters,
  setCategories,
  toggleCategory,
  setPriceRange,
  setMinRating,
  setInStockOnly,
  setSort,
  clearFilters,
  setFilteredProducts,
} = browseSlice.actions;

export const selectBrowseFilters = (state: { browse: BrowseState }) => state.browse.filters;
export const selectFilteredProducts = (state: { browse: BrowseState }) => state.browse.filteredProducts;
export const selectResultsCount = (state: { browse: BrowseState }) => state.browse.resultsCount;

export default browseSlice.reducer;