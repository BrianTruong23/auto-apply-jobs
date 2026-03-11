import "./globals.css";
import type { Metadata } from "next";
import { AuthSync } from "../components/auth-sync";
import { Shell } from "../components/shell";

export const metadata: Metadata = {
  title: "Job Application Hub",
  description: "Human-in-the-loop job application management dashboard.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthSync />
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
