import { randomBytes, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";

import { env } from "../config/env.js";
import { AppDataSource } from "../config/data-source.js";
import { User } from "../entities/User.js";
import { AppError } from "../errors/AppError.js";
import {
  createSession,
  getUserById,
  loginUser,
  registerUser,
  revokeSession,
  rotateSession,
  toSafeUser,
  updateUserProfile,
} from "../services/auth.service.js";
import {
  clearAuthCookies,
  clearGoogleStateCookie,
  GOOGLE_STATE_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  setAuthCookies,
  setGoogleStateCookie,
} from "../services/cookies.service.js";
import type {
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
} from "../validation/auth.schema.js";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

function googleRedirect(error: string): string {
  return `${env.frontendUrl}/auth?error=${encodeURIComponent(error)}`;
}

function readRefreshCookie(request: Request): string | undefined {
  const token = request.cookies?.[REFRESH_COOKIE_NAME] as unknown;

  return typeof token === "string" && token.length > 0 ? token : undefined;
}

function sendUser(response: Response, user: User, statusCode = 200): void {
  response.status(statusCode).json({
    success: true,
    data: { user: toSafeUser(user) },
  });
}

export async function register(request: Request, response: Response): Promise<void> {
  const input = request.body as RegisterInput;
  const user = await registerUser(input);
  const tokens = await createSession(AppDataSource.manager, user);

  setAuthCookies(response, tokens.accessToken, tokens.refreshToken);
  sendUser(response, user, 201);
}

export async function login(request: Request, response: Response): Promise<void> {
  const input = request.body as LoginInput;
  const user = await loginUser(input);
  const tokens = await createSession(AppDataSource.manager, user);

  setAuthCookies(response, tokens.accessToken, tokens.refreshToken);
  sendUser(response, user);
}

export async function refresh(request: Request, response: Response): Promise<void> {
  const token = readRefreshCookie(request);

  if (!token) {
    throw new AppError("Authentication required", 401);
  }

  const { user, accessToken, refreshToken } = await rotateSession(token);

  setAuthCookies(response, accessToken, refreshToken);
  sendUser(response, user);
}

export async function logout(request: Request, response: Response): Promise<void> {
  await revokeSession(readRefreshCookie(request));
  clearAuthCookies(response);

  response.status(200).json({
    success: true,
    data: { message: "Logged out" },
  });
}

export async function getMe(request: Request, response: Response): Promise<void> {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  const user = await getUserById(userId);
  sendUser(response, user);
}

export async function updateMe(request: Request, response: Response): Promise<void> {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  const user = await updateUserProfile(userId, request.body as UpdateProfileInput);
  sendUser(response, user);
}

export function googleLogin(_request: Request, response: Response): void {
  const googleClientId = env.googleClientId;

  if (!googleClientId) {
    response.status(500).json({
      success: false,
      error: { message: "Google OAuth is not configured." },
    });
    return;
  }

  const state = randomBytes(32).toString("hex");
  const callbackUrl = `${env.backendUrl}/api/auth/google/callback`;

  setGoogleStateCookie(response, state);

  const authUrl = new URL(GOOGLE_AUTH_URL);
  authUrl.searchParams.set("client_id", googleClientId);
  authUrl.searchParams.set("redirect_uri", callbackUrl);
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");
  authUrl.searchParams.set("state", state);

  response.redirect(authUrl.toString());
}

function stateMatches(expected: string, received: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function googleCallback(
  request: Request,
  response: Response,
): Promise<void> {
  const expectedState = request.cookies?.[GOOGLE_STATE_COOKIE_NAME] as unknown;

  clearGoogleStateCookie(response);

  if (request.query.error) {
    response.redirect(googleRedirect("google_oauth_denied"));
    return;
  }

  if (
    typeof expectedState !== "string" ||
    typeof request.query.state !== "string" ||
    !stateMatches(expectedState, request.query.state)
  ) {
    response.redirect(googleRedirect("invalid_state"));
    return;
  }

  const code = typeof request.query.code === "string" ? request.query.code : undefined;

  if (!code) {
    response.redirect(googleRedirect("missing_code"));
    return;
  }

  const googleClientId = env.googleClientId;
  const googleClientSecret = env.googleClientSecret;

  if (!googleClientId || !googleClientSecret) {
    response.redirect(googleRedirect("oauth_not_configured"));
    return;
  }

  try {
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: googleClientId,
        client_secret: googleClientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${env.backendUrl}/api/auth/google/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Token exchange failed");
    }

    const tokenData = (await tokenResponse.json()) as { access_token: string };

    const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userInfoResponse.ok) {
      throw new Error("Failed to fetch Google profile");
    }

    const googleUser = (await userInfoResponse.json()) as {
      sub: string;
      email?: string;
      email_verified?: boolean;
      name?: string;
      given_name?: string;
      family_name?: string;
      picture?: string;
    };

    if (!googleUser.email) {
      response.redirect(googleRedirect("no_email"));
      return;
    }

    if (googleUser.email_verified !== true) {
      response.redirect(googleRedirect("email_not_verified"));
      return;
    }

    const email = googleUser.email.toLowerCase();
    const userRepository = AppDataSource.getRepository(User);
    let user = await userRepository.findOne({
      where: { email, isRemoved: false },
    });

    if (user) {
      if (user.status !== "ACTIVE") {
        response.redirect(googleRedirect("account_inactive"));
        return;
      }

      if (user.passwordHash.length > 0) {
        response.redirect(googleRedirect("account_exists_use_password"));
        return;
      }
    } else {
      const name = (googleUser.name ?? googleUser.given_name ?? "Google User").trim();
      const parts = name.split(/\s+/);
      const firstName = googleUser.given_name ?? parts[0] ?? "Google";
      const lastName =
        googleUser.family_name ?? parts.slice(1).join(" ");

      user = userRepository.create({
        firstName: firstName.slice(0, 50),
        lastName: lastName.slice(0, 50),
        userName: email.split("@")[0]?.slice(0, 100) || "google-user",
        email,
        passwordHash: "",
        role: "CUSTOMER",
        status: "ACTIVE",
        profileImageUrl: googleUser.picture,
      });

      try {
        await userRepository.save(user);
      } catch {
        const existing = await userRepository.findOne({
          where: { email, isRemoved: false },
        });

        if (!existing || existing.passwordHash.length > 0) {
          response.redirect(googleRedirect("account_exists_use_password"));
          return;
        }

        user = existing;
      }
    }

    const tokens = await createSession(AppDataSource.manager, user);

    setAuthCookies(response, tokens.accessToken, tokens.refreshToken);
    response.redirect(env.frontendUrl);
  } catch {
    response.redirect(googleRedirect("google_oauth_failed"));
  }
}
