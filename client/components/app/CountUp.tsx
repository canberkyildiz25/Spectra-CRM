'use client';

import { useEffect, useRef } from 'react';
import { animate, useReducedMotion } from 'framer-motion';

/* A headline figure counts up once, the first time it renders. The final
   text is in the markup from the start, so a screen reader, a copy-paste or a
   reader with reduced motion gets the real number, never a mid-count one. */
export default function CountUp({ value, format }: { value: number; format: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce || value === 0) return;
    const controls = animate(0, value, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (n) => {
        el.textContent = format(Math.round(n));
      },
    });
    return () => controls.stop();
    // format is a pure formatter; re-running on its identity would restart the count.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduce]);

  return (
    <span ref={ref} aria-label={format(value)}>
      {format(value)}
    </span>
  );
}
