'use client';

import { ThemeProvider as NextThemes } from 'next-themes';

/**
 * Dark is the default register for this tool; light is the alternative rather
 * than the baseline. `enableSystem` is off on purpose — a CRM someone leaves
 * open all day should not change colour at sunset because the OS said so.
 * The choice is the user's and it persists.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemes>
  );
}
