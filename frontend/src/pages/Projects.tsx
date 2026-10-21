import * as React from "react";
import { useApp } from "@/lib/appContext";
import { createProject, deleteProject, updateProject } from "@/lib/api";
import { useMutation } from "@/lib/hooks";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatRelativeTime } from "@/lib/utils";
import { type Project } from "@/types";

function ProjectNameCell({ row, onOpen }: { row: Project; onOpen: (id: string) => void }) {
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

function CreateDialog({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [formError, setFormError] = React.useState("");
  const create = useMutation();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!name.trim()) { setFormError("Name is required"); return; }
    const result = await create.run(() => createProject({ name, description: description || null }));
    if (result) { onSuccess(); onClose(); }
  };

  return (
    <Dialog open={open} onClose={onClose} title="New project">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-ink-muted">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" required />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-medium text-ink-muted">Description</label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
        </div>
        {formError && <p className="text-sm text-red-400">{formError}</p>}
        {create.error && <p className="text-sm text-red-400">{create.error}</p>}
        <div className="flex justify-end gap-2 pt-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="violet" disabled={create.loading} type="submit">
            {create.loading ? "Creating…" : "Create project"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function EditDialog({ open, row, onClose, onSuccess }: { open: boolean; row: Project | null; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = React.useState(row?.name ?? "");
  const [description, setDescription] = React.useState(row?.description || "");
  const [formError, setFormError] = React.useState("");
  const update = useMutation();

  React.useEffect(() => {
    if (row) {
      setName(row.name);
      setDescription(row.description || "");
    }
  }, [row]);

  if (!open || !row) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!name.trim()) { setFormError("Name is required"); return; }
    const result = await update.run(() => updateProject(row.id, { name, description: description || null }));
    if (result) { onSuccess(); onClose(); }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Edit project">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-ink-muted">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-medium text-ink-muted">Description</label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
        </div>
        {formError && <p className="text-sm text-red-400">{formError}</p>}
        {update.error && <p className="text-sm text-red-400">{update.error}</p>}
        <div className="flex justify-end gap-2 pt-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="violet" disabled={update.loading} type="submit">
            {update.loading ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function DeleteDialog({ open, row, onClose, onSuccess }: { open: boolean; row: Project | null; onClose: () => void; onSuccess: (id: string) => void }) {
  const remove = useMutation();
  if (!open || !row) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await remove.run(() => deleteProject(row.id));
    if (result) { onSuccess(row.id); onClose(); }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Delete project" description={`Deleting “${row.name}” removes its datasets, runs, and traces. This cannot be undone.`}>
      <form onSubmit={submit} className="space-y-4">
        {remove.error && <p className="text-sm text-red-400">{remove.error}</p>}
        <div className="flex justify-end gap-2 pt-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="red" disabled={remove.loading} type="submit">
            {remove.loading ? "Deleting…" : "Delete project"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export function ProjectsPage() {
  const { projects, projectsLoading, selectedProject, setSelectedProject, setTab, bumpRefresh } = useApp();
  const [openCreate, setOpenCreate] = React.useState(false);
  const [editRow, setEditRow] = React.useState<Project | null>(null);
  const [deleteRow, setDeleteRow] = React.useState<Project | null>(null);

  const columns = [
    { key: "name", header: "Name", cell: (row: Project) => <ProjectNameCell row={row} onOpen={(id) => { setSelectedProject(id); setTab("datasets"); }} /> },
    { key: "description", header: "Description", cell: (row: Project) => <span className="text-ink-muted">{row.description || "—"}</span> },
    { key: "created", header: "Created", cell: (row: Project) => <span className="text-ink-muted font-mono text-xs">{formatRelativeTime(row.created_at)}</span> },
  ];

  return (
    <div>
      <PageHeader title="Projects" description="Create, edit, and delete projects." />
      <div className="flex items-center gap-3 mb-5">
        <Button variant="violet" onClick={() => setOpenCreate(true)}>
          New project
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={projects || []}
        loading={projectsLoading}
        emptyMessage="No projects yet. Create your first project."
        rowActions={[
          { label: "Edit", variant: "violet", onClick: (row) => { setEditRow(row); } },
          { label: "Delete", variant: "red", onClick: (row) => { setDeleteRow(row); } },
        ]}
      />
      <CreateDialog open={openCreate} onClose={() => setOpenCreate(false)} onSuccess={() => bumpRefresh()} />
      <EditDialog open={!!editRow} row={editRow!} onClose={() => setEditRow(null)} onSuccess={() => { bumpRefresh(); setEditRow(null); }} />
      <DeleteDialog open={!!deleteRow} row={deleteRow!} onClose={() => setDeleteRow(null)} onSuccess={(id) => { bumpRefresh(); setDeleteRow(null); if (selectedProject === id) setSelectedProject(null); }} />
    </div>
  );
}
