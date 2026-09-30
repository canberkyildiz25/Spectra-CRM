import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Wordmark } from '@/components/brand/SpectraMark';
import Readout from '@/components/landing/Readout';
import LandingFx from '@/components/landing/LandingFx';
import { DEMO_DEALS, dealsIn, totalOf, type DemoDeal } from '@/lib/demo';
import { OPEN_STAGES, STAGES, toneVar, type Tone } from '@/lib/stages';
import { money, moneyShort } from '@/lib/format';

/* Landing — Narrative Workflow with a spectrum opening (design.md).
 *
 * Every figure on this page is computed from lib/demo.ts, which mirrors the
 * seed the demo account opens onto. Nothing is invented: the previous
 * generations of this page claimed "3.2x more sales" for a one-account demo,
 * and that is the kind of thing this page exists not to do.
 */

const openTotal = totalOf(DEMO_DEALS.filter((d) => OPEN_STAGES.some((s) => s.key === d.stage)));
const won = dealsIn('closed-won');
const lost = dealsIn('closed-lost');
const winRate = Math.round((won.length / (won.length + lost.length)) * 100);

type Band = {
  id: string;
  n: string;
  label: string;
  tone: Tone;
  title: string;
  body: string;
  ledgers: { caption: string; tone: Tone; deals: DemoDeal[] }[];
  note: string;
};

const stage = (key: string) => STAGES.find((s) => s.key === key)!;
const share = (deals: DemoDeal[]) => Math.round((totalOf(deals) / openTotal) * 100);

const BANDS: Band[] = [
  {
    id: 'asama-aday',
    n: '01',
    label: stage('lead').label,
    tone: 'cold',
    title: 'Bir isim, bir ihtiyaç, henüz bütçe yok.',
    body: 'Fırsat bir müşteri kaydına bağlanarak açılır. Olasılık %10’dan başlar ve kart panonun en soldaki sütununda bekler.',
    ledgers: [{ caption: `${dealsIn('lead').length} fırsat`, tone: 'cold', deals: dealsIn('lead') }],
    note: `Açık hattın %${share(dealsIn('lead'))}’i`,
  },
  {
    id: 'asama-nitelikli',
    n: '02',
    label: stage('qualified').label,
    tone: 'cool',
    title: 'Karar veren belli, ihtiyaç doğrulandı.',
    body: 'Kartı bir sütun sağa sürüklemek aşamayı ve olasılığı birlikte günceller. Ayrı bir form doldurulmaz.',
    ledgers: [{ caption: `${dealsIn('qualified').length} fırsat`, tone: 'cool', deals: dealsIn('qualified') }],
    note: `Açık hattın %${share(dealsIn('qualified'))}’i`,
  },
  {
    id: 'asama-teklif',
    n: '03',
    label: stage('proposal').label,
    tone: 'warm',
    title: 'Kalem kalem teklif, yazdırılabilir belge.',
    body: 'Teklif ürün ve hizmet satırlarından hesaplanır, KDV ayrı gösterilir. Belge PDF olarak yazdırılır; durumu gönderildi, kabul ya da ret olarak izlenir.',
    ledgers: [{ caption: `${dealsIn('proposal').length} fırsat`, tone: 'warm', deals: dealsIn('proposal') }],
    note: `Açık hattın %${share(dealsIn('proposal'))}’i`,
  },
  {
    id: 'asama-muzakere',
    n: '04',
    label: stage('negotiation').label,
    tone: 'hot',
    title: 'Fiyat masada. Hattın en sıcak yeri.',
    body: 'Olasılık %75. Açık hattın en büyük payı çoğu zaman buradadır; demo verisinde de öyle. Panelde bu sütun ilk bakılan yerdir.',
    ledgers: [{ caption: `${dealsIn('negotiation').length} fırsat`, tone: 'hot', deals: dealsIn('negotiation') }],
    note: `Açık hattın %${share(dealsIn('negotiation'))}’i`,
  },
  {
    id: 'asama-kapanis',
    n: '05',
    label: 'Kapanış',
    tone: 'won',
    title: 'Kazanılan da kaybedilen de kayda geçer.',
    body: 'Kaybedilen fırsat kırmızıyla işaretlenmez; olağan bir sonuçtur, alarm değil. Kazanma oranı bu iki sütundan hesaplanır.',
    ledgers: [
      { caption: `${stage('closed-won').label} · ${won.length}`, tone: 'won', deals: won },
      { caption: `${stage('closed-lost').label} · ${lost.length}`, tone: 'ash', deals: lost },
    ],
    note: `%${winRate} kazanma oranı · ${won.length} / ${won.length + lost.length} kapanış`,
  },
];

const SCREENS = [
  { href: '/dashboard', name: 'Panel', body: 'Açık hat, kazanılan tutar, teklif kabulü, son görevler ve son müşteriler.' },
  { href: '/opportunities', name: 'Fırsat panosu', body: 'Altı sütun. Kart sürüklenince aşama da olasılık da güncellenir.' },
  { href: '/proposals', name: 'Teklifler', body: 'Durum takibi ve yazdırılabilir teklif belgesi.' },
  { href: '/customers', name: 'Müşteriler', body: 'İletişim bilgisi, bağlı fırsatlar ve teklifler tek kayıtta.' },
  { href: '/tasks', name: 'Görevler', body: 'Öncelik sıcaklıkla işaretli: acil iş sıcak renkte.' },
];

