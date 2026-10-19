import * as React from "react";
import { useResource } from "@/lib/hooks";
import { listRuns, projectMetrics } from "@/lib/api";
import { formatDuration, formatPercent, shortId, statusColor } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricCard, PassRateCard } from "@/components/ui/MetricCard";
import { Sparkline } from "@/components/ui/Sparkline";
import { type EvalRun } from "@/types";

interface OverviewProps {
  projectId: string | null;
  onViewRun: (id: string) => void;
}

export function Overview({ projectId, onViewRun }: OverviewProps) {
  const { data: runs, loading, error } = useResource<EvalRun[]>(
    (signal) => (projectId ? listRuns(projectId, signal) : Promise.resolve([])),
    [projectId],
  );
  const { data: metrics } = useResource<{ runs: number; completed: number }>(
    (signal) => (projectId ? projectMetrics(projectId, signal) : Promise.resolve({ runs: 0, completed: 0 })),
    [projectId],
  );

  const completedRuns = React.useMemo(() => (runs || []).filter((r) => r.status === "completed"), [runs]);
  const latestRun = completedRuns.length ? completedRuns[0] : null;
  const latestPassRate = latestRun?.metrics?.pass_rate ?? null;
  const failedRuns = (runs || []).filter((r) => (r.metrics?.failed ?? 0) > 0).length;
  const passRates = completedRuns.slice(0, 10).map((r) => r.metrics?.pass_rate ?? 0).filter((v) => v != null);

  const recent = (runs || []).slice(0, 6);

  if (!projectId) {
    return (
      <div className="rounded-lg border border-border-base bg-surface-base p-8 text-center">
        <EmptyState title="Select a project" description="Choose a project from the top bar to view its evaluation dashboard." />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Evaluation runs" value={metrics?.runs ?? 0} subtitle={metrics ? `${metrics.completed} completed` : "loading…"} />
        <MetricCard title="Datasets" value="—" subtitle="per project" />
        <PassRateCard rate={latestPassRate} />
        <MetricCard title="Failed runs" value={failedRuns} subtitle="runs with failures" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg border border-border-base bg-surface-base p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-ink">Pass rate trend</h2>
              <p className="text-xs text-ink-muted">Latest pass rate: {formatPercent(latestPassRate)}</p>
            </div>
            {completedRuns.length === 0 && <span className="text-xs text-ink-muted">No completed runs</span>}
          </div>
          <div className="h-24 w-full flex items-end gap-1.5 rounded-b-lg border border-t-0 border-border-base bg-surface-hover p-2 pt-0">
            {passRates.length > 0 ? (
              passRates.map((v, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-surface-hover"
                  style={{ height: `${Math.max(16, v * 100)}%`, backgroundColor: v >= 0.9 ? "#22c55e" : v >= 0.7 ? "#8b5cf6" : "#f59e0b" }}
                />
              ))
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-ink-muted">No completed runs</div>
            )}
          </div>
        </div>

        <Card padded={false}>
          <CardHeader>
            <CardTitle>Recent runs</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-ink-muted">
                    <th className="text-left py-3 px-4 font-medium">Run</th>
                    <th className="text-left py-3 px-4 font-medium">Profile</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Pass rate</th>
                    <th className="text-right py-3 px-4 font-medium">Duration</th>
                    <th className="py-3 px-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {recent.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-ink-muted">No runs yet. Run an evaluation from a dataset.</td>
                    </tr>
                  )}
                  {recent.map((r) => {
                    const st = statusColor(r.status);
                    const ms = r.started_at && r.completed_at ? new Date(r.completed_at).getTime() - new Date(r.started_at).getTime() : 0;
                    return (
                      <tr key={r.id} onClick={() => onViewRun(r.id)} className="cursor-pointer hover:bg-surface-hover/50">
                        <td className="py-3 px-4 font-mono text-xs text-ink-dim">{shortId(r.id)}</td>
                        <td className="py-3 px-4 text-ink">{r.profile}</td>
                        <td className="py-3 px-4"><Badge variant={r.status === "completed" ? "success" : r.status === "failed" ? "failure" : r.status === "pending" ? "neutral" : "running"}>{r.status}</Badge></td>
                        <td className="py-3 px-4 text-right font-mono text-xs">{r.metrics?.pass_rate == null ? "—" : formatPercent(r.metrics.pass_rate)}</td>
                        <td className="py-3 px-4 text-right text-xs text-ink-muted">{r.completed_at ? formatDuration(Math.max(0, ms)) : "—"}</td>
                        <td className="py-3 px-4 text-right"><button className="text-accent-violet underline underline-offset-4 text-xs hover:text-violet-400" onClick={(e) => { e.stopPropagation(); onViewRun(r.id); }}>View</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-200">Failed to load overview: {error}</div>}
    </div>
  );
}
