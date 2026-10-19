import * as React from "react";

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c));
}

function styleFor(type: string, value: string): string {
  switch (type) {
    case "string": return "color: #3b82f6;";
    case "number": case "boolean": return "color: #8b5cf6;";
    case "null": case "undefined": return "color: #64748b; font-style: italic;";
    default: return "color: #94a3b8;";
  }
}

function renderValue(value: unknown, depth: number): string {
  if (value === null) return `<span style="${styleFor("null","")}">null</span>`;
  if (value === undefined) return `<span style="${styleFor("undefined","")}">undefined</span>`;
  if (typeof value === "string") return `<span style="${styleFor("string","")}">"${escapeHtml(value)}"</span>`;
  if (typeof value === "number" || typeof value === "boolean") return `<span style="${styleFor(typeof value, String(value))}">${escapeHtml(String(value))}</span>`;
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const items = value.map((v) => `<div style="padding-left: ${depth * 18}px">[${renderValue(v, depth + 1)}]</div>`).join("");
    return `<div>[</div>${items}<div style="padding-left: ${(depth - 1) * 18}px">]</div>`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) return "{}";
    const items = entries.map(([k, v]) => {
      const rendered = renderValue(v, depth + 1);
      const multi = rendered.includes("<div");
      return `<div style="padding-left: ${depth * 18}px"><span style="${styleFor("key","")}">${escapeHtml(String(k))}</span>: ${multi ? `<div style="padding-left: ${(depth + 1) * 18}px">${rendered}</div>` : rendered}</div>`;
    }).join("");
    return `<div>{</div>${items}<div style="padding-left: ${(depth - 1) * 18}px">}</div>`;
  }
  return `<span style="${styleFor("string","")}">"${escapeHtml(String(value))}"</span>`;
}

interface JsonViewerProps {
  value: unknown;
  maxHeight?: number;
}

export function JsonViewer({ value, maxHeight = 300 }: JsonViewerProps) {
  const rendered = renderValue(value, 0);
  return (
    <div
      className="rounded-md border border-border-base bg-surface-hover p-3 font-mono text-xs overflow-auto max-h-[300px] text-ink-subtle"
      style={{ maxHeight }}
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  );
}
