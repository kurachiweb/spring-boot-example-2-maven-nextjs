import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryClientProvider } from "@/components/providers/QueryClientProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AtamiShare - 短文投稿サービス",
  description:
    "AtamiShareは熱海の情報を共有するソーシャルメディアプラットフォームです",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryClientProvider>
          <div className="flex min-h-screen flex-col bg-gray-50">
            <Header />
            <main className="container mx-auto max-w-4xl flex-1 px-4 py-6">
              {children}
            </main>
            <Footer />
          </div>
        </QueryClientProvider>
      </body>
    </html>
  );
}
