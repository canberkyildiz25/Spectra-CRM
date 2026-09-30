/* The temperature scale — the only colour system in the app (design.md).
 *
 * Stage names used to differ page to page. One table now, and every page
 * reads its labels and tones from here.
 */

export type Stage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
export type Tone = 'cold' | 'cool' | 'warm' | 'hot' | 'won' | 'ash';

export const STAGES: { key: Stage; label: string; short: string; tone: Tone; probability: number }[] = [
  { key: 'lead', label: 'Lead', short: 'LEAD', tone: 'cold', probability: 10 },
  { key: 'qualified', label: 'Qualified', short: 'QUAL', tone: 'cool', probability: 25 },
  { key: 'proposal', label: 'Proposal', short: 'PROP', tone: 'warm', probability: 50 },
  { key: 'negotiation', label: 'Negotiation', short: 'NEG', tone: 'hot', probability: 75 },
  { key: 'closed-won', label: 'Won', short: 'WON', tone: 'won', probability: 100 },
  { key: 'closed-lost', label: 'Lost', short: 'LOST', tone: 'ash', probability: 0 },
];

export const OPEN_STAGES = STAGES.slice(0, 4);

export const stageOf = (key: string) => STAGES.find((s) => s.key === key) ?? STAGES[0];

/* A tone as a CSS value. Components never write a hex — they ask for a tone. */
export const toneVar = (tone: Tone) => `var(--color-${tone})`;

/* Everything else that has a state borrows the same scale, so a colour means
   one thing across the app: how close something is to done. */
export const CUSTOMER_STATUS: Record<string, { label: string; tone: Tone }> = {
  prospect: { label: 'Prospect', tone: 'cold' },
  customer: { label: 'Customer', tone: 'won' },
  inactive: { label: 'Inactive', tone: 'ash' },
};

export const PROPOSAL_STATUS: Record<string, { label: string; tone: Tone }> = {
  draft: { label: 'Draft', tone: 'ash' },
  sent: { label: 'Sent', tone: 'warm' },
  accepted: { label: 'Accepted', tone: 'won' },
  rejected: { label: 'Rejected', tone: 'ash' },
};

export const TASK_STATUS: Record<string, { label: string; tone: Tone }> = {
  pending: { label: 'To do', tone: 'ash' },
  'in-progress': { label: 'In progress', tone: 'warm' },
  completed: { label: 'Done', tone: 'won' },
};

/* Priority as heat: an urgent task is a hot one. */
export const PRIORITY: Record<string, { label: string; tone: Tone }> = {
  low: { label: 'Low', tone: 'cold' },
  medium: { label: 'Medium', tone: 'warm' },
  high: { label: 'High', tone: 'hot' },
};
