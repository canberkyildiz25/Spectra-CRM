/* Money and dates, formatted once. Pages used to carry their own copies of
   these, with different rounding. */

const tl0 = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });
const tl2 = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 2 });
const num = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });

export const money = (n: number) => tl0.format(n);
export const moneyExact = (n: number) => tl2.format(n);
export const plain = (n: number) => num.format(n);

/* ₺1,2M / ₺245B — for headline figures where the full amount would wrap. */
export const moneyShort = (n: number) => {
  if (n >= 1_000_000) return `₺${(n / 1_000_000).toLocaleString('tr-TR', { maximumFractionDigits: 1 })}M`;
  if (n >= 1_000) return `₺${Math.round(n / 1_000)}B`;
  return `₺${n}`;
};

export const date = (d?: string | Date) =>
  d ? new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

export const dateLong = (d?: string | Date) =>
  d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

/* Axios and fetch errors both end up here; the server sends `{ error }`. */
export const errorText = (err: unknown, fallback: string) => {
  const e = err as { response?: { data?: { error?: string } }; message?: string };
  return e?.response?.data?.error || e?.message || fallback;
};
