import * as React from "react";
import { cn } from "@/lib/cn";

type SkeletonVariant = "text" | "circle" | "chip" | "bar";

export function Skeleton({ className, variant = "text" }: { className?: string; variant?: SkeletonVariant }) {
  const base = "rounded-md bg-surface-hover overflow-hidden";
  const variants = {
    text: "h-4 w-3/4",
    circle: "h-8 w-8 rounded-full",
    chip: "h-6 w-24 rounded-full",
    bar: "h-full w-full",
  };
  return <div className={cn(base, variants[variant], "animate-pulse", className)} />;
}
