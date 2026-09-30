'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { money } from '@/lib/format';

/**
 * Closed business — won against lost.
 *
 * Not a time series: the demo has no history, and plotting a handful of
 * closes over months would invent a trend. Two totals get the honest form, a
 * proportion strip plus both figures. Lost is ash, not red — a lost deal is a
 * normal outcome, not an alarm.
 */
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
  const reduce = useReducedMotion();
  const total = wonValue + lostValue;
  const wonPct = total > 0 ? (wonValue / total) * 100 : 0;
  const decided = wonCount + lostCount;
  const winRate = decided > 0 ? Math.round((wonCount / decided) * 100) : 0;

  return (
    <div>
      <p className="flex items-baseline gap-3">
        <span className="readout text-[3.5rem] text-fg">%{winRate}</span>
        <span className="text-sm text-fg-2">kazanma oranı · {decided} kapanış</span>
      </p>

      <div
        className="mt-5 flex h-3 w-full gap-[3px]"
        role="img"
        aria-label={`Kazanılan ${money(wonValue)}, kaybedilen ${money(lostValue)}`}
      >
        {wonPct > 0 && (
          <motion.span
            initial={reduce ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="h-full origin-left rounded-[2px] bg-won"
            style={{ width: `${wonPct}%` }}
          />
        )}
        {wonPct < 100 && <span className="h-full flex-1 rounded-[2px] bg-ash" />}
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-4">
        <div>
          <dt className="flex items-center gap-2">
            <span className="tone-dot bg-won" />
            <span className="label">Kazanılan</span>
          </dt>
          <dd className="figure mt-1.5 text-lg text-fg">{money(wonValue)}</dd>
          <dd className="text-xs text-fg-3">{wonCount} fırsat</dd>
        </div>
        <div>
          <dt className="flex items-center gap-2">
            <span className="tone-dot bg-ash" />
            <span className="label">Kaybedilen</span>
          </dt>
          <dd className="figure mt-1.5 text-lg text-fg">{money(lostValue)}</dd>
          <dd className="text-xs text-fg-3">{lostCount} fırsat</dd>
        </div>
      </dl>
    </div>
  );
}
