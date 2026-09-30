'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { toneVar, type Tone } from '@/lib/stages';
import { money, moneyShort } from '@/lib/format';

export type StageDatum = { key: string; label: string; tone: Tone; value: number; count: number };

/**
 * Open pipeline by stage — the dashboard's spectrum.
 *
 * One strip split by value, cold to hot, then a row per stage with its count,
 * amount and share. The rows are the data in text, so the colour is never the
 * only way in. Plots value, not count: count is in the row, and a count chart
 * of a small dataset is a row of near-identical bars saying nothing.
 *
 * Bars grow from zero once; the motion shows the proportion being measured.
 */
export default function StageSpectrum({ data }: { data: StageDatum[] }) {
  const reduce = useReducedMotion();
  const total = data.reduce((s, d) => s + d.value, 0);
  const max = Math.max(...data.map((d) => d.value), 1);
  const grow = (i: number) =>
    reduce
      ? { initial: false as const }
      : {
          initial: { scaleX: 0 },
          animate: { scaleX: 1 },
          transition: { duration: 0.8, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <div>
      <div className="flex h-3 w-full gap-[3px]" aria-hidden>
        {data
          .filter((d) => d.value > 0)
          .map((d, i) => (
            <motion.span
              key={d.key}
              {...grow(i)}
              className="h-full origin-left rounded-[2px]"
              style={{ width: `${(d.value / (total || 1)) * 100}%`, background: toneVar(d.tone) }}
            />
          ))}
      </div>

      <table className="mt-6 w-full text-sm">
        <caption className="sr-only">Open deals by stage: count, total value and share</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Stage</th>
            <th scope="col">Deals</th>
            <th scope="col">Value</th>
            <th scope="col">Share</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={d.key} className="border-t border-line">
              <th scope="row" className="py-3 pr-3 text-left font-normal">
                <span className="flex items-center gap-2.5">
                  <span className="tone-dot" style={{ '--tone': toneVar(d.tone) } as React.CSSProperties} />
                  <span className="text-fg">{d.label}</span>
                </span>
                <span className="mt-2 block h-[3px] w-full max-w-[14rem] overflow-hidden rounded-full bg-lift" aria-hidden>
                  <motion.span
                    {...grow(i)}
                    className="block h-full origin-left rounded-full"
                    style={{ width: `${(d.value / max) * 100}%`, background: toneVar(d.tone) }}
                  />
                </span>
              </th>
              <td className="figure py-3 pr-3 text-right text-fg-2">{d.count}</td>
              <td className="figure py-3 pr-3 text-right text-fg" title={money(d.value)}>
                {moneyShort(d.value)}
              </td>
              <td className="figure w-14 py-3 text-right text-fg-3">
                {total ? Math.round((d.value / total) * 100) : 0}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
