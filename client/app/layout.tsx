import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import ThemeProvider from "@/components/ThemeProvider";

/* Three faces, which is the ceiling.
 *
 * The serif is gone. Instrument Serif gave the headings a voice but the wrong
 * one — a bracketed serif over a sales table reads as a magazine, not an
 * instrument. Space Grotesk keeps the drawn quality without the register: a
 * grotesque with enough character to carry a wordmark and enough discipline to
 * sit above dense data.
 *
 * Geist takes body and controls, Geist Mono every figure. Inter is banned. */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display-face",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Spectra CRM",
  description:
    "Müşteri, fırsat, görev ve teklif yönetimi — satış hattını tek ekranda tutan CRM.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /* suppressHydrationWarning is required by next-themes: the theme class is
       written to <html> before React hydrates, so the server and client markup
       differ by design on that one attribute. */
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} ${spaceGrotesk.variable}`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
