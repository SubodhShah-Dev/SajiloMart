import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config({
  path: fileURLToPath(new URL("../../.env", import.meta.url)),
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

function parseFrontendUrl(
  value: string | undefined,
  nodeEnv: NodeEnv,
): string {
  const fallback = nodeEnv === "production" ? undefined : "http://localhost:5173";
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

const nodeEnv = parseNodeEnv(process.env.NODE_ENV);

export const env = Object.freeze({
  nodeEnv,
  port: parsePort(process.env.PORT),
  frontendUrl: parseFrontendUrl(process.env.FRONTEND_URL, nodeEnv),
  isProduction: nodeEnv === "production",
  isTest: nodeEnv === "test",
});
