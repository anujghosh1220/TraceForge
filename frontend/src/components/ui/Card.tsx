import * as React from "react";
import { cn } from "@/lib/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

export function Card({ className, padded = true, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-lg border border-border-base bg-surface-base", padded && "p-5", className)}
      {...props}
    />
  );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export function CardHeader({ className, ...props }: CardHeaderProps) {
  return <div className={cn("flex flex-col space-y-1.5", className)} {...props} />;
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export function CardTitle({ className, ...props }: CardTitleProps) {
  return <h3 className={cn("text-sm font-semibold text-ink", className)} {...props} />;
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return <p className={cn("text-sm text-ink-muted", className)} {...props} />;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn("mt-2", className)} {...props} />;
}
