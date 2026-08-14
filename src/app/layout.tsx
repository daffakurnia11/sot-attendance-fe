import "./globals.css";

import type { Metadata } from "next";

import { AppProvider } from "@/components/providers";

export const metadata: Metadata = {
  title: "SOT Attendance | Member Access",
  description: "Secure Discord access for SOT attendance.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
