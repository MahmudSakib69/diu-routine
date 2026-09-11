export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="muted text-xs font-semibold uppercase tracking-wider">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle ? <div className="muted mt-1.5 text-sm">{subtitle}</div> : null}
      </div>
      {actions ? <div className="no-print flex gap-2">{actions}</div> : null}
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="card px-4 py-3">
      <p className="text-lg font-bold leading-tight">{value}</p>
      <p className="muted text-xs">{label}</p>
    </div>
  );
}
