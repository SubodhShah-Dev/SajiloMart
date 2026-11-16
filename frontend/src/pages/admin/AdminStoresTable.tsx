import { useState } from "react";
import { Shield, ShieldCheck, ShieldAlert, Ban, XCircle, Clock, Eye, MoreVertical } from "lucide-react";
import { Badge, type BadgeProps } from "../../components/ui";
import { AdminDataTable, type ColumnDef } from "../../components/admin";
import type { AdminStoreSummary } from "../../services/api";

interface AdminStoresTableProps {
  stores: AdminStoreSummary[];
  loading: boolean;
  selection: {
    selectedKeys: Set<string>;
    onSelectionChange: (keys: Set<string>) => void;
  };
  sorting: {
    column: string;
    direction: "asc" | "desc";
    onSort: (column: string, direction: "asc" | "desc") => void;
  };
  onRowClick?: (store: AdminStoreSummary) => void;
  onVerify: (storeId: string) => void;
  onReject: (storeId: string) => void;
  onSuspend: (storeId: string) => void;
  onUnsuspend: (storeId: string) => void;
  onViewStorefront: (slug: string) => void;
  actionLoading?: string | null;
}

const getVerificationStatusBadge = (status: AdminStoreSummary["verificationStatus"]) => {
  const config: Record<AdminStoreSummary["verificationStatus"], { variant: BadgeProps["variant"]; label: string; icon: React.ReactNode }> = {
    UNVERIFIED: { variant: "danger", label: "Unverified", icon: <ShieldAlert className="h-3 w-3 shrink-0" aria-hidden="true" /> },
    PENDING: { variant: "warning", label: "Pending", icon: <Clock className="h-3 w-3 shrink-0" aria-hidden="true" /> },
    VERIFIED: { variant: "success", label: "Verified", icon: <ShieldCheck className="h-3 w-3 shrink-0" aria-hidden="true" /> },
    REJECTED: { variant: "default", label: "Rejected", icon: <XCircle className="h-3 w-3 shrink-0" aria-hidden="true" /> },
  };
  const c = config[status];
  return <Badge variant={c.variant} size="sm" className="gap-1">{c.icon}{c.label}</Badge>;
};

const getStoreStatusBadge = (status: AdminStoreSummary["status"]) => {
  const config: Record<AdminStoreSummary["status"], { variant: BadgeProps["variant"]; label: string }> = {
    PENDING: { variant: "warning", label: "Pending" },
    APPROVED: { variant: "success", label: "Approved" },
    SUSPENDED: { variant: "danger", label: "Suspended" },
  };
  const c = config[status];
  return <Badge variant={c.variant} size="sm">{c.label}</Badge>;
};

export const AdminStoresTable = ({
  stores,
  loading,
  selection,
  sorting,
  onRowClick,
  onVerify,
  onReject,
  onSuspend,
  onUnsuspend,
  onViewStorefront,
  actionLoading,
}: AdminStoresTableProps) => {
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const columns: ColumnDef<AdminStoreSummary>[] = [
    {
      key: "store",
      header: "Store",
      sortable: true,
      render: (store) => (
        <div>
          <div className="font-medium text-text-primary">{store.name}</div>
          <div className="text-sm text-text-secondary">@{store.slug}</div>
        </div>
      ),
    },
    {
      key: "owner",
      header: "Owner",
      sortable: true,
      render: (store) => (
        <div>
          <div className="font-medium text-text-primary">{store.owner.name}</div>
          <div className="text-sm text-text-secondary">@{store.owner.username} • {store.owner.email}</div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (store) => <span className="text-sm text-text-secondary">{store.category ?? "N/A"}</span>,
    },
    {
      key: "productCount",
      header: "Products",
      align: "center",
      sortable: true,
      render: (store) => <span className="text-sm text-text-secondary">{store.productCount}</span>,
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      sortable: true,
      render: (store) => getStoreStatusBadge(store.status),
    },
    {
      key: "verificationStatus",
      header: "Verification",
      align: "center",
      sortable: true,
      render: (store) => getVerificationStatusBadge(store.verificationStatus),
    },
    {
      key: "listingLimit",
      header: "Listing Limit",
      align: "center",
      render: (store) => (
        <span className="text-sm text-text-secondary">
          {store.listingLimit !== null ? store.listingLimit : "Unlimited"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      align: "center",
      sortable: true,
      render: (store) => <span className="text-sm text-text-secondary">{new Date(store.createdAt).toLocaleDateString()}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      render: (store) => (
        <div className="relative inline-block">
          <button
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setActionMenuOpen(actionMenuOpen === store.id ? null : store.id);
            }}
            disabled={actionLoading === store.id}
            aria-label={`Actions for ${store.name}`}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {actionMenuOpen === store.id && rowActions(store)}
        </div>
      ),
    },
  ];

  const rowActions = (store: AdminStoreSummary) => (
    <div className="absolute right-0 top-full mt-1 z-10 w-56 bg-surface border border-border rounded-lg shadow-lg py-1">
      {store.verificationStatus === "UNVERIFIED" || store.verificationStatus === "PENDING" || store.verificationStatus === "REJECTED" ? (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onVerify(store.id); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-success hover:bg-success/5"
            disabled={actionLoading === store.id}
          >
            <ShieldCheck className="h-4 w-4" />
            Verify
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onReject(store.id); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-accent hover:bg-accent/5"
            disabled={actionLoading === store.id}
          >
            <XCircle className="h-4 w-4" />
            Reject Verification
          </button>
        </>
      ) : (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onSuspend(store.id); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-accent hover:bg-accent/5"
            disabled={actionLoading === store.id}
          >
            <Ban className="h-4 w-4" />
            Suspend
          </button>
          {store.status === "SUSPENDED" && (
            <button
              onClick={(e) => { e.stopPropagation(); onUnsuspend(store.id); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-success hover:bg-success/5"
              disabled={actionLoading === store.id}
            >
              <ShieldCheck className="h-4 w-4" />
              Unsuspend
            </button>
          )}
        </>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onViewStorefront(store.slug); }}
        className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-surface-hover w-full border-t border-border"
      >
        <Eye className="h-4 w-4" />
        View Storefront
      </button>
    </div>
  );

  return (
    <AdminDataTable
      columns={columns}
      data={stores}
      keyAccessor={(store) => store.id}
      onRowClick={onRowClick}
      selection={selection}
      sorting={sorting}
      loading={loading}
      rowActions={rowActions}
      emptyState={
        <div className="p-8 text-center">
          <Shield className="h-12 w-12 text-border mx-auto mb-3" aria-hidden="true" />
          <p className="text-text-secondary">No stores found</p>
        </div>
      }
      rowClassName={(store) => store.status === "SUSPENDED" ? "opacity-60" : ""}
    />
  );
};