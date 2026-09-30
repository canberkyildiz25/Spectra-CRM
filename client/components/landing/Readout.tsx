import { DEMO_DEALS, dealsIn, totalOf } from '@/lib/demo';
import { STAGES, toneVar } from '@/lib/stages';
import { money, moneyShort } from '@/lib/format';

/* The spectrum: every deal in the demo dataset as one vertical line, grouped
 * by stage in pipeline order. Line height is the amount. Nothing here is
 * decoration — it is the dataset the demo account opens onto.
 *
 * Server-rendered markup. LandingFx grows the lines (.line-grow) on load.
 */
export default function Readout({ compact = false }: { compact?: boolean }) {
  const max = Math.max(...DEMO_DEALS.map((d) => d.amount));
  const groups = STAGES.map((s) => ({ ...s, deals: dealsIn(s.key) })).filter((g) => g.deals.length);

  return (
    <figure className="m-0">
      <div
        className="flex items-end gap-[clamp(6px,1.4vw,20px)]"
        style={{ height: compact ? 'clamp(140px, 26vh, 220px)' : 'clamp(170px, 30vh, 320px)' }}
        role="img"
        aria-label={`The ${DEMO_DEALS.length} deals in the demo dataset, by stage. ${groups
          .map((g) => `${g.label}: ${g.deals.length} deals, ${money(totalOf(g.deals))}`)
          .join('; ')}.`}
      >
        {groups.map((g) => (
          <div
            key={g.key}
            className="flex h-full min-w-0 items-end gap-[clamp(5px,1.1vw,16px)]"
            style={{ flex: `${g.deals.length} 1 0` }}
          >
            {/* Thin lines, not bars: a spectrum is read by where the lines
                fall and how tall they stand, not by filled area. */}
            {g.deals.map((d) => (
              <span
                key={`${d.company}-${d.deal}`}
                data-readout-line
                className="line-grow block w-[clamp(4px,0.75vw,10px)] shrink-0 rounded-t-[2px]"
                style={{ height: `${Math.max(6, (d.amount / max) * 100)}%`, background: toneVar(g.tone) }}
                title={`${d.company} · ${d.deal} · ${money(d.amount)}`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Baseline and legend. The legend repeats the order the lines sit in,
          so colour is never the only way to tell stages apart. */}
      <div className="mt-0 h-px bg-line-strong" aria-hidden />
      {compact ? (
        /* Compact: a wrapping legend with full names. Aligning it under the
           lines would squeeze the narrow groups down to an ellipsis. */
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2" aria-hidden>
          {groups.map((g) => (
            <li key={g.key} className="flex items-center gap-1.5">
              <span className="tone-dot" style={{ '--tone': toneVar(g.tone) } as React.CSSProperties} />
              <span className="label">{g.label}</span>
            </li>
          ))}
        </ul>
      ) : (
        <ol className="mt-3 flex gap-[clamp(6px,1.4vw,20px)]" aria-hidden>
          {groups.map((g) => (
            <li key={g.key} className="min-w-0" style={{ flex: `${g.deals.length} 1 0` }}>
              <span className="flex items-center gap-1.5">
                <span className="tone-dot" style={{ '--tone': toneVar(g.tone) } as React.CSSProperties} />
                {/* Full names where there is room, three-letter codes below lg. */}
                <span className="label truncate text-fg-2" title={g.label}>
                  <span className="hidden lg:inline">{g.label}</span>
                  <span className="lg:hidden">{g.short}</span>
                </span>
              </span>
              <span className="figure mt-1 block truncate text-[0.8125rem] text-fg">
                {moneyShort(totalOf(g.deals))}
              </span>
            </li>
          ))}
        </ol>
      )}
    </figure>
  );
}
