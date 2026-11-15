import { Button } from "../../components/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select } from "../../components/ui";
import { Fragment } from "react";

interface AdminPaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  loading?: boolean;
}

export const AdminPagination = ({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  loading,
}: AdminPaginationProps) => {
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)
  );

  return (
    <div className="p-4 sm:p-5 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
      <span className="text-sm text-text-secondary">
        Showing {start} to {end} of {total} stores
      </span>
      <div className="flex items-center gap-2 flex-wrap">
        <Select
          value={String(limit)}
          onChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
          options={[
            { value: "10", label: "10" },
            { value: "20", label: "20" },
            { value: "50", label: "50" },
            { value: "100", label: "100" },
          ]}
          className="w-24"
          placeholder="Per page"
        />
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={page === 1 || loading}
            aria-label="First page"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1 || loading}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          {visiblePages.map((p, index) => {
            const prevPage = visiblePages[index - 1];
            const showEllipsis = prevPage && p - prevPage > 1;
            return (
              <Fragment key={p}>
                {showEllipsis && (
                  <span className="px-2 text-text-muted">...</span>
                )}
                <Button
                  variant={page === p ? "primary" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(p)}
                  disabled={loading}
                  className="min-w-[40px]"
                >
                  {p}
                </Button>
              </Fragment>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages || loading}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages || loading}
            aria-label="Last page"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
};