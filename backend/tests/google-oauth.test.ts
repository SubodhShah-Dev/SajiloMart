import { OAuth2Client } from "google-auth-library";
import { describe, expect, it } from "vitest";

import { env } from "../src/config/env.js";
import {
  buildGoogleAuthUrl,
  getGoogleCallbackUrl,
  toGoogleUserProfile,
} from "../src/services/google-oauth.service.js";

const client = new OAuth2Client({
  clientId: "test-client-id",
  clientSecret: "test-client-secret",
  redirectUri: "http://localhost:4000/api/auth/google/callback",
});

describe("buildGoogleAuthUrl", () => {
  it("keeps the existing Google authorization parameters", () => {
    const url = new URL(buildGoogleAuthUrl(client, "state-123"));

    expect(`${url.origin}${url.pathname}`).toBe(
      "https://accounts.google.com/o/oauth2/v2/auth",
    );
    expect(url.searchParams.get("client_id")).toBe("test-client-id");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "http://localhost:4000/api/auth/google/callback",
    );
    expect(url.searchParams.get("scope")).toBe("openid email profile");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("access_type")).toBe("offline");
    expect(url.searchParams.get("prompt")).toBe("consent");
    expect(url.searchParams.get("state")).toBe("state-123");
  });
});

describe("getGoogleCallbackUrl", () => {
  it("points at the existing callback route", () => {
    expect(getGoogleCallbackUrl()).toBe(
      `${env.backendUrl}/api/auth/google/callback`,
    );
  });
});

describe("toGoogleUserProfile", () => {
  it("maps the verified ID token claims", () => {
    const profile = toGoogleUserProfile({
      iss: "https://accounts.google.com",
      aud: "test-client-id",
      iat: 1_700_000_000,
      exp: 1_700_003_600,
      sub: "google-sub-1",
      email: "Buyer@Example.com",
      email_verified: true,
      name: "Test Buyer",
      given_name: "Test",
      family_name: "Buyer",
      picture: "https://example.com/avatar.png",
    });

    expect(profile).toEqual({
      sub: "google-sub-1",
      email: "Buyer@Example.com",
      email_verified: true,
      name: "Test Buyer",
      given_name: "Test",
      family_name: "Buyer",
      picture: "https://example.com/avatar.png",
    });
  });

  it("treats a missing email_verified claim as unverified", () => {
    const profile = toGoogleUserProfile({
      iss: "https://accounts.google.com",
      aud: "test-client-id",
      iat: 1_700_000_000,
      exp: 1_700_003_600,
      sub: "google-sub-2",
      email: "buyer@example.com",
    });

    expect(profile?.email_verified).toBe(false);
  });

  it("rejects an empty payload", () => {
    expect(toGoogleUserProfile(undefined)).toBeNull();
  });

  it("rejects a payload without a Google account identifier", () => {
    expect(
      toGoogleUserProfile({
        iss: "https://accounts.google.com",
        aud: "test-client-id",
        iat: 1_700_000_000,
        exp: 1_700_003_600,
        sub: "",
        email: "buyer@example.com",
      }),
    ).toBeNull();
  });
});
