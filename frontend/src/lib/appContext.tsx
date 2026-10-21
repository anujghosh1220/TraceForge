import { createContext, useContext, useState, useMemo, type ReactNode } from "react";
import { useResource } from "@/lib/hooks";
import { listProjects, type Project } from "@/lib/api";
import type { EvalRun, Trace } from "@/types";

interface AppContextType {
  projects: Project[] | null;
  projectsLoading: boolean;
  selectedProject: string | null;
  setSelectedProject: (id: string | null) => void;
  tab: string;
  setTab: (tab: string) => void;
  selectedRun: EvalRun | null;
  setSelectedRun: (run: EvalRun | null) => void;
  selectedTrace: Trace | null;
  setSelectedTrace: (trace: Trace | null) => void;
  refresh: number;
  bumpRefresh: () => void;
  error: string | null;
  setError: (message: string | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [refresh, setRefresh] = useState(0);
  const bumpRefresh = () => setRefresh((r) => r + 1);

  const { data: projects, loading: projectsLoading } = useResource<Project[]>(
    (signal) => listProjects(signal),
    [refresh],
  );

  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [tab, setTab] = useState("overview");
  const [selectedRun, setSelectedRun] = useState<EvalRun | null>(null);
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);
  const [error, setError] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      projects,
      projectsLoading,
      selectedProject,
      setSelectedProject,
      tab,
      setTab,
      selectedRun,
      setSelectedRun,
      selectedTrace,
      setSelectedTrace,
      refresh,
      bumpRefresh,
      error,
      setError,
    }),
    [projects, projectsLoading, selectedProject, tab, selectedRun, selectedTrace, refresh, error],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}