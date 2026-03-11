import "./globals.css";
import type { Metadata } from "next";
import { AuthSync } from "../components/auth-sync";
import { Shell } from "../components/shell";
import { ThemeProvider } from "../components/theme-provider";

export const metadata: Metadata = {
  title: "Job Application Hub",
  description: "Human-in-the-loop job application management dashboard.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthSync />
          <Shell>{children}</Shell>
        </ThemeProvider>
      </body>
    </html>
  );
}
