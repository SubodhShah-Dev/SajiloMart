import { getCart } from "../services/api";
import type { AppDispatch } from "../store";
import { setCart } from "../store/slices/cartSlice";
import { hydrateWishlist } from "../store/slices/wishlistSlice";

export async function hydrateAccountData(dispatch: AppDispatch): Promise<void> {
  try {
    const cart = await getCart();

    if (cart.items?.length) {
      dispatch(setCart(cart.items));
    }
  } catch {
    // Cart fetch failed; keep going so the wishlist still loads.
  }

  await dispatch(hydrateWishlist())
    .unwrap()
    .catch(() => undefined);
}
