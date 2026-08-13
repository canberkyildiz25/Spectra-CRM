'use client';

/**
 * Closed business — won against lost.
 *
 * Deliberately not a time series. The demo holds one win and one loss; plotting
 * those over months would be inventing a trend that the data cannot support.
 * This is the honest form for two totals: a proportion bar plus both figures.
 *
 * The colours are the validated categorical pair, not the badge palette — the
 * grey used on a "lost" badge sits under the chroma floor and measures ΔE 3.9
 * against the positive green under deutan vision. See design.md § Charts.
 */

const fmtFull = (n: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(n);

export default function WonLostSplit({
  wonCount,
  lostCount,
  wonValue,
  lostValue,
}: {
  wonCount: number;
  lostCount: number;
  wonValue: number;
  lostValue: number;
}) {
  const total = wonValue + lostValue;
  const wonPct = total > 0 ? (wonValue / total) * 100 : 0;
  const decided = wonCount + lostCount;
  const winRate = decided > 0 ? Math.round((wonCount / decided) * 100) : 0;

  return (
    <div>
      <div className="mb-5 flex items-baseline gap-3">
        <span className="figure text-3xl text-ink">%{winRate}</span>
        <span className="text-sm text-ink-2">
          kazanma oranı · {decided} kapanmış fırsat
        </span>
      </div>

      {/* One bar, two segments, a 2px surface gap between them so the fills
          never touch. */}
      <div
        className="flex h-3 w-full overflow-hidden rounded-sm"
        style={{ background: 'var(--color-paper-3)', gap: '2px' }}
        role="img"
        aria-label={`Kazanılan ${fmtFull(wonValue)}, kaybedilen ${fmtFull(lostValue)}`}
      >
        <div
          className="h-full rounded-sm"
          style={{
            width: `${wonPct}%`,
            background: 'var(--chart-won)',
            transition: 'width var(--dur-base) var(--ease-out)',
          }}
          title={`Kazanılan · ${fmtFull(wonValue)}`}
        />
        <div
          className="h-full flex-1 rounded-sm"
          style={{ background: 'var(--chart-lost)' }}
          title={`Kaybedilen · ${fmtFull(lostValue)}`}
        />
      </div>

      {/* Legend — mandatory for two series. The swatch carries identity; the
          text stays in ink tokens rather than wearing the series colour. */}
      <dl className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <dt className="mb-1 flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: 'var(--chart-won)' }}
            />
            <span className="label">Kazanılan</span>
          </dt>
          <dd className="figure text-lg text-ink">{fmtFull(wonValue)}</dd>
          <dd className="text-xs text-ink-3">{wonCount} fırsat</dd>
        </div>

        <div>
          <dt className="mb-1 flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: 'var(--chart-lost)' }}
            />
            <span className="label">Kaybedilen</span>
          </dt>
          <dd className="figure text-lg text-ink">{fmtFull(lostValue)}</dd>
          <dd className="text-xs text-ink-3">{lostCount} fırsat</dd>
        </div>
      </dl>
    </div>
  );
}
