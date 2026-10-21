import { cn } from "@/lib/cn";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Play,
  Activity,
  GitCompare,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "./Button";

type NavItem = { key: string; label: string; icon: React.ElementType };

const NAV: NavItem[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "datasets", label: "Datasets", icon: FileText },
  { key: "runs", label: "Evaluation Runs", icon: Play },
  { key: "traces", label: "Traces", icon: Activity },
  { key: "compare", label: "Comparisons", icon: GitCompare },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeTab: string;
  onTabChange: (key: string) => void;
  mobileOpen: boolean;
  onMobileToggle: () => void;
}

export function Sidebar({ collapsed, onToggle, activeTab, onTabChange, mobileOpen, onMobileToggle }: SidebarProps) {
  const navItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = activeTab === item.key;
    return (
      <button
        key={item.key}
        onClick={() => onTabChange(item.key)}
        className={cn(
          "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors",
          active
            ? "bg-accent-violet/10 text-accent-violet border-r-2 border-accent-violet"
            : "text-ink-subtle hover:bg-surface-hover hover:text-ink",
        )}
        aria-pressed={active}
      >
        <Icon size={16} className="shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </button>
    );
  };

  return (
    <>
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen z-20 flex flex-col border-r border-border-base bg-surface-base transition duration-200 ease-in-out",
          collapsed ? "w-20" : "w-64",
        )}
      >
        <div className="flex items-center gap-3 p-5 border-b border-border-base">
          <div className="rounded-md bg-accent-violet p-1.5 flex items-center justify-center">
            <LayoutDashboard size={20} className="text-slate-950" />
          </div>
          {!collapsed && <span className="font-bold text-ink tracking-tight">Trace<span className="text-accent-violet">Forge</span></span>}
        </div>
        <nav className="flex-1 px-2 overflow-y-auto">{NAV.map(navItem)}</nav>
        <div className="p-4 border-t border-border-base">
          <button
            onClick={onToggle}
            className="w-full px-3 py-2 text-xs rounded-md text-ink-subtle hover:bg-surface-hover hover:text-ink flex items-center justify-between"
          >
            <span>{collapsed ? "Expand" : "Collapse"}</span>
            <ChevronRight size={14} className={cn("shrink-0", collapsed ? "rotate-90" : "")} />
          </button>
        </div>
      </aside>

      <div className={cn("fixed inset-0 z-50", mobileOpen ? "flex" : "hidden")} onClick={onMobileToggle}>
        <div className="fixed inset-0 bg-ink/[60] backdrop-blur-sm" aria-hidden="true" onClick={onMobileToggle} />
        <div className="relative w-full max-w-xs h-full bg-surface-base border-l border-border-base shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-border-base p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-accent-violet p-1.5"><LayoutDashboard size={20} className="text-slate-950" /></div>
              <span className="font-bold text-ink">Trace<span className="text-accent-violet">Forge</span></span>
            </div>
            <Button variant="ghost" size="sm" onClick={onMobileToggle} className="p-1.5">
              <X size={16} />
            </Button>
          </div>
          <nav className="flex-1 px-4 overflow-y-auto">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => { onTabChange(item.key); onMobileToggle(); }}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm transition-colors",
                    active ? "bg-accent-violet/10 text-accent-violet" : "text-ink-subtle hover:bg-surface-hover hover:text-ink",
                  )}
                >
                  <Icon size={18} className="shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}