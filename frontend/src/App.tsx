import { AppProvider, useApp } from "@/lib/appContext";
import { Layout } from "@/components/layout/Layout";
import { Overview } from "@/pages/Overview";
import { ProjectsPage } from "@/pages/Projects";
import { DatasetsPage } from "@/pages/Datasets";
import { RunsPage } from "@/pages/Runs";
import { TracesPage } from "@/pages/Traces";
import { ComparePage } from "@/pages/Compare";
import { getRun } from "@/lib/api";


function AppContent() {
  const { tab, selectedProject, setSelectedRun, setTab } = useApp();

  const handleViewRun = async (id: string) => {
    try {
      const run = await getRun(id);
      setSelectedRun(run);
      setTab("runs");
    } catch {
      setTab("runs");
    }
  };

  return (
    <Layout>
      {tab === "overview" && <Overview projectId={selectedProject} onViewRun={handleViewRun} />}
      {tab === "projects" && <ProjectsPage />}
      {tab === "datasets" && <DatasetsPage />}
      {tab === "runs" && <RunsPage />}
      {tab === "traces" && <TracesPage />}
      {tab === "compare" && <ComparePage />}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
