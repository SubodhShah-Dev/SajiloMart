import {
  createAsyncThunk,
  createSelector,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Product } from "../../services/api";
import {
  addWishlistItem,
  clearWishlist as clearWishlistRequest,
  getWishlist,
  removeWishlistItem,
} from "../../services/api";

type WishlistStatus = "idle" | "loading" | "ready" | "error";

interface WishlistState {
  items: Product[];
  status: WishlistStatus;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  status: "idle",
  error: null,
};

function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function applyToggle(items: Product[], product: Product): Product[] {
  const exists = items.some((item) => item.id === product.id);

  return exists
    ? items.filter((item) => item.id !== product.id)
    : [product, ...items];
}

export const hydrateWishlist = createAsyncThunk<
  Product[],
  void,
  { rejectValue: string }
>("wishlist/hydrate", async (_, { rejectWithValue }) => {
  try {
    const data = await getWishlist();
    return data.items;
  } catch (error) {
    return rejectWithValue(
      toErrorMessage(error, "Unable to load your wishlist."),
    );
  }
});

export interface ToggleWishlistInput {
  product: Product;
  remove: boolean;
}

export const toggleWishlist = createAsyncThunk<
  Product[],
  ToggleWishlistInput,
  { rejectValue: string }
>("wishlist/toggle", async ({ product, remove }, { rejectWithValue }) => {
  try {
    const data = remove
      ? await removeWishlistItem(product.id)
      : await addWishlistItem(product.id);

    return data.items;
  } catch (error) {
    return rejectWithValue(
      toErrorMessage(error, "Unable to update your wishlist."),
    );
  }
});

export const clearWishlistRemote = createAsyncThunk<
  Product[],
  void,
  { rejectValue: string }
>("wishlist/clearRemote", async (_, { rejectWithValue }) => {
  try {
    const data = await clearWishlistRequest();
    return data.items;
  } catch (error) {
    return rejectWithValue(
      toErrorMessage(error, "Unable to clear your wishlist."),
    );
  }
});

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setWishlist: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
      state.status = "ready";
      state.error = null;
    },
    clearWishlist: (state) => {
      state.items = [];
      state.status = "idle";
      state.error = null;
    },
    clearWishlistError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateWishlist.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(hydrateWishlist.fulfilled, (state, action) => {
      state.items = action.payload;
      state.status = "ready";
    });
    builder.addCase(hydrateWishlist.rejected, (state, action) => {
      state.status = "error";
      state.error = action.payload ?? "Unable to load your wishlist.";
    });

    builder.addCase(toggleWishlist.pending, (state, action) => {
      state.items = applyToggle(state.items, action.meta.arg.product);
      state.error = null;
    });
    builder.addCase(toggleWishlist.fulfilled, (state, action) => {
      state.items = action.payload;
      state.status = "ready";
    });
    builder.addCase(toggleWishlist.rejected, (state, action) => {
      state.items = applyToggle(state.items, action.meta.arg.product);
      state.error = action.payload ?? "Unable to update your wishlist.";
    });

    builder.addCase(clearWishlistRemote.fulfilled, (state, action) => {
      state.items = action.payload;
      state.status = "ready";
      state.error = null;
    });
    builder.addCase(clearWishlistRemote.rejected, (state, action) => {
      state.error = action.payload ?? "Unable to clear your wishlist.";
    });
  },
});

export const { setWishlist, clearWishlist, clearWishlistError } =
  wishlistSlice.actions;

export const selectWishlistItems = (state: { wishlist: WishlistState }) =>
  state.wishlist.items;
export const selectWishlistIds = createSelector(
  [selectWishlistItems],
  (items) => items.map((item) => item.id),
);
export const selectWishlistCount = (state: { wishlist: WishlistState }) =>
  state.wishlist.items.length;
export const selectWishlistError = (state: { wishlist: WishlistState }) =>
  state.wishlist.error;
export const selectWishlistStatus = (state: { wishlist: WishlistState }) =>
  state.wishlist.status;
export const selectIsInWishlist =
  (productId: string) => (state: { wishlist: WishlistState }) =>
    state.wishlist.items.some((item) => item.id === productId);

export default wishlistSlice.reducer;
