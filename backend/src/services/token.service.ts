import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../errors/AppError.js";
import type { UserRole } from "../types/user.js";

export interface AccessTokenPayload {
  sub: string;
  role: UserRole;
  type: "access";
}

export interface RefreshTokenPayload {
  sub: string;
  sessionId: string;
  type: "refresh";
}

const ROLES: UserRole[] = ["CUSTOMER", "VENDOR", "ADMIN"];

const DURATION_UNITS: Record<string, number> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

function requireValue(value: string | undefined, name: string): string {
  if (value === undefined || value === "") {
    throw new Error(`${name} is required for authentication.`);
  }

  return value;
}

export function parseDurationMs(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value);

  if (match === null) {
    throw new Error(`Invalid duration "${value}". Use a value like 15m or 7d.`);
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const multiplier = DURATION_UNITS[unit];

  if (multiplier === undefined) {
    throw new Error(`Invalid duration unit "${unit}".`);
  }

  return amount * multiplier;
}

function accessTokenTtlMs(): number {
  return parseDurationMs(
    requireValue(env.jwtAccessTokenExpiry, "JWT_ACCESS_TOKEN_EXPIRY"),
  );
}

function refreshTokenTtlMs(): number {
  return parseDurationMs(
    requireValue(env.jwtRefreshTokenExpiry, "JWT_REFRESH_TOKEN_EXPIRY"),
  );
}

export function getAccessCookieMaxAgeMs(): number {
  return accessTokenTtlMs();
}

export function getRefreshCookieMaxAgeMs(): number {
  return refreshTokenTtlMs();
}

function signToken(payload: object, secret: string, ttlMs: number): string {
  return jwt.sign(payload, secret, {
    expiresIn: Math.floor(ttlMs / 1_000),
  });
}

export function createAccessToken(user: {
  id: string;
  role: UserRole;
}): string {
  return signToken(
    {
      sub: user.id,
      role: user.role,
      type: "access",
    } satisfies AccessTokenPayload,
    requireValue(env.jwtAccessTokenSecret, "JWT_ACCESS_TOKEN_SECRET"),
    accessTokenTtlMs(),
  );
}

export function createRefreshToken(
  userId: string,
  sessionId: string,
): { token: string; expiresAt: Date } {
  const ttlMs = refreshTokenTtlMs();
  const token = signToken(
    {
      sub: userId,
      sessionId,
      type: "refresh",
    } satisfies RefreshTokenPayload,
    requireValue(env.jwtRefreshTokenSecret, "JWT_REFRESH_TOKEN_SECRET"),
    ttlMs,
  );

  return {
    token,
    expiresAt: new Date(Date.now() + ttlMs),
  };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const secret = requireValue(
    env.jwtAccessTokenSecret,
    "JWT_ACCESS_TOKEN_SECRET",
  );

  try {
    const decoded = jwt.verify(token, secret);

    if (typeof decoded !== "object" || decoded === null) {
      throw new Error("Malformed access token");
    }

    if (
      decoded.type !== "access" ||
      typeof decoded.sub !== "string" ||
      !ROLES.includes(decoded.role as UserRole)
    ) {
      throw new Error("Malformed access token");
    }

    return {
      sub: decoded.sub,
      role: decoded.role as UserRole,
      type: "access",
    };
  } catch {
    throw new AppError("Invalid or expired access token", 401);
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const secret = requireValue(
    env.jwtRefreshTokenSecret,
    "JWT_REFRESH_TOKEN_SECRET",
  );

  try {
    const decoded = jwt.verify(token, secret);

    if (typeof decoded !== "object" || decoded === null) {
      throw new Error("Malformed refresh token");
    }

    if (
      decoded.type !== "refresh" ||
      typeof decoded.sub !== "string" ||
      typeof decoded.sessionId !== "string"
    ) {
      throw new Error("Malformed refresh token");
    }

    return {
      sub: decoded.sub,
      sessionId: decoded.sessionId,
      type: "refresh",
    };
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }
}
