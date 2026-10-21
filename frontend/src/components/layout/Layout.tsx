import * as React from "react";
import { useApp } from "@/lib/appContext";
import { Sidebar } from "@/components/ui/Sidebar";
import { TopBar } from "@/components/ui/TopBar";
import { ErrorBanner } from "@/components/ui/ErrorState";
import { cn } from "@/lib/cn";

const PAGE_TITLES: Record<string, { title: string; description?: string }> = {
  overview: { title: "Overview", description: "Evaluation summary for the selected project." },
  projects: { title: "Projects", description: "Create, edit, and delete projects." },
  datasets: { title: "Datasets", description: "Manage test datasets for the selected project." },
  runs: { title: "Evaluation runs", description: "View and open evaluation runs." },
  traces: { title: "Traces", description: "Inspect trace and span activity." },
  compare: { title: "Comparisons", description: "Compare evaluation runs side by side." },
};

export function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { tab, setTab, selectedProject, projects, error, setError } = useApp();

  const info = PAGE_TITLES[tab] || { title: tab };
  const projectLabel = selectedProject
    ? (projects?.find((p) => p.id === selectedProject)?.name || selectedProject.slice(0, 8))
    : "No project";

  return (
    <div className="min-h-screen bg-surface-base text-ink">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        activeTab={tab}
        onTabChange={setTab}
        mobileOpen={mobileOpen}
        onMobileToggle={() => setMobileOpen((o) => !o)}
      />
      <div
        className={cn(
          "transition-[margin-left] duration-200 ease-in-out",
          collapsed ? "ml-20" : "ml-64",
        )}
      >
        <TopBar
          title={info.title}
          description={info.description}
          onMenu={() => setMobileOpen((o) => !o)}
        />
        <div className="px-4 sm:px-6 py-3 border-b border-border-base bg-surface-base/50 flex items-center gap-2 text-xs">
          <span className="text-ink-dim">Project</span>
          <span className="text-ink font-mono">{projectLabel}</span>
        </div>
        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
        <main className="px-4 sm:px-6 py-6 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}