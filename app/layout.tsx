import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ViewTransition } from "react";
import SiteShell from "@/components/ui/site-shell";
import { theme } from "@/lib/theme";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

// Used by the skill wall in the side margins
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Your Name | Portfolio",
  description: "Web apps, mobile apps and AI projects.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable}`}
      style={{ colorScheme: "dark" }}
    >
      <body className="bg-black antialiased">
        <main
          className="min-h-screen bg-black font-[family-name:var(--font-geist)] text-[var(--fg)]"
          style={theme}
        >
          <div className="isolate mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
            {/* The backdrop, skill walls and drawer live in here and stay put between pages */}
            <SiteShell>
              {/* Only the page content animates when you navigate (see globals.css) */}
              <ViewTransition default="page">{children}</ViewTransition>
            </SiteShell>
          </div>
        </main>
      </body>
    </html>
  );
}
