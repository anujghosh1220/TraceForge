import * as React from "react";

interface SparklineProps {
  data: number[];
  height?: number;
  color?: string;
}

export function Sparkline({ data, height = 80, color = "#8b5cf6" }: SparklineProps) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((v - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg className="w-full" height={height} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <path d={`M${points}`} stroke={color} strokeWidth="2" className="opacity-80" />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((v - min) / range) * 100;
        return <circle key={i} cx={x} cy={y} r={2} fill={color} />;
      })}
    </svg>
  );
}
