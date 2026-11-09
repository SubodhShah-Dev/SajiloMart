import { env } from "../config/env.js";
import type { CookieOptions, Response } from "express";
import {
  getAccessCookieMaxAgeMs,
  getRefreshCookieMaxAgeMs,
} from "./token.service.js";

export const ACCESS_COOKIE_NAME = "access_token";
export const REFRESH_COOKIE_NAME = "refresh_token";
export const GOOGLE_STATE_COOKIE_NAME = "google_oauth_state";

const REFRESH_COOKIE_PATH = "/api/auth";

function baseCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? "none" : "lax",
  };
}

export function setAuthCookies(
  response: Response,
  accessToken: string,
  refreshToken: string,
): void {
  response.cookie(ACCESS_COOKIE_NAME, accessToken, {
    ...baseCookieOptions(),
    path: "/api",
    maxAge: getAccessCookieMaxAgeMs(),
  });

  response.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    ...baseCookieOptions(),
    path: REFRESH_COOKIE_PATH,
    maxAge: getRefreshCookieMaxAgeMs(),
  });
}

export function clearAuthCookies(response: Response): void {
  response.clearCookie(ACCESS_COOKIE_NAME, {
    ...baseCookieOptions(),
    path: "/api",
  });

  response.clearCookie(REFRESH_COOKIE_NAME, {
    ...baseCookieOptions(),
    path: REFRESH_COOKIE_PATH,
  });
}

export function setGoogleStateCookie(response: Response, state: string): void {
  response.cookie(GOOGLE_STATE_COOKIE_NAME, state, {
    ...baseCookieOptions(),
    path: REFRESH_COOKIE_PATH,
    maxAge: 10 * 60 * 1_000,
  });
}

export function clearGoogleStateCookie(response: Response): void {
  response.clearCookie(GOOGLE_STATE_COOKIE_NAME, {
    ...baseCookieOptions(),
    path: REFRESH_COOKIE_PATH,
  });
}
