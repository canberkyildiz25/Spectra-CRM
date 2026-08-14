import Link from 'next/link';

/* The landing page.
 *
 * What was here before was the generated-SaaS template in full: a dark hero
 * with a green radial bloom behind it, a headline half of which was set in a
 * coral-to-green gradient (the unlit half was ink-on-ink and genuinely
 * unreadable), four glass cards each with its own gradient icon, and a stats
 * row claiming "3.2x more sales · 94% satisfaction · 2 min setup".
 *
 * Those numbers were invented. This is a demo CRM with one demo account; there
 * is no cohort to measure. On a portfolio piece a made-up metric reads either
 * as carelessness or as dishonesty, and both are worse than saying nothing.
 *
 * What replaces it is a typographic page on paper: a serif statement, a plain
 * account of what the thing does, and a door into the running app — which is
 * the only proof that matters here.
 */

const CAPABILITIES = [
  {
    n: '01',
    title: 'Satış hattı',
    body: 'Fırsatlar aşamalara ayrılır, panoda sürükle-bırak ile taşınır. Her aşamanın toplam değeri anlık hesaplanır.',
  },
  {
    n: '02',
    title: 'Teklifler',
    body: 'Kalem kalem teklif hazırlanır, PDF olarak çıkarılır ve durumu kabul edilene kadar takip edilir.',
  },
  {
    n: '03',
    title: 'Müşteriler',
    body: 'İletişim geçmişi, ilişkili fırsatlar ve açık görevler tek kayıtta toplanır.',
  },
  {
    n: '04',
    title: 'Görevler',
    body: 'Öncelik ve son tarih ile atanır, panelde bekleyenler önce görünür.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-paper)' }}>
      {/* ── Nav ───────────────────────────────────────────────
          Two destinations, so two links. No mega-menu on a page
          that has one thing to offer. */}
      <header className="border-b border-rule">
        <nav className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="flex h-7 w-7 items-center justify-center"
              style={{ background: 'var(--color-accent-fill)', borderRadius: 'var(--radius-sm)' }}
            >
              <svg className="h-4 w-4" fill="none" stroke="var(--color-paper)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            <span className="text-[15px] font-medium">Spectra CRM</span>
          </div>

          <Link
            href="/auth/login"
            className="text-sm text-ink-2 transition-colors hover:text-ink"
          >
            Giriş
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-5 sm:px-8">
        {/* ── Statement ───────────────────────────────────────
            One weight, one colour. The old headline split itself
            across a gradient and lost half its words to the
            background. */}
        <section className="border-b border-rule py-20 sm:py-28">
          <p className="label mb-6">Satış yönetimi</p>

          <h1 className="mb-8 max-w-2xl text-4xl leading-[1.1] sm:text-5xl md:text-[3.5rem]">
            Hangi işin nerede durduğunu bilmeden satış yönetilmez.
          </h1>

          <p className="mb-10 max-w-xl text-lg leading-relaxed text-ink-2">
            Spectra, müşteriyi, açık fırsatı, gönderilen teklifi ve bekleyen görevi
            aynı ekranda tutar. Hattaki para tek bakışta görünür.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/dashboard" className="btn-primary">
              Demoyu aç
            </Link>
            <Link href="/auth/login" className="btn-secondary">
              Giriş ekranı
            </Link>
          </div>

          <p className="mt-6 text-sm text-ink-3">
            Kayıt gerekmez — demo hesabı hazır, bütün ekranlar açık.
          </p>
        </section>

        {/* ── Capabilities ────────────────────────────────────
            A numbered list separated by rules. Four identical
            glass cards in a row is the shape every generated
            landing page arrives in. */}
        <section className="py-16 sm:py-20">
          <h2 className="mb-10 text-2xl sm:text-3xl">Ne yapar</h2>

          <ol>
            {CAPABILITIES.map((c) => (
              <li
                key={c.n}
                className="grid gap-2 border-t border-rule py-7 sm:grid-cols-[3rem_1fr] sm:gap-8"
              >
                <span className="figure pt-1 text-sm text-ink-3">{c.n}</span>
                <div className="max-w-xl">
                  <h3 className="mb-1.5 text-base">{c.title}</h3>
                  <p className="leading-relaxed text-ink-2">{c.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────
          Says plainly what this is. An employer reading a
          portfolio should not have to guess. */}
      <footer className="border-t border-rule">
        <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
          <p className="mb-3 max-w-xl text-sm leading-relaxed text-ink-2">
            Bu bir portfolyo projesidir. Uçtan uca çalışır: Next.js istemci,
            Express ve MongoDB üzerinde REST API, JWT ile kimlik doğrulama.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="label">Canberk Yıldız</span>
            <a
              href="https://github.com/canberkyildiz25/Spectra-CRM"
              target="_blank"
              rel="noreferrer"
              className="label transition-colors hover:text-accent-ink"
            >
              Kaynak kodu
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
