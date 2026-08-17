import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Status variants carry reserved meanings and are the only place colour appears
 * outside charts and focus. `quiet` is the grey one — a lost deal or an inactive
 * customer is a normal business outcome, not an alarm, so it never goes red.
 */
const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border text-foreground',
        positive:
          'border-[color-mix(in_oklch,var(--positive)_25%,transparent)] bg-[var(--positive-wash)] text-[var(--positive)]',
        caution:
          'border-[color-mix(in_oklch,var(--caution)_28%,transparent)] bg-[var(--caution-wash)] text-[var(--caution)]',
        quiet:
          'border-border bg-[var(--quiet-wash)] text-[var(--quiet)]',
      },
    },
    defaultVariants: { variant: 'secondary' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
