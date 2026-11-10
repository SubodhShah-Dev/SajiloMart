import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getCurrentUser, refreshSession } from "../services/api";
import type { AppDispatch } from "../store";
import {
  clearAuth,
  selectAuthStatus,
  setAuthLoading,
  setCredentials,
} from "../store/slices/authSlice";
import { hydrateAccountData } from "./hydrateAccountData";

export function useAuthBootstrap(): void {
  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector(selectAuthStatus);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || status !== "idle") {
      return;
    }

    started.current = true;
    dispatch(setAuthLoading());

    void (async () => {
      try {
        const user = await getCurrentUser();
        dispatch(setCredentials(user));
        await hydrateAccountData(dispatch);
        return;
      } catch {
        // The access token may have expired; try the refresh cookie once.
      }

      try {
        const user = await refreshSession();
        dispatch(setCredentials(user));
        await hydrateAccountData(dispatch);
      } catch {
        dispatch(clearAuth());
      }
    })();
  }, [dispatch, status]);
}
