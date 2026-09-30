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
  { company: 'Global Lojistik', deal: 'Platform abonelik', amount: 48000, stage: 'lead' },
  { company: 'Yıldız Tekstil', deal: 'Üretim paneli', amount: 58000, stage: 'lead' },
  { company: 'Yıldız Tekstil', deal: 'Danışmanlık', amount: 35000, stage: 'qualified' },
  { company: 'Şahin Enerji', deal: 'Saha otomasyonu', amount: 190000, stage: 'qualified' },
  { company: 'ABC Teknoloji', deal: 'Yazılım lisansı', amount: 85000, stage: 'proposal' },
  { company: 'ABC Teknoloji', deal: 'Destek paketi', amount: 42000, stage: 'proposal' },
  { company: 'Global Lojistik', deal: 'Filo takip', amount: 76000, stage: 'proposal' },
  { company: 'Demir İnşaat', deal: 'ERP kurulum', amount: 250000, stage: 'negotiation' },
  { company: 'Demir Tech', deal: 'Bulut göçü', amount: 145000, stage: 'negotiation' },
  { company: 'Öztürk Gıda', deal: 'Sistem güncelleme', amount: 62000, stage: 'closed-won' },
  { company: 'Demir İnşaat', deal: 'Saha uygulaması', amount: 96000, stage: 'closed-won' },
  { company: 'Öztürk Gıda', deal: 'Depo entegrasyonu', amount: 54000, stage: 'closed-won' },
  { company: 'Güneş Medya', deal: 'Reklam paneli', amount: 33000, stage: 'closed-won' },
  { company: 'Güneş Medya', deal: 'İçerik yönetimi', amount: 28000, stage: 'closed-lost' },
  { company: 'Demir Tech', deal: 'Lisans yenileme', amount: 24000, stage: 'closed-lost' },
];

export const DEMO_CREDENTIALS = { email: 'demo@spectra.com', password: 'demo1234' };

export const dealsIn = (stage: Stage) => DEMO_DEALS.filter((d) => d.stage === stage);
export const totalOf = (deals: DemoDeal[]) => deals.reduce((s, d) => s + d.amount, 0);
