import * as React from "react";
import { useApp } from "@/lib/appContext";
import { useResource, useMutation } from "@/lib/hooks";
import { listRuns, createComparison } from "@/lib/api";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { JsonViewer } from "@/components/ui/JsonViewer";
import { Badge } from "@/components/ui/Badge";
import { formatPercent, shortId } from "@/lib/utils";
import { type EvalRun, type Comparison } from "@/types";

export function ComparePage() {
  const { selectedProject, refresh } = useApp();
  const [baseRun, setBaseRun] = React.useState("");
  const [candRun, setCandRun] = React.useState("");
  const [comparison, setComparison] = React.useState<Comparison | null>(null);
  const create = useMutation();

  const { data: runs } = useResource<EvalRun[]>(
    (signal) => (selectedProject ? listRuns(selectedProject, signal) : Promise.resolve([])),
    [selectedProject, refresh],
  );

  const doCompare = async () => {
    if (!selectedProject || !baseRun || !candRun) return;
    const result = await create.run(() => createComparison(selectedProject, { base_run_id: baseRun, candidate_run_id: candRun }));
    if (result) setComparison(result as Comparison);
  };

  if (!selectedProject) {
    return (
      <div className="rounded-lg border border-border-base bg-surface-base p-8 text-center">
        <EmptyState title="Select a project" description="Choose a project from the top bar to compare its evaluation runs." />
      </div>
    );
  }

  const runOptions = runs || [];

  return (
    <div>
      <PageHeader title="Comparisons" description="Compare evaluation runs side by side to find regressions and improvements." />
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <Select value={baseRun} onChange={(e) => { setBaseRun(e.target.value); setComparison(null); }}>
          <option value="">Base run</option>
          {runOptions.map((r) => (
            <option key={r.id} value={r.id}>
              {shortId(r.id)} · {r.profile} · {r.status}
            </option>
          ))}
        </Select>
        <Select value={candRun} onChange={(e) => { setCandRun(e.target.value); setComparison(null); }}>
          <option value="">Candidate run</option>
          {runOptions.map((r) => (
            <option key={r.id} value={r.id}>
              {shortId(r.id)} · {r.profile} · {r.status}
            </option>
          ))}
        </Select>
        <Button variant="violet" onClick={doCompare} disabled={create.loading || !baseRun || !candRun}>
          {create.loading ? "Comparing…" : "Compare"}
        </Button>
      </div>

      {comparison && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-border-base bg-surface-base p-4">
              <div className="text-xs text-ink-muted mb-1">Pass rate delta</div>
              <div className={`text-2xl font-semibold ${(comparison.result?.pass_rate_delta as number) >= 0 ? "text-green-400" : "text-red-400"}`}>
                {(comparison.result?.pass_rate_delta as number) >= 0 ? "+" : ""}{formatPercent(comparison.result?.pass_rate_delta as number)}
              </div>
            </div>
            <div className="rounded-lg border border-border-base bg-surface-base p-4">
              <div className="text-xs text-ink-muted mb-1">Regressions</div>
              <div className="text-2xl font-semibold text-red-400">{(comparison.result?.regressions as unknown[])?.length ?? 0}</div>
            </div>
            <div className="rounded-lg border border-border-base bg-surface-base p-4">
              <div className="text-xs text-ink-muted mb-1">Improvements</div>
              <div className="text-2xl font-semibold text-green-400">{(comparison.result?.improvements as unknown[])?.length ?? 0}</div>
            </div>
          </div>

          <div className="rounded-lg border border-border-base bg-surface-base p-4">
            <h3 className="text-sm font-semibold text-ink mb-3">Changed cases</h3>
            <DataTable
              columns={[
                { key: "test_case_id", header: "Test case", cell: (row: any) => <span className="font-mono text-xs text-ink-dim">{shortId(row.test_case_id)}</span> },
                {
                  key: "base", header: "Base", cell: (row: any) => (
                    <Badge variant={row.base_passed ? "success" : "failure"}>{row.base_passed ? "PASS" : "FAIL"}</Badge>
                  ),
                },
                {
                  key: "candidate", header: "Candidate", cell: (row: any) => (
                    <Badge variant={row.candidate_passed ? "success" : "failure"}>{row.candidate_passed ? "PASS" : "FAIL"}</Badge>
                  ),
                },
              ]}
              data={(comparison.result?.changed_cases as unknown[]) || []}
              emptyMessage="No changed cases between the two runs."
            />
          </div>

          <div className="rounded-lg border border-border-base bg-surface-base p-4">
            <h3 className="text-sm font-semibold text-ink mb-3">Full result</h3>
            <JsonViewer value={comparison.result} />
          </div>
        </div>
      )}

      {!comparison && runOptions.length >= 2 && (
        <div className="rounded-lg border border-border-base bg-surface-base p-8 text-center">
          <EmptyState title="No comparison yet" description="Select a base and candidate run, then click Compare." />
        </div>
      )}
    </div>
  );
}