import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

/* Geist carries both roles — display and body — at different weights, with
 * Geist Mono for every figure. Inter is banned in this project; it was the
 * previous default and reads as generated. See design.md § Typography. */

export const metadata: Metadata = {
  title: "Spectra CRM",
  description:
    "Müşteri, fırsat, görev ve teklif yönetimi — satış hattını tek ekranda tutan CRM.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="tr"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="font-sans antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
