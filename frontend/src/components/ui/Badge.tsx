import * as React from "react";
import { cn } from "@/lib/cn";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "failure" | "running" | "neutral" | "info";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const base = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium";
  const variants = {
    default: "border-border-base bg-transparent text-ink-subtle",
    success: "border-green-500/30 bg-green-900/20 text-green-400",
    failure: "border-red-500/30 bg-red-900/20 text-red-400",
    running: "border-amber-500/30 bg-amber-900/20 text-amber-400",
    neutral: "border-slate-500/30 bg-slate-500/10 text-slate-400",
    info: "border-blue-500/30 bg-blue-900/20 text-blue-400",
  };
  return <span className={cn(base, variants[variant], className)} {...props} />;
}
