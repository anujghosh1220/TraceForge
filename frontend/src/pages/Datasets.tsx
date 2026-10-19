import * as React from "react";
import { useApp } from "@/lib/appContext";
import {
  createDataset,
  deleteDataset,
  listDatasets,
  updateDataset,
  listCases,
  createCase,
  updateCase,
  deleteCase,
  createRun,
} from "@/lib/api";
import { useMutation, useResource } from "@/lib/hooks";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatRelativeTime, shortId, statusColor } from "@/lib/utils";
import { type Dataset, type TestCase } from "@/types";

const PROFILES: string[] = ["correct", "incorrect", "invalid_json", "empty", "error"];

function DatasetNameCell({ row, onOpen }: { row: Dataset; onOpen: (id: string) => void }) {
  return (
    <button
      onClick={() => onOpen(row.id)}
      className="text-accent-violet font-medium underline underline-offset-4 hover:text-violet-400 truncate block"
      title={row.name}
    >
      {row.name}
    </button>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-2">
      <label className={`block text-xs font-medium text-ink-muted${required ? " text-ink" : ""}`}>{label}{required ? " *" : ""}</label>
      {children}
    </div>
  );
}

function CrudDialog({ open, title, onClose, children, submitLabel, onSubmit, loading, error }: {
  open: boolean; title: string; onClose: () => void; children: React.ReactNode;
  submitLabel: string; onSubmit: (e: React.FormEvent) => Promise<void>; loading: boolean; error: string | null;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <form onSubmit={onSubmit} className="space-y-4">
        {children}
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex justify-end gap-2 pt-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="violet" disabled={loading} type="submit">
            {loading ? "Working…" : submitLabel}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export function DatasetsPage() {
  const { selectedProject, refresh, bumpRefresh, setError } = useApp();
  const [openCreate, setOpenCreate] = React.useState(false);
  const [editRow, setEditRow] = React.useState<Dataset | null>(null);
  const [deleteRow, setDeleteRow] = React.useState<Dataset | null>(null);
  const [openDataset, setOpenDataset] = React.useState<string | null>(null);
  const [runNotice, setRunNotice] = React.useState<string | null>(null);

  if (!selectedProject) {
    return (
      <div className="rounded-lg border border-border-base bg-surface-base p-8 text-center flex flex-col items-center justify-center">
        <h2 className="text-sm font-semibold text-ink">Select a project</h2>
        <p className="text-sm text-ink-muted mt-1">Choose a project from the top bar to manage its datasets.</p>
      </div>
    );
  }

  const { data: datasets, loading: datasetsLoading } = useResource<Dataset[]>(
    (signal) => listDatasets(selectedProject, signal),
    [selectedProject, refresh],
  );

  const create = useMutation();
  const update = useMutation();
  const remove = useMutation();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const description = (form.elements.namedItem("description") as HTMLInputElement).value;
    const result = await create.run(() => createDataset(selectedProject!, { name, description: description || null }));
    if (result) { bumpRefresh(); setOpenCreate(false); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRow) return;
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const description = (form.elements.namedItem("description") as HTMLInputElement).value;
    const result = await update.run(() => updateDataset(editRow.id, { name, description: description || null }));
    if (result) { bumpRefresh(); setEditRow(null); }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteRow) return;
    const result = await remove.run(() => deleteDataset(deleteRow.id));
    if (result) { bumpRefresh(); setDeleteRow(null); if (openDataset === deleteRow.id) setOpenDataset(null); }
  };

  const datasetColumns = [
    { key: "name", header: "Name", cell: (row: Dataset) => <DatasetNameCell row={row} onOpen={setOpenDataset} /> },
    { key: "description", header: "Description", cell: (row: Dataset) => <span className="text-ink-muted">{row.description || "—"}</span> },
    { key: "created", header: "Created", cell: (row: Dataset) => <span className="text-ink-muted font-mono text-xs">{formatRelativeTime(row.created_at)}</span> },
  ];

  // Cases for the opened dataset
  const { data: cases, loading: casesLoading } = useResource<TestCase[]>(
    (signal) => (openDataset ? listCases(openDataset, signal) : Promise.resolve([])),
    [openDataset, refresh],
  );
  const caseCreate = useMutation();
  const caseUpdate = useMutation();
  const caseRemove = useMutation();
  const runCreate = useMutation();
  const [editCase, setEditCase] = React.useState<TestCase | null>(null);
  const [deleteCaseRow, setDeleteCaseRow] = React.useState<TestCase | null>(null);

  const addCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openDataset) return;
    const form = e.currentTarget;
    let input: unknown, expected: unknown;
    try {
      input = JSON.parse((form.elements.namedItem("input") as HTMLTextAreaElement).value || "{}");
      expected = (form.elements.namedItem("expected") as HTMLTextAreaElement).value ? JSON.parse((form.elements.namedItem("expected") as HTMLTextAreaElement).value) : null;
    } catch { setError("Invalid JSON"); return; }
    const result = await caseCreate.run(() => createCase(openDataset, { input, expected, criteria: { exact_match: true, non_empty: true }, tags: [] }));
    if (result) { bumpRefresh(); (form.elements.namedItem("input") as HTMLTextAreaElement).value = ""; (form.elements.namedItem("expected") as HTMLTextAreaElement).value = ""; }
  };

  const handleCaseUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCase) return;
    const form = e.currentTarget;
    let input: unknown, expected: unknown;
    try {
      input = JSON.parse((form.elements.namedItem("input") as HTMLTextAreaElement).value);
      expected = (form.elements.namedItem("expected") as HTMLTextAreaElement).value ? JSON.parse((form.elements.namedItem("expected") as HTMLTextAreaElement).value) : null;
    } catch { setError("Invalid JSON"); return; }
    const result = await caseUpdate.run(() => updateCase(editCase.id, { input, expected }));
    if (result) { bumpRefresh(); setEditCase(null); }
  };

  const handleCaseDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteCaseRow) return;
    const result = await caseRemove.run(() => deleteCase(deleteCaseRow.id));
    if (result) { bumpRefresh(); setDeleteCaseRow(null); }
  };

  const startRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openDataset) return;
    const form = e.currentTarget;
    const profile = (form.elements.namedItem("profile") as HTMLSelectElement).value;
    const result = await runCreate.run(() => createRun(selectedProject, { dataset_id: openDataset, profile }));
    if (result) {
      bumpRefresh();
      setRunNotice(`Run started: ${shortId(result.id)}`);
      setTimeout(() => setRunNotice(null), 4000);
    }
  };

  if (datasetsLoading) {
    return <div className="h-64 flex items-center justify-center"><span className="text-ink-muted">Loading datasets…</span></div>;
  }

  return (
    <div>
      <PageHeader title="Datasets" description="Manage test datasets for the selected project." />
      {runNotice && <div className="mb-4 rounded-lg border border-green-500/30 bg-green-900/20 p-3 text-sm text-green-300">{runNotice}</div>}
      <div className="flex items-center gap-3 mb-5">
        <Button variant="violet" onClick={() => setOpenCreate(true)} disabled={create.loading}>
          {create.loading ? "Creating…" : "New dataset"}
        </Button>
      </div>
      <DataTable
        columns={datasetColumns}
        data={datasets}
        loading={datasetsLoading}
        emptyMessage="No datasets yet. Create your first dataset."
        rowActions={[
          { label: "Open", variant: "violet", onClick: (row) => setOpenDataset(row.id) },
          { label: "Edit", variant: "default", onClick: (row) => { setEditRow(row); setOpenCreate(false); } },
          { label: "Delete", variant: "red", onClick: (row) => setDeleteRow(row) },
        ]}
      />
      <CrudDialog open={openCreate} title="New dataset" onClose={() => setOpenCreate(false)} submitLabel="Create dataset" loading={create.loading} error={create.error} onSubmit={handleCreate}>
        <Field label="Name" required>
          <Input name="name" required />
        </Field>
        <Field label="Description">
          <Input name="description" placeholder="Optional description" />
        </Field>
      </CrudDialog>
      <CrudDialog open={!!editRow} title="Edit dataset" onClose={() => setEditRow(null)} submitLabel="Save changes" loading={update.loading} error={update.error} onSubmit={handleUpdate}>
        {editRow && (
          <>
            <Field label="Name" required><Input name="name" defaultValue={editRow.name} required /></Field>
            <Field label="Description"><Input name="description" defaultValue={editRow.description || ""} placeholder="Optional description" /></Field>
          </>
        )}
      </CrudDialog>
      <CrudDialog open={!!deleteRow} title="Delete dataset" onClose={() => setDeleteRow(null)} submitLabel="Delete dataset" loading={remove.loading} error={remove.error} onSubmit={handleDelete}>
        {deleteRow && <p>Deleting “{deleteRow.name}” removes its test cases. Runs and traces stay in the project history.</p>}
      </CrudDialog>

      {openDataset && (
        <div className="mt-8 rounded-lg border border-border-base bg-surface-base overflow-hidden">
          <div className="border-b border-border-base bg-surface-hover/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">Test cases</h2>
              <p className="text-xs text-ink-muted">Dataset {shortId(openDataset)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setOpenDataset(null)} variant="ghost">Close</Button>
              <form onSubmit={startRun} className="flex items-center gap-2" disabled={runCreate.loading}>
                <Select name="profile" defaultValue="correct" className="text-xs">
                  {PROFILES.map((p) => <option key={p} value={p}>{p}</option>)}
                </Select>
                <Button variant="violet" type="submit" disabled={runCreate.loading}>{runCreate.loading ? "Running…" : "Run evaluation"}</Button>
              </form>
            </div>
          </div>
          <div className="p-4">
            <form onSubmit={addCase} className="space-y-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Input (JSON)" required>
                  <Textarea name="input" rows={2} className="w-full" required placeholder='{"text": "..."}' />
                </Field>
                <Field label="Expected (JSON)">
                  <Textarea name="expected" rows={2} className="w-full" placeholder='{"text": "Paris"}' />
                </Field>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <Button variant="ghost" type="button" onClick={() => setOpenDataset(null)}>Cancel</Button>
                <Button variant="violet" type="submit" disabled={caseCreate.loading}>{caseCreate.loading ? "Adding…" : "Add case"}</Button>
              </div>
            </form>
            <DataTable
              columns={[
                { key: "input", header: "Input", cell: (row: TestCase) => <span className="font-mono text-xs text-ink-muted truncate" title={jsonValue(row.input)}>{jsonValue(row.input).slice(0, 70)}</span> },
                { key: "expected", header: "Expected", cell: (row: TestCase) => <span className="font-mono text-xs text-ink-muted truncate" title={row.expected == null ? "—" : jsonValue(row.expected)}>{row.expected == null ? "—" : jsonValue(row.expected).slice(0, 70)}</span> },
                { key: "tags", header: "Tags", cell: (row: TestCase) => <span className="text-ink-muted text-xs">{row.tags.join(", ") || "—"}</span> },
              ]}
              data={cases || []}
              loading={casesLoading}
              emptyMessage="No test cases yet. Add your first case above."
              rowActions={[
                { label: "Edit", variant: "default", onClick: (row) => setEditCase(row) },
                { label: "Delete", variant: "red", onClick: (row) => setDeleteCaseRow(row) },
              ]}
            />
          </div>
        </div>
      )}

      <CrudDialog open={!!editCase} title="Edit test case" onClose={() => setEditCase(null)} submitLabel="Save changes" loading={caseUpdate.loading} error={caseUpdate.error} onSubmit={handleCaseUpdate}>
        {editCase && (
          <>
            <Field label="Input (JSON)" required><Textarea name="input" rows={3} defaultValue={jsonValue(editCase.input)} required /></Field>
            <Field label="Expected (JSON)"><Textarea name="expected" rows={3} defaultValue={editCase.expected == null ? "" : jsonValue(editCase.expected)} /></Field>
          </>
        )}
      </CrudDialog>
      <CrudDialog open={!!deleteCaseRow} title="Delete test case" onClose={() => setDeleteCaseRow(null)} submitLabel="Delete case" loading={caseRemove.loading} error={caseRemove.error} onSubmit={handleCaseDelete}>
        {deleteCaseRow && <p>Remove this test case from its dataset.</p>}
      </CrudDialog>
    </div>
  );
}
