import * as React from "react";
import { cn } from "@/lib/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "flex-1 min-w-0 rounded-md border border-border-base bg-surface-hover px-3 py-2 text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-accent-violet disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "rounded-md border border-border-base bg-surface-hover px-3 py-2 text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-accent-violet disabled:opacity-50 font-mono text-sm",
        className,
      )}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "rounded-md border border-border-base bg-surface-hover px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent-violet disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
