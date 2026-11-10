import { configureStore } from "@reduxjs/toolkit";
import wishlistReducer from "./slices/wishlistSlice";
import authReducer from "./slices/authSlice";
import browseReducer from "./slices/browseSlice";
import cartReducer from "./slices/cartSlice";

export const store = configureStore({
  reducer: {
    wishlist: wishlistReducer,
    auth: authReducer,
    browse: browseReducer,
    cart: cartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;