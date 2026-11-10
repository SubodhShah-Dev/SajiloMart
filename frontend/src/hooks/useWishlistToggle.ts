import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import type { Product } from "../services/api";
import type { AppDispatch, RootState } from "../store";
import {
  selectWishlistItems,
  toggleWishlist,
} from "../store/slices/wishlistSlice";

export function useWishlistToggle(): (product: Product) => void {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const wishlistItems = useSelector((state: RootState) =>
    selectWishlistItems(state),
  );

  return useCallback(
    (product: Product) => {
      if (!isAuthenticated) {
        navigate("/login", {
          state: { from: `${location.pathname}${location.search}` },
        });
        return;
      }

      const remove = wishlistItems.some((item) => item.id === product.id);
      void dispatch(toggleWishlist({ product, remove }));
    },
    [
      dispatch,
      isAuthenticated,
      location.pathname,
      location.search,
      navigate,
      wishlistItems,
    ],
  );
}
