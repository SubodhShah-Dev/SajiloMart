import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser, AuthUserRole } from "../../services/api";

export type User = AuthUser;

export type AuthStatus = "idle" | "loading" | "authenticated" | "anonymous";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  status: AuthStatus;
  authMode: "login" | "register";
  pendingRedirect: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  status: "idle",
  authMode: "login",
  pendingRedirect: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthMode: (state, action: PayloadAction<"login" | "register">) => {
      state.authMode = action.payload;
    },
    setPendingRedirect: (state, action: PayloadAction<string | null>) => {
      state.pendingRedirect = action.payload;
    },
    setAuthLoading: (state) => {
      state.status = "loading";
    },
    setCredentials: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.status = "authenticated";
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = "anonymous";
      state.authMode = "login";
      state.pendingRedirect = null;
    },
    updateUserRole: (state, action: PayloadAction<AuthUserRole>) => {
      if (state.user) {
        state.user.role = action.payload;
      }
    },
  },
});

export const {
  setAuthMode,
  setPendingRedirect,
  setAuthLoading,
  setCredentials,
  clearAuth,
  updateUserRole,
} = authSlice.actions;

export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectAuthMode = (state: { auth: AuthState }) => state.auth.authMode;
export const selectPendingRedirect = (state: { auth: AuthState }) =>
  state.auth.pendingRedirect;
export const selectUserRole = (state: { auth: AuthState }) =>
  state.auth.user?.role ?? null;
export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;

export default authSlice.reducer;
