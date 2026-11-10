import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.resolve(import.meta.dirname, "../../.env"),
});

type NodeEnv = "development" | "test" | "production";

const NODE_ENVS: NodeEnv[] = ["development", "test", "production"];

function parseNodeEnv(value: string | undefined): NodeEnv {
  if (value === undefined || value === "") {
    return "development";
  }

  if (NODE_ENVS.includes(value as NodeEnv)) {
    return value as NodeEnv;
  }

  throw new Error(
    `Invalid NODE_ENV "${value}". Expected one of: ${NODE_ENVS.join(", ")}.`,
  );
}

function parsePort(value: string | undefined): number {
  const port = Number(value ?? "5000");

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(
      `Invalid PORT "${value ?? ""}". Expected an integer between 1 and 65535.`,
    );
  }

  return port;
}

function parseDbPort(value: string | undefined): number {
  const port = Number(value ?? "4000");

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(
      `Invalid DB_PORT "${value ?? ""}". Expected an integer between 1 and 65535.`,
    );
  }

  return port;
}

function parseBoolean(
  value: string | undefined,
  fallback: boolean,
  name: string,
): boolean {
  if (value === undefined || value === "") {
    return fallback;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new Error(`Invalid ${name} "${value}". Expected "true" or "false".`);
}

function parseBcryptRounds(value: string | undefined): number {
  const rounds = Number(value ?? "12");

  if (!Number.isInteger(rounds) || rounds < 10 || rounds > 14) {
    throw new Error(
      `Invalid BCRYPT_ROUNDS "${value ?? ""}". Expected an integer between 10 and 14.`,
    );
  }

  return rounds;
}

function parsePositiveInt(value: string | undefined, fallback: number, name: string): number {
  const parsed = Number(value ?? String(fallback));

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`Invalid ${name} "${value ?? ""}". Expected a positive integer.`);
  }

  return parsed;
}

function parseFrontendUrl(value: string | undefined, nodeEnv: NodeEnv): string {
  const fallback =
    nodeEnv === "production" ? undefined : "http://localhost:5173";
  const rawValue = value ?? fallback;

  if (rawValue === undefined || rawValue === "") {
    throw new Error("FRONTEND_URL is required in production.");
  }

  try {
    return new URL(rawValue).origin;
  } catch {
    throw new Error(
      `Invalid FRONTEND_URL "${rawValue}". Expected an absolute URL.`,
    );
  }
}

function parseBackendUrl(value: string | undefined, nodeEnv: NodeEnv): string {
  const fallback =
    nodeEnv === "production" ? undefined : "http://localhost:4000";
  const rawValue = value ?? fallback;

  if (rawValue === undefined || rawValue === "") {
    throw new Error("BACKEND_URL is required in production.");
  }

  try {
    return new URL(rawValue).origin;
  } catch {
    throw new Error(
      `Invalid BACKEND_URL "${rawValue}". Expected an absolute URL.`,
    );
  }
}

const nodeEnv = parseNodeEnv(process.env.NODE_ENV);

export const env = Object.freeze({
  nodeEnv,
  port: parsePort(process.env.PORT),
  frontendUrl: parseFrontendUrl(process.env.FRONTEND_URL, nodeEnv),
  isProduction: nodeEnv === "production",
  isTest: nodeEnv === "test",
  bcryptRounds: parseBcryptRounds(process.env.BCRYPT_ROUNDS),
  jwtAccessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
  jwtRefreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
  jwtAccessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY,
  jwtRefreshTokenExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRY,
  dbHost: process.env.DB_HOST,
  dbPort: parseDbPort(process.env.DB_PORT),
  dbUsername: process.env.DB_USERNAME,
  dbPassword: process.env.DB_PASSWORD,
  dbName: process.env.DB_DATABASE,
  dbSsl: parseBoolean(process.env.DB_SSL, true, "DB_SSL"),
  dbSslCaPath: process.env.DB_SSL_CA_PATH,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  backendUrl: parseBackendUrl(process.env.BACKEND_URL, nodeEnv),
  sellerUnverifiedListingLimit: parsePositiveInt(
    process.env.SELLER_UNVERIFIED_LISTING_LIMIT,
    5,
    "SELLER_UNVERIFIED_LISTING_LIMIT",
  ),
});
