import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

/* Three faces, which is the ceiling.
 *
 * Geist alone was doing display and body both. It is an excellent UI face and
 * it stays for body and controls — but on a Next.js app deployed to Vercel it
 * is also the most predictable typeface in the world, and it carries no voice
 * at heading size. Instrument Serif takes the headings: tight contrast, made
 * for short heads, and it puts a human hand on the page.
 *
 * Serif for headings, sans for the dense data. Not the other way round.
 * Inter is banned here — it was the previous default. See design.md. */
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
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
    <html
      lang="tr"
      className={`${GeistSans.variable} ${GeistMono.variable} ${instrumentSerif.variable}`}
    >
      <body className="font-sans antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
