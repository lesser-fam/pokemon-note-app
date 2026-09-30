import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Matchup Note",
  description: "ポケモン対戦の選出と振り返りを記録する学習支援アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <footer className="mt-auto border-t border-black/10 bg-[var(--background)] px-4 py-6 text-sm leading-6 text-[var(--foreground)] sm:px-6">
          <div className="mx-auto max-w-7xl space-y-2 opacity-75">
            <p>
              Matchup Noteは個人が運営する非公式のファンサイトです。株式会社ポケモン、任天堂株式会社、株式会社ゲームフリーク、株式会社クリーチャーズ、およびその他の関連企業とは一切関係ありません。
            </p>
            <p>
              「ポケットモンスター」「ポケモン」「Pokémon」および関連する名称・画像・商標等の権利は、各権利者に帰属します。
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
