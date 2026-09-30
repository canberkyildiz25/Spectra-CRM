import Link from 'next/link';
import { Wordmark } from '@/components/brand/SpectraMark';
import Readout from '@/components/landing/Readout';
import LandingFx from '@/components/landing/LandingFx';

/* Auth — split readout (design.md § Macrostructure). The left half is the
   same spectrum the landing opens on, compact; the right half is the form on
   the raised surface. Below lg the readout folds away and only the form is
   left, because on a phone the form is the whole job. */
export default function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh bg-ground lg:grid-cols-[minmax(0,1.1fr)_minmax(26rem,0.9fr)]">
      <aside className="relative hidden flex-col justify-between border-r border-line px-12 py-10 lg:flex">
        <Link href="/" aria-label="Spectra CRM home" className="self-start rounded-sm">
          <Wordmark />
        </Link>

        <div>
          <p className="label rise" data-now>
            Demo dataset
          </p>
          <p className="split display mt-4 max-w-[12ch] text-[clamp(2.75rem,4.8vw,4.5rem)] text-fg" data-now>
            Every deal in the pipeline is a line.
          </p>
          <div className="mt-12">
            <Readout compact />
          </div>
        </div>

        <p className="text-sm text-fg-3">A portfolio project · Canberk Yıldız</p>
      </aside>

      <main className="flex min-w-0 flex-col bg-raised px-4 py-8 sm:px-10 lg:px-14">
        <Link href="/" aria-label="Spectra CRM home" className="self-start rounded-sm lg:hidden">
          <Wordmark />
        </Link>
        <div className="mx-auto flex w-full max-w-[24rem] flex-1 flex-col justify-center py-10">{children}</div>
      </main>

      <LandingFx />
    </div>
  );
}
