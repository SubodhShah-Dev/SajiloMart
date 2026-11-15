import { OAuth2Client } from "google-auth-library";
import type { TokenPayload } from "google-auth-library";

import { env } from "../config/env.js";

const GOOGLE_OAUTH_SCOPES = ["openid", "email", "profile"];

/**
 * The verified Google identity, using the same claim names the controller
 * previously read from the UserInfo response.
 */
export interface GoogleUserProfile {
  sub: string;
  email?: string;
  email_verified: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

/**
 * The single redirect URI used by both the authorization request and the token
 * exchange. It must match the URI registered in the Google Cloud Console.
 */
export function getGoogleCallbackUrl(): string {
  return `${env.backendUrl}/api/auth/google/callback`;
}

/**
 * Builds a client per request so no user-specific OAuth credentials are ever
 * held in a shared mutable client. Returns `null` when Google OAuth is not
 * configured.
 */
export function createGoogleOAuthClient(): OAuth2Client | null {
  const clientId = env.googleClientId;
  const clientSecret = env.googleClientSecret;

  if (!clientId || !clientSecret) {
    return null;
  }

  return new OAuth2Client({
    clientId,
    clientSecret,
    redirectUri: getGoogleCallbackUrl(),
  });
}

export function buildGoogleAuthUrl(client: OAuth2Client, state: string): string {
  return client.generateAuthUrl({
    access_type: "offline",
    scope: [...GOOGLE_OAUTH_SCOPES],
    prompt: "consent",
    state,
  });
}

/**
 * Narrows a verified ID token payload to the profile fields the rest of the
 * application uses. Returns `null` when the payload is unusable.
 */
export function toGoogleUserProfile(
  payload: TokenPayload | undefined,
): GoogleUserProfile | null {
  if (!payload || !payload.sub) {
    return null;
  }

  return {
    sub: payload.sub,
    email: payload.email,
    email_verified: payload.email_verified === true,
    name: payload.name,
    given_name: payload.given_name,
    family_name: payload.family_name,
    picture: payload.picture,
  };
}

/**
 * Exchanges the authorization code and verifies the returned ID token. The
 * verified claims are the trusted source of identity; the access token is not
 * used to call Google APIs.
 */
export async function exchangeGoogleCode(
  client: OAuth2Client,
  code: string,
  audience: string,
): Promise<GoogleUserProfile> {
  const { tokens } = await client.getToken(code);

  if (!tokens.id_token) {
    throw new Error("Google did not return an ID token.");
  }

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience,
  });

  const profile = toGoogleUserProfile(ticket.getPayload());

  if (!profile) {
    throw new Error("Google ID token payload is missing the account identifier.");
  }

  return profile;
}
