import { useState } from "react";
import type { ReactNode } from "react";

import { Badge } from "../ui";
import type { StoreSummary } from "../../services/api";
import { storeStatusMeta, verificationMeta } from "./storeStatus";

function storeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "SM";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

interface StoreHeaderProps {
  store: StoreSummary;
  actions?: ReactNode;
}

export const StoreHeader = ({ store, actions }: StoreHeaderProps) => {
  const [logoFailed, setLogoFailed] = useState(false);
  const status = storeStatusMeta(store.status);
  const verification = verificationMeta(store.verificationStatus);
  const showLogo = Boolean(store.logoUrl) && !logoFailed;

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        {showLogo ? (
          <img
            src={store.logoUrl ?? ""}
            alt=""
            onError={() => setLogoFailed(true)}
            className="h-14 w-14 flex-shrink-0 rounded-xl border border-border bg-surface object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-primary-light text-lg font-semibold text-primary"
          >
            {storeInitials(store.name)}
          </div>
        )}

        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight text-text-primary">
            {store.name}
          </h1>
          <p className="truncate font-mono text-sm text-text-muted">/{store.slug}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant={status.variant} size="sm" dot>
              {status.label}
            </Badge>
            <Badge variant={verification.variant} size="sm">
              {verification.label}
            </Badge>
          </div>
        </div>
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
};
