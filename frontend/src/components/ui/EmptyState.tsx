import * as React from "react";
import { AlertCircle } from "lucide-react";

export function EmptyState({ title, description, action, icon: Icon = AlertCircle }: { title: string; description?: string; action?: React.ReactNode; icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 text-center">
      <div className="rounded-full bg-surface-hover p-3 mb-4 text-ink-muted">
        <Icon size={32} />
      </div>
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      {description && <p className="text-sm text-ink-muted mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
