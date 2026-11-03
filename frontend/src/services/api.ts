export interface HealthData {
  status: string;
  service: string;
  environment: string;
  timestamp: string;
  uptime: number;
}

interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiFailure {
  success: false;
  error: {
    message: string;
  };
}

const DEFAULT_API_BASE_URL = "http://localhost:5000";

const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL
).replace(/\/$/, "");

function isApiSuccess<T>(value: unknown): value is ApiSuccess<T> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as { success?: unknown; data?: unknown };

  return candidate.success === true && candidate.data !== undefined;
}

function isApiFailure(value: unknown): value is ApiFailure {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as { success?: unknown; error?: unknown };

  if (typeof candidate.error !== "object" || candidate.error === null) {
    return false;
  }

  const error = candidate.error as { message?: unknown };

  return candidate.success === false && typeof error.message === "string";
}

export async function getHealth(signal?: AbortSignal): Promise<HealthData> {
  const response = await fetch(`${apiBaseUrl}/api/health`, {
    headers: { Accept: "application/json" },
    signal,
  });

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok || !isApiSuccess<HealthData>(body)) {
    const message = isApiFailure(body)
      ? body.error.message
      : `Health request failed with status ${response.status}.`;

    throw new Error(message);
  }

  return body.data;
}
