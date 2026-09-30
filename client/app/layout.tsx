import type { Metadata, Viewport } from 'next';
import { Hubot_Sans, Mona_Sans, Martian_Mono } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/Toast';

/* Three faces, all variable in width — that axis is the typographic idea
   (design.md § Typography). Hubot condensed for figures and headings, Mona
   for the interface, Martian Mono for data. */
const hubot = Hubot_Sans({
  subsets: ['latin', 'latin-ext'],
  axes: ['wdth'],
  variable: '--nf-hubot',
  display: 'swap',
});

const mona = Mona_Sans({
  subsets: ['latin', 'latin-ext'],
  axes: ['wdth'],
  variable: '--nf-mona',
  display: 'swap',
});

const martian = Martian_Mono({
  subsets: ['latin', 'latin-ext'],
  axes: ['wdth'],
  variable: '--nf-martian',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://client-xi-three-50.vercel.app'),
  title: {
    default: 'Spectra CRM — From cold lead to won deal',
    template: '%s — Spectra CRM',
  },
  description:
    'Customers, deals, proposals and tasks in one CRM. Every deal carries the colour of its stage, from a cold lead to a hot negotiation. The demo account is ready, no sign-up needed.',
};

export const viewport: Viewport = {
  themeColor: '#0a0b0d',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    /* Font variables sit on <html>, not <body>: Tailwind resolves the
       --font-* tokens at :root, where a body-scoped variable is empty. */
    <html
      lang="en"
      className={`${hubot.variable} ${mona.variable} ${martian.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Motion pre-states apply only when JS runs and the reader has not
            asked for reduced motion; otherwise the content is simply there. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion')}catch(e){}`,
          }}
        />
      </head>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
