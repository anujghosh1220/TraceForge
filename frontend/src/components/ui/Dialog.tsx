import * as React from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  closeLabel?: string;
  children?: React.ReactNode;
}

export function Dialog({ open, onClose, title, description, closeLabel = "Close", children }: DialogProps) {
  if (!open) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onKeyDown={handleKeyDown}
    >
      <div
        className="fixed inset-0 bg-ink/[60] backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-md mx-auto p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-lg border border-border-base bg-surface-base shadow-2xl p-5">
          {title && (
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-sm font-semibold text-ink">{title}</h2>
            </div>
          )}
          {description && <p className="text-sm text-ink-muted mb-4">{description}</p>}
          <div className="mt-4">{children}</div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose} className="w-auto">
              {closeLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

export function Drawer({ open, onClose, title, children }: DrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div
        className="fixed inset-0 bg-ink/[60] backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-xs h-full bg-surface-base border-l border-border-base shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border-base p-4">
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1.5">
            <X size={16} />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}