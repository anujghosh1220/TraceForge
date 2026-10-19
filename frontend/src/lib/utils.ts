export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function formatDuration(ms: number | null | undefined): string {
  if (ms == null || Number.isNaN(ms)) return "—";
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`;
}

export function formatPercent(value: number | null | undefined, decimals = 0): string {
  if (value == null || Number.isNaN(value)) return "—";
  return (value * 100).toFixed(decimals) + "%";
}

export function shortId(id: string, len = 8): string {
  return id ? id.slice(0, len) : "—";
}

export function statusColor(status: string): { bg: string; text: string; border: string } {
  const s = (status || "").toLowerCase();
  if (s === "ok" || s === "completed" || s === "passed") {
    return { bg: "bg-green-900/20", text: "text-green-400", border: "border-green-500/30" };
  }
  if (s === "error" || s === "failed" || s === "failure") {
    return { bg: "bg-red-900/20", text: "text-red-400", border: "border-red-500/30" };
  }
  if (s === "running" || s === "pending") {
    return { bg: "bg-amber-900/20", text: "text-amber-400", border: "border-amber-500/30" };
  }
  return { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20" };
}

export function jsonValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  return JSON.stringify(value, null, 2);
}

export function truncate(str: string, max = 90): string {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "…" : str;
}
