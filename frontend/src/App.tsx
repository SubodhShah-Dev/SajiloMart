import { useCallback, useEffect, useState } from "react";

import { getHealth, type HealthData } from "./services/api";

type HealthState =
  | { status: "loading" }
  | { status: "ready"; data: HealthData }
  | { status: "error"; message: string };

const FOUNDATION_ITEMS = [
  "React + Vite frontend",
  "Express API",
  "Logging + error handling",
];

function formatUptime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)} seconds`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  return `${minutes}m ${remainingSeconds}s`;
}

function formatCheckedAt(timestamp: string): string {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export default function App() {
  const [health, setHealth] = useState<HealthState>({ status: "loading" });
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getHealth(controller.signal)
      .then((data) => {
        setHealth({ status: "ready", data });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setHealth({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unable to reach the API.",
        });
      });

    return () => {
      controller.abort();
    };
  }, [requestVersion]);

  const refreshHealth = useCallback(() => {
    setHealth({ status: "loading" });
    setRequestVersion((version) => version + 1);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(28,25,23,0.10)_1px,transparent_0)] bg-size-[22px_22px] mask-[linear-gradient(to_bottom,black,transparent_78%)]"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-900/10 pb-5">
          <div className="flex items-center gap-3">
            <img
              src="/favicon.svg"
              alt=""
              width="40"
              height="40"
              className="h-10 w-10"
            />
            <div>
              <p className="font-display text-xl font-semibold tracking-tight text-stone-950">
                SajiloMart
              </p>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-stone-500">
                Nepal · Multi-vendor marketplace
              </p>
            </div>
          </div>

          <span className="rounded-full border border-emerald-900/15 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-800">
            Sprint 1 · Foundation
          </span>
        </header>

        <main className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:py-20">
          <section>
            <p className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              Foundations online
            </p>

            <h1 className="max-w-xl font-display text-5xl leading-[1.02] tracking-[-0.03em] text-stone-950 sm:text-6xl">
              A simpler marketplace, built one solid sprint at a time.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-stone-600 sm:text-lg">
              The SajiloMart monorepo is running. This first sprint establishes
              the React frontend, Express API, request logging, and a health
              check — without shipping storefront or account features yet.
            </p>

            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3">
              {FOUNDATION_ITEMS.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 text-sm font-medium text-stone-700"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    className="h-4 w-4 text-emerald-700"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 10 3 3 7-7" />
                  </svg>
                  {item}
                </span>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="api-status-heading"
            className="rounded-[28px] border border-stone-900/10 bg-white/85 p-6 shadow-[0_24px_70px_-40px_rgba(28,25,23,0.45)] backdrop-blur sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                  Live check
                </p>
                <h2
                  id="api-status-heading"
                  className="mt-1 font-display text-2xl text-stone-950"
                >
                  API status
                </h2>
              </div>

              {health.status === "loading" && (
                <span className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-stone-500" />
                  Checking
                </span>
              )}

              {health.status === "ready" && (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  Connected
                </span>
              )}

              {health.status === "error" && (
                <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
                  <span className="h-2 w-2 rounded-full bg-red-600" />
                  Offline
                </span>
              )}
            </div>

            <div aria-live="polite" className="mt-6">
              {health.status === "loading" && (
                <div className="space-y-3">
                  <p className="text-sm text-stone-600">
                    Contacting the backend health endpoint…
                  </p>
                  <div className="h-3 w-2/3 animate-pulse rounded-full bg-stone-200" />
                  <div className="h-3 w-1/2 animate-pulse rounded-full bg-stone-200" />
                  <div className="h-10 w-full animate-pulse rounded-xl bg-stone-100" />
                </div>
              )}

              {health.status === "error" && (
                <div>
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                    <p className="font-semibold text-red-900">
                      API unreachable
                    </p>
                    <p className="mt-1 text-sm leading-6 text-red-800">
                      {health.message}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={refreshHealth}
                    className="mt-5 inline-flex items-center justify-center rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-stone-700"
                  >
                    Retry connection
                  </button>
                  <p className="mt-4 text-xs leading-5 text-stone-500">
                    Start the API with{" "}
                    <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[11px] text-stone-700">
                      npm run dev:backend
                    </code>
                  </p>
                </div>
              )}

              {health.status === "ready" && (
                <div>
                  <dl className="divide-y divide-stone-900/10 text-sm">
                    <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
                      <dt className="text-stone-500">Environment</dt>
                      <dd className="font-medium capitalize text-stone-900">
                        {health.data.environment}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-3">
                      <dt className="text-stone-500">Service</dt>
                      <dd className="font-mono text-xs font-medium text-stone-900">
                        {health.data.service}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-3">
                      <dt className="text-stone-500">Uptime</dt>
                      <dd className="font-medium text-stone-900">
                        {formatUptime(health.data.uptime)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-3">
                      <dt className="text-stone-500">Checked</dt>
                      <dd className="font-medium text-stone-900">
                        {formatCheckedAt(health.data.timestamp)}
                      </dd>
                    </div>
                  </dl>

                  <button
                    type="button"
                    onClick={refreshHealth}
                    className="mt-5 w-full rounded-xl border border-stone-900/15 px-4 py-2.5 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-100"
                  >
                    Check again
                  </button>
                </div>
              )}
            </div>

            <p className="mt-6 border-t border-stone-900/10 pt-4 text-xs leading-5 text-stone-500">
              No catalog, accounts, or database yet. Those begin in later
              sprints.
            </p>
          </section>
        </main>

        <footer className="flex flex-col gap-1 border-t border-stone-900/10 pt-5 text-xs leading-6 text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Sprint 1 of 18 · Foundation only</p>
          <p>Next milestone: public product catalog</p>
        </footer>
      </div>
    </div>
  );
}
