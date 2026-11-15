import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronUp, ChevronDown, MoreHorizontal } from "lucide-react";

export interface ColumnDef<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  width?: string;
  className?: string;
}

export interface AdminDataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyAccessor: (row: T) => string;
  onRowClick?: (row: T) => void;
  selection?: {
    selectedKeys: Set<string>;
    onSelectionChange: (keys: Set<string>) => void;
  };
  sorting?: {
    column: string;
    direction: "asc" | "desc";
    onSort: (column: string, direction: "asc" | "desc") => void;
  };
  loading?: boolean;
  emptyState?: React.ReactNode;
  rowActions?: (row: T) => React.ReactNode;
  rowClassName?: (row: T) => string;
  dense?: boolean;
}

function AdminDataTableInner<T>({
  columns,
  data,
  keyAccessor,
  onRowClick,
  selection,
  sorting,
  loading,
  emptyState,
  rowActions,
  rowClassName,
  dense = false,
}: AdminDataTableProps<T>) {
  const tableRef = useRef<HTMLTableElement>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
  const [focusedCellIndex, setFocusedCellIndex] = useState(-1);

  const selectedKeys = selection?.selectedKeys ?? new Set();
  const onSelectionChange = selection?.onSelectionChange;

  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return;
    if (selectedKeys.size === data.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map(keyAccessor)));
    }
  }, [data, keyAccessor, onSelectionChange, selectedKeys.size]);

  const handleRowSelect = useCallback(
    (key: string) => {
      if (!onSelectionChange) return;
      const newSelection = new Set(selectedKeys);
      if (newSelection.has(key)) {
        newSelection.delete(key);
      } else {
        newSelection.add(key);
      }
      onSelectionChange(newSelection);
    },
    [onSelectionChange, selectedKeys]
  );

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedKeys.size > 0 && selectedKeys.size < data.length;
    }
  }, [selectedKeys, data.length]);

  const handleSort = useCallback(
    (columnKey: string) => {
      if (!sorting?.onSort) return;
      if (sorting.column === columnKey) {
        sorting.onSort(columnKey, sorting.direction === "asc" ? "desc" : "asc");
      } else {
        sorting.onSort(columnKey, "asc");
      }
    },
    [sorting]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!tableRef.current || event.target !== tableRef.current) return;

      const rows = data.length;
      if (rows === 0) return;

      let newRowIndex = focusedRowIndex;
      let newCellIndex = focusedCellIndex;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          newRowIndex = Math.min(focusedRowIndex + 1, rows - 1);
          break;
        case "ArrowUp":
          event.preventDefault();
          newRowIndex = Math.max(focusedRowIndex - 1, -1);
          break;
        case "ArrowRight":
          event.preventDefault();
          newCellIndex = Math.min(focusedCellIndex + 1, columns.length - 1 + (selection ? 1 : 0) + (rowActions ? 1 : 0));
          break;
        case "ArrowLeft":
          event.preventDefault();
          newCellIndex = Math.max(focusedCellIndex - 1, -1);
          break;
        case "Enter":
        case " ":
          if (focusedRowIndex >= 0 && onRowClick) {
            event.preventDefault();
            onRowClick(data[focusedRowIndex]);
          }
          break;
        case "Home":
          event.preventDefault();
          newRowIndex = 0;
          break;
        case "End":
          event.preventDefault();
          newRowIndex = rows - 1;
          break;
      }

      if (newRowIndex !== focusedRowIndex) {
        setFocusedRowIndex(newRowIndex);
        setFocusedCellIndex(-1);
      } else if (newCellIndex !== focusedCellIndex) {
        setFocusedCellIndex(newCellIndex);
      }
    };

    tableRef.current?.addEventListener("keydown", handleKeyDown);
    return () => tableRef.current?.removeEventListener("keydown", handleKeyDown);
  }, [data, columns, selection, rowActions, focusedRowIndex, focusedCellIndex, onRowClick]);

  const visibleColumns = columns.filter((col) => col.key !== "actions" || rowActions);

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border" ref={tableRef} tabIndex={0}>
          <thead>
            <tr className="border-b border-border">
              {selection && (
                <th className="px-4 py-3 w-12 text-center" aria-label="Select all rows">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    disabled
                  />
                </th>
              )}
              {visibleColumns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 font-medium text-text-secondary ${column.align === "center" ? "text-center" : column.align === "right" ? "text-right" : ""} ${column.className ?? ""}`}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {selection && <td className="px-4 py-3 w-12 text-center" />}
                {visibleColumns.map((column) => (
                  <td key={column.key} className={`px-4 py-3 ${column.align === "center" ? "text-center" : column.align === "right" ? "text-right" : ""}`}>
                    <div className="h-4 bg-border/50 rounded w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-8 text-center">
        {emptyState ?? (
          <div className="flex flex-col items-center gap-2 text-text-secondary">
            <MoreHorizontal className="h-12 w-12 text-border" aria-hidden="true" />
            <p className="text-sm">No data available</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border" ref={tableRef} tabIndex={0}>
        <thead>
          <tr className="border-b border-border bg-surface/50">
            {selection && (
              <th className="px-4 py-3 w-12 text-center" aria-label="Select all rows">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  checked={selectedKeys.size === data.length && data.length > 0}
                  onChange={handleSelectAll}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {visibleColumns.map((column) => (
              <th
                key={column.key}
                className={`
                  px-4 py-3 font-medium text-text-secondary
                  ${column.align === "center" ? "text-center" : column.align === "right" ? "text-right" : ""}
                  ${column.sortable ? "cursor-pointer hover:text-text-primary select-none" : ""}
                  ${column.className ?? ""}
                `}
                style={{ width: column.width }}
                onClick={column.sortable ? () => handleSort(column.key) : undefined}
                aria-sort={sorting?.column === column.key ? (sorting.direction === "asc" ? "ascending" : "descending") : "none"}
              >
                <div className="flex items-center justify-center gap-1">
                  {column.header}
                  {column.sortable && sorting?.column === column.key && (
                    sorting.direction === "asc" ? (
                      <ChevronUp className="h-4 w-4 text-primary" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-primary" aria-hidden="true" />
                    )
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row, rowIndex) => {
            const rowKey = keyAccessor(row);
            const isSelected = selectedKeys.has(rowKey);
            const isFocused = focusedRowIndex === rowIndex;

            return (
              <tr
                key={rowKey}
                className={`
                  transition-colors duration-150
                  ${isSelected ? "bg-primary/5" : ""}
                  ${isFocused ? "bg-primary/10 outline-none ring-2 ring-primary ring-offset-2 ring-offset-surface" : ""}
                  ${rowClassName ? rowClassName(row) : ""}
                  ${onRowClick ? "cursor-pointer hover:bg-surface-hover" : ""}
                `}
                onClick={() => onRowClick?.(row)}
                onKeyDown={() => {}}
                onMouseEnter={() => setFocusedRowIndex(rowIndex)}
                onMouseLeave={() => setFocusedRowIndex(-1)}
              >
                {selection && (
                  <td className="px-4 py-3 w-12 text-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      checked={isSelected}
                      onChange={() => handleRowSelect(rowKey)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select row ${rowIndex + 1}`}
                    />
                  </td>
                )}
                {visibleColumns.map((column, colIndex) => (
                  <td
                    key={column.key}
                    className={`
                      px-4 py-3
                      ${column.align === "center" ? "text-center" : column.align === "right" ? "text-right" : ""}
                      ${dense ? "py-2" : ""}
                    `}
                    tabIndex={focusedRowIndex === rowIndex && focusedCellIndex === colIndex + (selection ? 1 : 0) ? 0 : -1}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export const AdminDataTable = AdminDataTableInner as typeof AdminDataTableInner & { displayName: string };
AdminDataTable.displayName = "AdminDataTable";