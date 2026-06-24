import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope, Fraunces } from "next/font/google";
import "@/app/globals.css";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Social Automation Platform",
  description: "Operational control center for editorial workflows, approvals and publishing.",
  metadataBase: new URL(process.env.APP_BASE_URL ?? "https://social-automation.local"),
  alternates: {
    canonical: "/dashboard",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Social Automation Platform",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: "Operational control center for editorial workflows, approvals and publishing.",
  };

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${bodyFont.variable} ${displayFont.variable} app-shell antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
