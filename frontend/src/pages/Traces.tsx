import { useApp } from "@/lib/appContext";
import { useResource } from "@/lib/hooks";
import { listTraces, listSpans } from "@/lib/api";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { JsonViewer } from "@/components/ui/JsonViewer";
import { Drawer } from "@/components/ui/Dialog";
import { formatDuration, shortId } from "@/lib/utils";
import { type Trace, type Span } from "@/types";

export function TracesPage() {
  const { selectedProject, selectedTrace, setSelectedTrace } = useApp();
  const { data: traces, error, loading } = useResource<Trace[]>(
    (signal) => (selectedProject ? listTraces(selectedProject, signal) : Promise.resolve([])),
    [selectedProject],
  );

  if (!selectedProject) {
    return (
      <div className="rounded-lg border border-border-base bg-surface-base p-8 text-center">
        <EmptyState title="Select a project" description="Choose a project from the top bar to inspect its traces." />
      </div>
    );
  }

  const columns = [
    {
      key: "operation",
      header: "Operation",
      cell: (row: Trace) => (
        <button
          onClick={() => setSelectedTrace(row)}
          className="text-accent-violet font-medium underline underline-offset-4 hover:text-violet-400 truncate block max-w-[200px]"
          title={row.operation}
        >
          {row.operation}
        </button>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row: Trace) => <Badge variant={row.status === "ok" ? "success" : row.status === "error" ? "failure" : "running"}>{row.status}</Badge>,
    },
    {
      key: "duration",
      header: "Duration",
      cell: (row: Trace) => <span className="font-mono text-xs text-ink-muted">{formatDuration(row.duration_ms)}</span>,
    },
    {
      key: "started",
      header: "Started",
      cell: (row: Trace) => <span className="text-ink-muted font-mono text-xs">{row.started_at.slice(0, 16)}</span>,
    },
  ];

  return (
    <div>
      <PageHeader title="Traces" description="Inspect trace and span activity for the selected project." />
      {error && <div className="mb-4 rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-200">{error}</div>}
      <DataTable
        columns={columns}
        data={traces || []}
        loading={loading}
        emptyMessage="No traces yet. Traces are recorded during evaluation runs."
        rowActions={[
          { label: "Inspect", variant: "violet", onClick: (row) => setSelectedTrace(row) },
        ]}
      />
      <TraceDetailDrawer trace={selectedTrace} onClose={() => setSelectedTrace(null)} />
    </div>
  );
}

function TraceDetailDrawer({ trace, onClose }: { trace: Trace | null; onClose: () => void }) {
  const { data: spans, loading } = useResource<Span[]>(
    (signal) => (trace ? listSpans(trace.id, signal) : Promise.resolve([])),
    [trace?.id],
  );

  return (
    <Drawer open={!!trace} onClose={onClose} title={trace ? trace.operation : "Trace detail"}>
      {trace && (
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={trace.status === "ok" ? "success" : "failure"}>{trace.status}</Badge>
              <span className="text-xs text-ink-muted font-mono">{shortId(trace.id)}</span>
            </div>
            <div className="text-xs text-ink-muted">
              Duration: <span className="font-mono text-ink">{formatDuration(trace.duration_ms)}</span>
            </div>
            <div className="text-xs text-ink-muted">
              Started: <span className="font-mono text-ink">{trace.started_at.slice(0, 19)}</span>
            </div>
            {trace.ended_at && (
              <div className="text-xs text-ink-muted">
                Ended: <span className="font-mono text-ink">{trace.ended_at.slice(0, 19)}</span>
              </div>
            )}
            {trace.error && (
              <div className="rounded-md border border-red-500/30 bg-red-900/20 p-3 text-xs text-red-300">
                <div className="font-medium mb-1">Error</div>
                {trace.error}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xs font-semibold text-ink mb-2">Input</h3>
            <JsonViewer value={trace.input_meta} />
          </div>

          <div>
            <h3 className="text-xs font-semibold text-ink mb-2">Output</h3>
            <JsonViewer value={trace.output_meta} />
          </div>

          <div>
            <h3 className="text-xs font-semibold text-ink mb-2">Spans</h3>
            {loading ? (
              <div className="text-xs text-ink-muted">Loading spans…</div>
            ) : (spans || []).length === 0 ? (
              <div className="text-xs text-ink-muted">No spans recorded for this trace.</div>
            ) : (
              <div className="space-y-2">
                {(spans || []).map((s) => {
                  const depth = (() => {
                    let d = 0;
                    let cur = s.parent_span_id;
                    const seen = new Set<string>();
                    while (cur && (spans || []).some((x) => x.id === cur) && !seen.has(cur)) {
                      seen.add(cur);
                      d += 1;
                      cur = (spans || []).find((x) => x.id === cur)?.parent_span_id ?? null;
                    }
                    return d;
                  })();
                  return (
                    <div key={s.id} className="rounded-md border border-border-base bg-surface-hover p-3" style={{ marginLeft: depth * 12 }}>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={s.status === "ok" ? "success" : "failure"}>{s.status}</Badge>
                        <span className="text-sm font-medium text-ink">{s.name}</span>
                        <span className="ml-auto text-xs font-mono text-ink-muted">{formatDuration(s.duration_ms)}</span>
                      </div>
                      {s.parent_span_id && (
                        <div className="text-[10px] text-ink-dim font-mono mb-1">parent: {shortId(s.parent_span_id)}</div>
                      )}
                      {s.error && <div className="text-xs text-red-300 mt-1">{s.error}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}