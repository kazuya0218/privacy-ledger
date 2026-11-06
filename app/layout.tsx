import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { Navbar } from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: "Privacy Ledger | 個人情報管理台帳 Webアプリケーション",
  description: "Webサービスへの個人情報登録状況を一元管理し、漏洩リスクや不要アカウントを可視化・整理できるセキュリティツール",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
        <SessionProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>© {new Date().getFullYear()} Privacy Ledger. All rights reserved.</p>
              <p className="text-[11px] text-slate-400">
                本サービスは登録の有無のみを管理し、実際の個人情報（カード番号や暗証番号等）は保存しません。
              </p>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
