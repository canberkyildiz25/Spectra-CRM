import Link from 'next/link';
import { Plus } from 'lucide-react';

type Variant = 'customers' | 'proposals' | 'opportunities' | 'tasks' | 'search';

/* An empty list says what would be here and how to put it there. The old
   illustrations floated on a loop in emerald; motion that never stops is
   noise in a tool, and emerald was a colour the system no longer has. */
const COPY: Record<Variant, { title: string; desc: string }> = {
  customers: { title: 'No customers yet', desc: 'Deals and proposals hang off a customer record, so add one first.' },
  proposals: { title: 'No proposals yet', desc: 'Build a proposal line by line and print it as a document.' },
  opportunities: { title: 'No deals yet', desc: 'The first deal lands in the coldest column of the board: Lead.' },
  tasks: { title: 'Nothing in this list', desc: 'Tasks are sorted by due date and marked by priority heat, so urgent work shows up hot.' },
  search: { title: 'No matches', desc: 'Change the search or the filter and try again.' },
};

export default function EmptyState({
  variant,
  ctaLabel,
  ctaHref,
  onCta,
}: {
  variant: Variant;
  ctaLabel?: string;
  ctaHref?: string;
  onCta?: () => void;
}) {
  const { title, desc } = COPY[variant];
  return (
    <div className="flex flex-col items-start gap-4 rounded-[var(--radius-lg)] border border-dashed border-line-strong bg-well px-6 py-12 sm:items-center sm:text-center">
      <span className="flex gap-1" aria-hidden>
        {(['cold', 'cool', 'warm', 'hot', 'won'] as const).map((t) => (
          <span key={t} className="h-6 w-1 rounded-[1px] opacity-60" style={{ background: `var(--color-${t})` }} />
        ))}
      </span>
      <div>
        <h2 className="display text-[1.75rem] text-fg">{title}</h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-fg-2">{desc}</p>
      </div>
      {ctaHref && ctaLabel && (
        <Link href={ctaHref} className="btn btn-sm">
          <Plus className="size-4" aria-hidden />
          {ctaLabel}
        </Link>
      )}
      {onCta && ctaLabel && !ctaHref && (
        <button type="button" onClick={onCta} className="btn btn-sm">
          <Plus className="size-4" aria-hidden />
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