const STACK = [
  ['İstemci', 'Next.js 16 · React 19 · TypeScript · Tailwind 4'],
  ['Hareket', 'GSAP ScrollTrigger bu sayfada, Framer Motion uygulamada'],
  ['API', 'Express · MongoDB (Mongoose) · REST'],
  ['Kimlik', 'JWT, Bearer token'],
  ['Barındırma', 'Vercel — istemci ve API ayrı projeler'],
];

const tone = (t: Tone) => ({ '--tone': toneVar(t) }) as React.CSSProperties;

export default function Home() {
  return (
    <div className="min-h-screen bg-ground">
      <a href="#akis" className="skip-link">
        İçeriğe geç
      </a>

      {/* ── Nav · N1: wordmark and two doors ─────────────── */}
      <header className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-4 py-5 sm:px-8 lg:px-12">
        <Link href="/" aria-label="Spectra CRM ana sayfa" className="rounded-sm">
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Ana gezinme">
          <a href="#akis" className="btn-ghost hidden sm:inline-flex">
            Akış
          </a>
          <Link href="/auth/login" className="btn-ghost">
            Giriş
          </Link>
          <Link href="/dashboard" className="btn btn-sm">
            Demoyu aç
          </Link>
        </nav>
      </header>

      <main>
        {/* ── Opening: the readout ─────────────────────────── */}
        <section className="mx-auto max-w-[1320px] px-4 pb-16 pt-[clamp(2rem,6vh,4.5rem)] sm:px-8 lg:px-12">
          <p className="label rise" data-now data-delay="0">
            Satış hattı · {DEMO_DEALS.length} fırsat · demo veri seti
          </p>
          <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-end lg:gap-12">
            <h1 className="split text-[clamp(3.1rem,9.6vw,8.75rem)] text-fg" data-now>
              <span className="text-cold">Soğuk</span> adaydan
              <br />
              <span className="text-won">kazanılan</span> işe.
            </h1>
            <div className="lg:pb-3">
              <p className="rise max-w-[36rem] leading-relaxed text-fg-2" data-now data-delay="450">
                Spectra müşteriyi, açık fırsatı, gönderilen teklifi ve bekleyen görevi aynı ekranda
                tutar. Her fırsat aşamasının rengini taşır: aday soğuk mavi, müzakere sıcak turuncu.
              </p>
              <div className="rise mt-6 flex flex-wrap items-center gap-3" data-now data-delay="600">
                <Link href="/dashboard" className="btn magnetic">
                  Demoyu aç
                  <ArrowUpRight className="size-4" aria-hidden />
                </Link>
                <Link href="/auth/login" className="btn-secondary">
                  Giriş ekranı
                </Link>
              </div>
              <p className="rise mt-3 text-sm text-fg-3" data-now data-delay="700">
                Kayıt gerekmez, demo hesabı hazır.
              </p>
            </div>
          </div>

          <div className="mt-12 lg:mt-14">
            <Readout />
            <p className="rise mt-5 max-w-xl text-sm text-fg-3" data-now data-delay="900">
              Demo hesabındaki {DEMO_DEALS.length} fırsat. Her çizgi bir fırsat; boyu tutarı, rengi
              aşamayı gösterir. Açık hatta {moneyShort(openTotal)} var.
            </p>
          </div>
        </section>

        {/* ── Workflow: five stops ─────────────────────────── */}
        <section id="akis" className="border-t border-line">
          <div className="mx-auto max-w-[1320px] px-4 pt-20 sm:px-8 lg:px-12 lg:pt-28">
            <p className="label">Akış</p>
            <h2 className="split mt-4 max-w-[14ch] text-[clamp(2.4rem,6.5vw,5.25rem)]">
              Bir fırsatın beş durağı.
            </h2>
            <p className="rise mt-6 max-w-[38rem] leading-relaxed text-fg-2">
              Panoda her sütun bir aşamadır ve kartlar soldan sağa ısınır. Aşağıdaki fırsatlar demo
              hesabında şu anda nerede duruyorlarsa oradalar.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-[1320px] px-4 sm:px-8 lg:grid-cols-[2.25rem_minmax(0,1fr)] lg:gap-10 lg:px-12">
            {/* The rail fills stage by stage while its band is on screen. */}
            <div className="hidden lg:block" aria-hidden>
              <div className="sticky top-[30vh] flex flex-col gap-1.5">
                {BANDS.map((b) => (
                  <span key={b.id} className="relative block h-16 w-[3px] overflow-hidden rounded-full bg-line">
                    <span
                      data-rail-seg={b.id}
                      className="absolute inset-0 origin-top rounded-full"
                      style={{ background: toneVar(b.tone) }}
                    />
                  </span>
                ))}
              </div>
            </div>

            <ol className="min-w-0">
              {BANDS.map((b) => (
                <li key={b.id} id={b.id} className="relative pb-20 pt-10 lg:pb-28">
                  <span
                    aria-hidden
                    className="sweep absolute inset-x-0 top-0 block h-[2px]"
                    style={{ background: toneVar(b.tone) }}
                  />
                  <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
                    <div>
                      <p className="flex items-baseline gap-4">
                        <span className="readout text-[clamp(3.5rem,9vw,7rem)]" style={{ color: toneVar(b.tone) }}>
                          {b.n}
                        </span>
                        <span className="label text-fg-2">{b.label}</span>
                      </p>
                      <h3 className="split display mt-5 text-[clamp(1.9rem,3.6vw,3rem)] text-fg">{b.title}</h3>
                      <p className="rise mt-5 max-w-[34rem] leading-relaxed text-fg-2">{b.body}</p>
                    </div>

                    <div className="rise min-w-0 self-end">
                      {b.ledgers.map((l) => (
                        <div key={l.caption} className="mb-8 last:mb-0">
                          <div className="mb-2 flex items-center justify-between gap-4">
                            <span className="chip" style={tone(l.tone)}>
                              {l.caption}
                            </span>
                            <span className="figure text-sm text-fg">{money(totalOf(l.deals))}</span>
                          </div>
                          <ul className="border-t border-line">
                            {l.deals.map((d) => (
                              <li
                                key={`${d.company}-${d.deal}`}
                                className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 border-b border-line py-3"
                              >
                                <span className="min-w-0">
                                  <span className="block truncate text-fg">{d.company}</span>
                                  <span className="block truncate text-sm text-fg-3">{d.deal}</span>
                                </span>
                                <span className="figure text-sm text-fg-2">{money(d.amount)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <p className="label mt-4">{b.note}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Inside: an index of the screens ──────────────── */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-[1320px] px-4 py-20 sm:px-8 lg:px-12 lg:py-28">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
              <div>
                <p className="label">İçeride</p>
                <h2 className="split mt-4 text-[clamp(2.2rem,5vw,4rem)]">Beş ekran, bir veri seti.</h2>
                <p className="rise mt-5 max-w-[30rem] leading-relaxed text-fg-2">
                  Bağlantılar doğrudan demoya açılır. Oturum kendiliğinden kurulur; giriş formunu
                  görmek isteyen için giriş ekranı ayrıca duruyor.
                </p>
              </div>
              <ol className="border-t border-line">
                {SCREENS.map((s, i) => (
                  <li key={s.href} className="border-b border-line">
                    <Link
                      href={s.href}
                      className="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-4 py-5 transition-colors hover:bg-raised sm:py-6"
                    >
                      <span className="figure text-sm text-fg-3">{String(i + 1).padStart(2, '0')}</span>
                      <span className="min-w-0">
                        <span className="display block text-[clamp(1.4rem,2.6vw,2rem)] text-fg">{s.name}</span>
                        <span className="mt-1 block text-sm text-fg-2">{s.body}</span>
                      </span>
                      <ArrowUpRight
                        className="size-5 text-fg-3 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ── Stack: a spec sheet ──────────────────────────── */}
        <section className="border-t border-line bg-raised">
          <div className="mx-auto grid max-w-[1320px] gap-10 px-4 py-20 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:px-12">
            <div>
              <p className="label">Altyapı</p>
              <h2 className="split mt-4 text-[clamp(2rem,4.2vw,3.25rem)]">Uçtan uca çalışır.</h2>
            </div>
            <dl className="border-t border-line">
              {STACK.map(([k, v]) => (
                <div key={k} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
                  <dt className="label pt-0.5">{k}</dt>
                  <dd className="text-fg">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      {/* ── Footer · Ft5 statement ──────────────────────────── */}
      <footer className="border-t border-line">
        <div className="mx-auto max-w-[1320px] px-4 pb-10 pt-20 sm:px-8 lg:px-12 lg:pt-28">
          <p className="split display text-[clamp(3.25rem,13vw,11rem)] text-fg">Hat açık.</p>
          <div className="mt-10 flex flex-col gap-8 border-t border-line pt-8 md:flex-row md:items-end md:justify-between">
            <p className="max-w-[36rem] text-sm leading-relaxed text-fg-2">
              Bu bir portfolyo projesidir ve uçtan uca çalışır: Next.js istemci, Express ve MongoDB
              üzerinde REST API, JWT ile kimlik doğrulama. Sayfadaki bütün rakamlar demo veri
              setinden hesaplanır.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/dashboard" className="btn">
                Demoyu aç
              </Link>
              <a
                href="https://github.com/canberkyildiz25/Spectra-CRM"
                target="_blank"
                rel="noreferrer"
                className="label transition-colors hover:text-fg"
              >
                Kaynak kodu ↗
              </a>
              <span className="label">Canberk Yıldız</span>
            </div>
          </div>
        </div>
      </footer>

      <LandingFx />
    </div>
  );
}
