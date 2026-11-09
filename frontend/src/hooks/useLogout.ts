import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logoutUser } from "../services/api";
import type { AppDispatch } from "../store";
import { clearAuth } from "../store/slices/authSlice";
import { clearCart } from "../store/slices/cartSlice";
import { clearWishlist } from "../store/slices/wishlistSlice";

export function useLogout(): () => Promise<void> {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  return useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Local state is still cleared even if the server call fails.
    } finally {
      dispatch(clearAuth());
      dispatch(clearCart());
      dispatch(clearWishlist());
      navigate("/", { replace: true });
    }
  }, [dispatch, navigate]);
}
