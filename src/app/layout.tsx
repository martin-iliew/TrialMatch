import type { Metadata } from "next";
import "./globals.css";
import SmoothScrolling from "@/components/common/smooth-scrolling";
import { mpexSans, mpexSansRounded } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "TrialMatch — Clinical Trial Site Matching",
  description: "Match the right clinics to your clinical trial in minutes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${mpexSans.variable} ${mpexSansRounded.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-default text-primary antialiased">
        <SmoothScrolling>{children}</SmoothScrolling>
      </body>
    </html>
  );
}
