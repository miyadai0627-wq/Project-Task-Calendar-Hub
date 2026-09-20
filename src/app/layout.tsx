import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, Sora } from "next/font/google";
import { SessionProvider } from "next-auth/react";

import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

import "./globals.css";

// next/font/google can only self-host the Latin subset of these families —
// Japanese glyphs always fall back to the system JP stack declared in
// globals.css. These fonts therefore style numerals/Latin UI chrome
// (times, durations, the header wordmark); Japanese text renders via the
// OS's own Hiragino/Yu Gothic, which is intentional, not a fallback bug.
const sora = Sora({
  variable: "--font-display-raw",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-body-raw",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Project Task & Calendar Hub",
  description:
    "複数プロジェクトのタスクと週間カレンダーを一元管理するハブ",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Task Hub",
  },
};

// theme-color/color-scheme/viewport-fitはmetadataではなくviewport exportで指定する
// （Next.jsのMetadata APIの仕様）。viewportFit: "cover"は、モーダル等が使う
// env(safe-area-inset-*)をノッチ付き端末で有効化するために必須。
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#18181b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${sora.variable} ${plexSans.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden bg-zinc-50 font-sans text-zinc-900">
        <SessionProvider>{children}</SessionProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
