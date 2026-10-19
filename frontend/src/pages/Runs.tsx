import * as React from "react";
import { useApp } from "@/lib/appContext";
import { listRuns, listResults } from "@/lib/api";
import { useResource } from "@/lib/hooks";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDuration, formatPercent, shortId, statusColor } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { type EvalRun } from "@/types";

export function RunsPage() {
  const { selectedProject, bumpRefresh, setSelectedRun, selectedRun } = useApp();

  if (!selectedProject) {
    return (
      <div className="rounded-lg border border-border-base bg-surface-base p-8 text-center flex flex-col items-center justify-center">
        <h2 className="text-sm font-semibold text-ink">Select a project</h2>
        <p className="text-sm text-ink-muted mt-1">Choose a project from the top bar to view its evaluation runs.</p>
      </div>
    );
  }

  const { data: runs, loading } = useResource<EvalRun[]>(
    (signal) => listRuns(selectedProject, signal),
    [selectedProject, bumpRefresh],
  );

  const columns = [
    { key: "id", header: "Run", cell: (row: EvalRun) => <span className="font-mono text-xs text-ink-dim truncate block" title={row.id}>{shortId(row.id)}</span> },
    { key: "profile", header: "Profile", cell: (row: EvalRun) => <span className="text-ink-muted text-xs">{row.profile}</span> },
    { key: "status", header: "Status", cell: (row: EvalRun) => <Badge variant={row.status === "completed" ? "success" : row.status === "failed" ? "failure" : row.status === "running" ? "running" : "neutral"}>{row.status}</Badge> },
    { key: "passRate", header: "Pass rate", cell: (row: EvalRun) => <span className="font-mono text-xs">{row.metrics?.pass_rate == null ? "—" : formatPercent(row.metrics.pass_rate)}</span> },
    { key: "duration", header: "Duration", cell: (row: EvalRun) => <span className="text-ink-muted text-xs">{row.completed_at && row.started_at ? formatDuration(Math.max(0, new Date(row.completed_at).getTime() - new Date(row.started_at).getTime())) : "—"}</span> },
    { key: "created", header: "Started", cell: (row: EvalRun) => <span className="text-ink-muted font-mono text-xs">{row.started_at ? row.started_at.slice(0, 16) : "—"}</span> },
  ];

  return (
    <div>
      <PageHeader title="Evaluation runs" description="View and open evaluation runs for the selected project." />
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <ButtonSmall onClick={() => bumpRefresh()}><ChevronRight size={14} /></ButtonSmall>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={runs || []}
        loading={loading}
        emptyMessage="No runs yet. Start an evaluation from a dataset."
        rowActions={[
          { label: "View", variant: "violet", onClick: (row) => setSelectedRun(row) },
        ]}
      />
      {selectedRun && selectedRun.project_id === selectedProject && (
        <RunDetail run={selectedRun} onClose={() => setSelectedRun(null)} bumpRefresh={bumpRefresh} />
      )}
    </div>
  );
}

function ButtonSmall({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="p-1.5 rounded-md text-ink-subtle hover:bg-surface-hover hover:text-ink">
      {children}
    </button>
  );
}

interface RunDetailProps {
  run: EvalRun;
  onClose: () => void;
  bumpRefresh: () => void;
}

function RunDetail({ run, onClose, bumpRefresh }: RunDetailProps) {
  const { data: results, loading } = useResource(
    (signal) => listResults(run.id, signal),
    [run.id, bumpRefresh],
  );

  const metrics = run.metrics || {};
  const total = metrics.total ?? results?.length ?? 0;
  const passed = metrics.passed ?? results?.filter((r) => r.passed).length ?? 0;
  const failed = metrics.failed ?? total - passed;
  const passRate = total ? passed / total : 0;
  const st = statusColor(run.status);

  return (
    <div className="mt-6 rounded-lg border border-border-base bg-surface-base overflow-hidden">
      <div className="border-b border-border-base bg-surface-hover/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
            <button onClick={onClose} className="p-1 hover:bg-surface-hover rounded-md">←</button>
            Run {shortId(run.id)}
          </h2>
          <p className="text-xs text-ink-muted">{run.profile} · {run.dataset_id.slice(0, 8)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`${st.border} ${st.bg} px-2 py-1 rounded text-[10px] font-medium ${st.text}`}>{run.status}</span>
          <span className="text-xs font-mono text-ink-muted">{total} cases · {formatPercent(passRate)} pass</span>
        </div>
      </div>
      <div className="p-4 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-base bg-surface-hover/50">
              <th className="text-left py-3 px-4 text-ink-muted font-medium">Case</th>
              <th className="text-left py-3 px-4 text-ink-muted font-medium">Result</th>
              <th className="text-right py-3 px-4 text-ink-muted font-medium">Latency</th>
              <th className="text-right py-3 px-4 text-ink-muted font-medium">Error</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-base">
            {(results || []).map((r) => (
              <tr key={r.id}>
                <td className="py-3 px-4 font-mono text-xs text-ink-dim truncate block" title={r.test_case_id}>{shortId(r.test_case_id)}</td>
                <td className="py-3 px-4"><span className={`font-medium ${r.passed ? "text-green-400" : "text-red-400"}`}>{r.passed ? "PASS" : "FAIL"}</span></td>
                <td className="py-3 px-4 text-right font-mono text-xs text-ink-muted">{r.latency_ms}ms</td>
                <td className="py-3 px-4 text-right text-xs text-red-400">{r.error || "—"}</td>
              </tr>
            ))}
            {(results || []).length === 0 && (
              <tr><td colSpan={4} className="py-6 text-center text-ink-muted">No results yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="border-t border-border-base bg-surface-hover/50 p-4 flex items-center justify-between">
        <div className="text-xs text-ink-muted">
          {run.error_summary ? <span className="text-red-400">{run.error_summary}</span> : `Completed {formatDuration(run.completed_at && run.started_at ? Math.max(0, new Date(run.completed_at).getTime() - new Date(run.started_at).getTime()) : 0)}`}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => bumpRefresh()} className="text-xs text-accent-violet underline underline-offset-4 hover:text-violet-400">Refresh</button>
        </div>
      </div>
    </div>
  );
}
