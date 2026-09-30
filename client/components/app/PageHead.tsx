/* Every app page opens the same way: a mono label, a condensed title, one
   line of real counts, and the page's actions on the right. */
export default function PageHead({
  label,
  title,
  meta,
  actions,
}: {
  label: string;
  title: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="label">{label}</p>
        <h1 className="mt-2 text-[clamp(2.25rem,5vw,3.25rem)] text-fg">{title}</h1>
        {meta && <p className="mt-2 text-sm text-fg-2">{meta}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Page({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`mx-auto w-full px-4 py-8 sm:px-8 lg:py-10 ${wide ? 'max-w-[1600px]' : 'max-w-6xl'}`}>
      {children}
    </div>
  );
}
