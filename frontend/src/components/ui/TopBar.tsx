import * as React from "react";
import { cn } from "@/lib/cn";

export function TopBar({ title, description, onMenu }: { title: string; description?: string; onMenu: () => void }) {
  return (
    <header className="flex items-center justify-between border-b border-border-base bg-surface-base px-4 py-3">
      <div className="flex items-center gap-3">
        <button className="md:hidden p-1.5 rounded-md text-ink-subtle hover:bg-surface-hover hover:text-ink" aria-label="Open menu" onClick={onMenu}>
          <span className="sr-only">Open menu</span>
          <div className="w-5 h-[2px] bg-ink relative">
            <div className="absolute left-0 top-[-6px] w-full h-[2px] bg-current" />
            <div className="absolute left-0 top-[6px] w-full h-[2px] bg-current" />
          </div>
        </button>
        <div className="hidden md:block flex flex-col">
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {description && <p className="text-xs text-ink-muted">{description}</p>}
        </div>
      </div>
      <div className="hidden md:flex items-center gap-3" />
    </header>
  );
}
