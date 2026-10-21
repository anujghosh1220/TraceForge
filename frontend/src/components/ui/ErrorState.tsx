import { AlertCircle } from "lucide-react";
import { Button } from "./Button";

export function ErrorState({ title, message, onRetry }: { title: string; message?: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-border-base bg-surface-base p-5 text-center">
      <div className="rounded-full bg-red-900/20 p-3 mb-3 text-red-400">
        <AlertCircle size={32} />
      </div>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {message && <p className="text-sm text-ink-muted mt-1">{message}</p>}
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry} className="mt-4">
          Try again
        </Button>
      )}
    </div>
  );
}

export function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-4 mb-4 text-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-red-400">
          <AlertCircle size={18} />
        </div>
        <div className="flex-1 text-red-200">{message}</div>
        <button onClick={onDismiss} className="text-red-400 underline text-xs hover:text-red-300">
          Dismiss
        </button>
      </div>
    </div>
  );
}