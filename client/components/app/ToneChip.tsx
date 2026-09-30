import { toneVar, type Tone } from '@/lib/stages';

/* A dot and a word. The word carries the meaning; the dot places it on the
   temperature scale. Never a colour on its own. */
export default function ToneChip({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className="chip" style={{ '--tone': toneVar(tone) } as React.CSSProperties}>
      {children}
    </span>
  );
}

export function ToneDot({ tone, className = '' }: { tone: Tone; className?: string }) {
  return (
    <span
      aria-hidden
      className={`tone-dot ${className}`}
      style={{ '--tone': toneVar(tone) } as React.CSSProperties}
    />
  );
}
