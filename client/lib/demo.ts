import type { Stage } from './stages';

/* The demo dataset, as the landing page and the sign-in readout draw it.
 *
 * This mirrors the opportunities in server/src/seed.ts — the same fifteen
 * deals the demo account opens onto. The public pages render before anyone is
 * signed in, so they cannot ask the API; they read this copy instead. Change
 * the two together, the same way DEMO_CREDENTIALS and the seed user already
 * travel together.
 */
export type DemoDeal = { company: string; deal: string; amount: number; stage: Stage };

export const DEMO_DEALS: DemoDeal[] = [
  { company: 'Meridian Logistics', deal: 'Platform subscription', amount: 48000, stage: 'lead' },
  { company: 'Starline Textiles', deal: 'Production dashboard', amount: 58000, stage: 'lead' },
  { company: 'Starline Textiles', deal: 'Consulting', amount: 35000, stage: 'qualified' },
  { company: 'Falcon Energy', deal: 'Field automation', amount: 190000, stage: 'qualified' },
  { company: 'Northfield Software', deal: 'Software license', amount: 85000, stage: 'proposal' },
  { company: 'Northfield Software', deal: 'Support plan', amount: 42000, stage: 'proposal' },
  { company: 'Meridian Logistics', deal: 'Fleet tracking', amount: 76000, stage: 'proposal' },
  { company: 'Ironclad Construction', deal: 'ERP rollout', amount: 250000, stage: 'negotiation' },
  { company: 'Bellwether Tech', deal: 'Cloud migration', amount: 145000, stage: 'negotiation' },
  { company: 'Harvest Foods', deal: 'System upgrade', amount: 62000, stage: 'closed-won' },
  { company: 'Ironclad Construction', deal: 'Site app', amount: 96000, stage: 'closed-won' },
  { company: 'Harvest Foods', deal: 'Warehouse integration', amount: 54000, stage: 'closed-won' },
  { company: 'Sunpeak Media', deal: 'Ad campaign panel', amount: 33000, stage: 'closed-won' },
  { company: 'Sunpeak Media', deal: 'Content management', amount: 28000, stage: 'closed-lost' },
  { company: 'Bellwether Tech', deal: 'License renewal', amount: 24000, stage: 'closed-lost' },
];

export const DEMO_CREDENTIALS = { email: 'demo@spectra.com', password: 'demo1234' };

export const dealsIn = (stage: Stage) => DEMO_DEALS.filter((d) => d.stage === stage);
export const totalOf = (deals: DemoDeal[]) => deals.reduce((s, d) => s + d.amount, 0);
