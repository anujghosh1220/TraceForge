import * as React from "react";
import { cn } from "@/lib/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "violet" | "green" | "red" | "ghost" | "outline";
  size?: "sm" | "default";
}

export function Button({ className, variant = "default", size = "default", disabled, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 rounded-md font-medium text-sm transition-colors disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-surface-hover text-ink border border-border-base hover:bg-surface-hover hover:text-ink",
    violet: "bg-accent-violet text-slate-950 hover:bg-violet-400",
    green: "bg-green-600 text-slate-950 hover:bg-green-500",
    red: "bg-red-600 text-slate-950 hover:bg-red-500",
    ghost: "hover:bg-surface-hover hover:text-ink",
    outline: "border border-border-base bg-transparent hover:bg-surface-hover",
  };
  const sizes = {
    sm: "px-2.5 py-1.5",
    default: "px-4 py-2",
  };
  return (
    <button
      className={cn(base, variants[variant], sizes[size], disabled && "opacity-50", className)}
      disabled={disabled}
      {...props}
    />
  );
}
