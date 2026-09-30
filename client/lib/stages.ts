/* The temperature scale — the only colour system in the app (design.md).
 *
 * Stage names used to differ page to page: the dashboard said "Aday" and
 * "Görüşme", the board said "Lead" and "Müzakere". One table now, and every
 * page reads its labels and tones from here.
 */

export type Stage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
export type Tone = 'cold' | 'cool' | 'warm' | 'hot' | 'won' | 'ash';

export const STAGES: { key: Stage; label: string; short: string; tone: Tone; probability: number }[] = [
  { key: 'lead', label: 'Aday', short: 'ADY', tone: 'cold', probability: 10 },
  { key: 'qualified', label: 'Nitelikli', short: 'NTL', tone: 'cool', probability: 25 },
  { key: 'proposal', label: 'Teklif', short: 'TKL', tone: 'warm', probability: 50 },
  { key: 'negotiation', label: 'Müzakere', short: 'MZK', tone: 'hot', probability: 75 },
  { key: 'closed-won', label: 'Kazanıldı', short: 'KZN', tone: 'won', probability: 100 },
  { key: 'closed-lost', label: 'Kaybedildi', short: 'KYB', tone: 'ash', probability: 0 },
];

export const OPEN_STAGES = STAGES.slice(0, 4);

export const stageOf = (key: string) => STAGES.find((s) => s.key === key) ?? STAGES[0];

/* A tone as a CSS value. Components never write a hex — they ask for a tone. */
export const toneVar = (tone: Tone) => `var(--color-${tone})`;

/* Everything else that has a state borrows the same scale, so a colour means
   one thing across the app: how close something is to done. */
export const CUSTOMER_STATUS: Record<string, { label: string; tone: Tone }> = {
  prospect: { label: 'Aday', tone: 'cold' },
  customer: { label: 'Müşteri', tone: 'won' },
  inactive: { label: 'Pasif', tone: 'ash' },
};

export const PROPOSAL_STATUS: Record<string, { label: string; tone: Tone }> = {
  draft: { label: 'Taslak', tone: 'ash' },
  sent: { label: 'Gönderildi', tone: 'warm' },
  accepted: { label: 'Kabul edildi', tone: 'won' },
  rejected: { label: 'Reddedildi', tone: 'ash' },
};

export const TASK_STATUS: Record<string, { label: string; tone: Tone }> = {
  pending: { label: 'Bekliyor', tone: 'ash' },
  'in-progress': { label: 'Sürüyor', tone: 'warm' },
  completed: { label: 'Tamamlandı', tone: 'won' },
};

/* Priority as heat: an urgent task is a hot one. */
export const PRIORITY: Record<string, { label: string; tone: Tone }> = {
  low: { label: 'Düşük', tone: 'cold' },
  medium: { label: 'Orta', tone: 'warm' },
  high: { label: 'Yüksek', tone: 'hot' },
};
