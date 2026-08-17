import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * The shadcn class helper. clsx resolves conditionals, tailwind-merge then
 * drops the losers when two utilities target the same property — without it a
 * `className` prop passed into a component cannot override the component's own
 * padding, because both classes end up in the sheet and source order decides.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
