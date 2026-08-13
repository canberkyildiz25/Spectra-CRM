'use client';

/**
 * Pipeline value by stage — ordinal magnitude.
 *
 * Hand-built SVG rather than a charting library: three figures do not justify a
 * dependency, and a library would need overriding back to these tokens anyway.
 *
 * Plots **value**, not count. The demo dataset holds one opportunity per stage,
 * so a count chart would be six identical bars saying nothing. Value is real and
 * varied, and it is the number a sales lead actually reads.
 *
 * Colour is the validated ordinal ramp — one hue, monotone lightness, checked
 * against the paper surface. See design.md § Charts.
 */

const STEP = [
  'var(--chart-stage-1)',
  'var(--chart-stage-2)',
  'var(--chart-stage-3)',
  'var(--chart-stage-4)',
  'var(--chart-stage-5)',
];

export type StageDatum = { key: string; label: string; value: number; count: number };

const fmtShort = (n: number) => {
  if (n >= 1_000_000) return `₺${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₺${Math.round(n / 1_000)}B`;
  return `₺${n}`;
};

const fmtFull = (n: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(n);

export default function StageValueBars({ data }: { data: StageDatum[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div>
      <ol className="space-y-3">
        {data.map((d, i) => {
          const pct = (d.value / max) * 100;
          // The ramp is five steps and the pipeline is six stages; the last two
          // share the darkest step rather than inventing a sixth colour.
          const fill = STEP[Math.min(i, STEP.length - 1)];

          return (
            <li key={d.key}>
              <div className="mb-1.5 flex items-baseline justify-between gap-4">
                <span className="text-sm text-ink-2">{d.label}</span>
                <span className="figure text-sm text-ink">{fmtShort(d.value)}</span>
              </div>

              <div
                className="h-2.5 w-full overflow-hidden rounded-sm"
                style={{ background: 'var(--color-paper-3)' }}
                role="img"
                aria-label={`${d.label}: ${fmtFull(d.value)}, ${d.count} fırsat`}
              >
                <div
                  className="h-full rounded-sm"
                  style={{
                    width: `${Math.max(pct, 1.5)}%`,
                    background: fill,
                    transition: 'width var(--dur-base) var(--ease-out)',
                  }}
                  title={`${d.label} · ${fmtFull(d.value)} · ${d.count} fırsat`}
                />
              </div>
            </li>
          );
        })}
      </ol>

      {/* Identity is never colour-alone: the same numbers exist as a table. */}
      <details className="mt-5">
        <summary className="label cursor-pointer select-none hover:text-ink-2">
          Tablo olarak gör
        </summary>
        <table className="data-table mt-3">
          <thead>
            <tr>
              <th scope="col">Aşama</th>
              <th scope="col" className="num">Fırsat</th>
              <th scope="col" className="num">Değer</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.key}>
                <td>{d.label}</td>
                <td className="num figure">{d.count}</td>
                <td className="num figure">{fmtFull(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
