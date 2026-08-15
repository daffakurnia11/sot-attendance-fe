import "../styles/globals.css";

import type { Metadata } from "next";

import { AppProvider } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "SOT Attendance | Member Access",
    template: "%s | SOT Attendance",
  },
  description: "Secure Discord access for SOT attendance.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full bg-[var(--color-background)] antialiased [color-scheme:dark]">
      <body className="min-h-full bg-[var(--color-background)] font-sans text-base text-[var(--color-foreground)]">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
