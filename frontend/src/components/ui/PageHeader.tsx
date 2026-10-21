

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; onClick?: () => void }[];
}

export function PageHeader({ title, description, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <p className="flex items-center gap-1 text-xs text-ink-muted mb-3">
          {breadcrumbs.map((b, i) => (
            <span key={b.label}>
              {i > 0 && <span className="mx-1">/</span>}
              {b.onClick ? (
                <button onClick={b.onClick} className="text-accent-violet underline underline-offset-4 hover:text-violet-400">
                  {b.label}
                </button>
              ) : (
                <span className="text-ink-dim">{b.label}</span>
              )}
            </span>
          ))}
        </p>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-ink text-balance">{title}</h1>
          {description && <p className="text-sm text-ink-muted">{description}</p>}
        </div>
      </div>
    </div>
  );
}