import { cn } from "@/lib/cn";
import { formatPercent } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: { label: string; value: number; positive?: boolean };
}

export function MetricCard({ title, value, subtitle, change }: MetricCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-1">
        <div className="text-2xl font-semibold text-ink tracking-tight">{value}</div>
        {change && (
          <div className="mt-1.5 text-xs flex items-center gap-1">
            <span className={cn(change.positive ? "text-green-400" : "text-red-400", "font-medium")}>
              {change.value >= 0 ? "+" : ""}{change.value}%
            </span>
            <span className="text-ink-muted">{change.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./Card";

export function PassRateCard({ rate, label = "Latest pass rate" }: { rate: number | null; label?: string }) {
  return (
    <MetricCard
      title={label}
      value={rate == null ? "—" : formatPercent(rate)}
      subtitle="Most recent completed run"
    />
  );
}