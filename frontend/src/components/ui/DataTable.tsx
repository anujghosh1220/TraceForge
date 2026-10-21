import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/cn";

type SortDirection = "asc" | "desc";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  pageSize?: number;
  searchable?: boolean;
  rowActions?: {
    label: string;
    variant?: "default" | "violet" | "red" | "ghost" | "green";
    onClick: (row: T) => void;
  }[];
  "aria-label"?: string;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = "No records found.",
  pageSize = 10,
  searchable = true,
  rowActions,
  "aria-label": ariaLabel,
}: DataTableProps<T>) {
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState<{ key: string; dir: SortDirection } | null>(null);
  const [page, setPage] = React.useState(1);

  const searchableCols = columns.filter(() => searchable);
  const filtered = React.useMemo(() => {
    if (!search) return data.slice();
    const q = search.toLowerCase();
    return data.filter((row) =>
      searchableCols.some((c) => {
        const rendered = String(c.cell(row));
        return rendered.toLowerCase().includes(q);
      }),
    );
  }, [data, search, searchableCols]);

  const sorted = React.useMemo(() => {
    if (!sort) return filtered.slice();
    return [...filtered].sort((a, b) => {
      const av = String(cells(a, sort.key)).toLowerCase();
      const bv = String(cells(b, sort.key)).toLowerCase();
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sort]);

  function cells(row: T, key: string): unknown {
    const col = columns.find((c) => c.key === key);
    return col ? col.cell(row) : "";
  }

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageData = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) {
    return (
      <div className="rounded-lg border border-border-base bg-surface-base overflow-hidden">
        <div className="p-4 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-surface-hover rounded w-full animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (sorted.length === 0) {
    return <div className="rounded-lg border border-border-base bg-surface-base p-8 text-center"><span className="text-ink-muted text-sm">{emptyMessage}</span></div>;
  }

  return (
    <div className="rounded-lg border border-border-base bg-surface-base flex flex-col">
      <div className="border-b border-border-base p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {searchable && (
          <div className="relative w-full md:w-72">
            <input
              type="search"
              placeholder="Search…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-md border border-border-base bg-surface-hover px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent-violet"
              aria-label="Search"
            />
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label={ariaLabel}>
          <thead className="border-b border-border-base bg-surface-hover/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn("px-4 py-3 text-left text-xs font-medium text-ink-muted", col.className)}
                >
                  <button
                    onClick={() => {
                      if (!col.sortable) return;
                      setSort((s) => (s && s.key === col.key && s.dir === "asc" ? { key: col.key, dir: "desc" } : { key: col.key, dir: "asc" }));
                      setPage(1);
                    }}
                    disabled={!col.sortable}
                    className="flex items-center gap-1 w-full text-left text-ink-muted hover:text-ink disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {col.header}
                    {col.sortable && sort?.key === col.key && (sort.dir === "asc" ? <ChevronUp size={12} className="ml-1" /> : <ChevronDown size={12} className="ml-1" />)}
                  </button>
                </th>
              ))}
              {rowActions && <th className="px-4 py-3 text-right w-24" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-base">
            {pageData.map((row, i) => (
              <tr key={String((row as { id?: string }).id ?? i)} className="hover:bg-surface-hover/50 transition-colors group">
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-4 py-3 text-ink", col.className)}>
                    {col.cell(row)}
                  </td>
                ))}
                {rowActions && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      {rowActions.map((action) => (
                        <button
                          key={action.label}
                          onClick={() => action.onClick(row)}
                          className={cn(
                            "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                            action.variant === "red"
                              ? "text-red-400 hover:bg-red-900/20"
                              : action.variant === "green"
                                ? "text-green-400 hover:bg-green-900/20"
                                : action.variant === "violet"
                                  ? "text-accent-violet hover:bg-accent-violet/20 text-slate-950"
                                  : "text-ink-subtle hover:bg-surface-hover hover:text-ink",
                          )}
                          aria-label={`${action.label} ${String((row as { id?: string }).id ?? i)}`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-border-base bg-surface-hover/50 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="text-xs text-ink-muted">
          Showing <span className="font-medium text-ink">{Math.min((currentPage - 1) * pageSize + 1, sorted.length) || 0}</span>{" "}
          to <span className="font-medium text-ink">{Math.min(currentPage * pageSize, sorted.length)}</span> of{" "}
          <span className="font-medium text-ink">{sorted.length}</span> results
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-surface-hover hover:text-ink disabled:opacity-50 disabled:pointer-events-none"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-surface-hover hover:text-ink disabled:opacity-50 disabled:pointer-events-none"
          >
            Next
          </button>
          <span className="text-xs text-ink-muted">Page {currentPage} of {totalPages}</span>
        </div>
      </div>
    </div>
  );
}
