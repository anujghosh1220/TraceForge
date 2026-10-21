import { Menu } from "lucide-react";

interface TopBarProps {
  title: string;
  description?: string;
  onMenu: () => void;
}

export function TopBar({ title, description, onMenu }: TopBarProps) {
  return (
    <header className="flex items-center justify-between border-b border-border-base bg-surface-base px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <button className="md:hidden p-1.5 rounded-md text-ink-subtle hover:bg-surface-hover hover:text-ink" aria-label="Open menu" onClick={onMenu}>
          <Menu size={18} />
        </button>
        <div className="flex flex-col min-w-0">
          <h2 className="text-sm font-semibold text-ink truncate">{title}</h2>
          {description && <p className="text-xs text-ink-muted truncate hidden sm:block">{description}</p>}
        </div>
      </div>
      <div className="hidden md:flex items-center gap-3" />
    </header>
  );
}
