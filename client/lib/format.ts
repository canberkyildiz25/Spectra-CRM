/* Money and dates, formatted once. Pages used to carry their own copies of
   these, with different rounding. */

const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export const money = (n: number) => usd0.format(n);
export const moneyExact = (n: number) => usd2.format(n);
export const plain = (n: number) => num.format(n);

/* $1.2M / $245K — for headline figures where the full amount would wrap. */
export const moneyShort = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 1 })}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
};

/* Short dates are ISO (2026-09-30): read the same in every country and sort
   the way they read. Long dates spell the month out. */
export const date = (d?: string | Date) => (d ? new Date(d).toLocaleDateString('en-CA') : '—');

export const dateLong = (d?: string | Date) =>
  d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

/* Axios and fetch errors both end up here; the server sends `{ error }`. */
export const errorText = (err: unknown, fallback: string) => {
  const e = err as { response?: { data?: { error?: string } }; message?: string };
  return e?.response?.data?.error || e?.message || fallback;
};
