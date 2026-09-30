/* The mark is the scale itself: five stripes, cold to won. It is the same
   sequence a deal walks through, so the logo explains the product. */
const TONES = ['cold', 'cool', 'warm', 'hot', 'won'] as const;

export default function SpectraMark({ size = 18, className = '' }: { size?: number; className?: string }) {
  const w = size / 5;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden
      className={`shrink-0 ${className}`}
    >
      {TONES.map((t, i) => (
        <rect
          key={t}
          x={i * w + 0.5}
          y={0}
          width={w - 1}
          height={size}
          rx={0.75}
          style={{ fill: `var(--color-${t})` }}
        />
      ))}
    </svg>
  );
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <SpectraMark />
      <span className="wordmark text-[0.9375rem] text-fg">Spectra</span>
    </span>
  );
}
