"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  ShieldCheck,
  LayoutDashboard,
  Layers,
  KeyRound,
  Trash2,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  PlusCircle,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/services", label: "サービス一覧", icon: Layers },
  { href: "/security", label: "セキュリティ", icon: KeyRound },
  { href: "/cleanup", label: "アカウント整理", icon: Trash2 },
  { href: "/history", label: "操作履歴", icon: History },
  { href: "/settings", label: "設定", icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* ロゴ */}
          <div className="flex items-center gap-8">
            <Link href={session ? "/dashboard" : "/"} className="flex items-center gap-2.5 font-bold text-slate-900 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-white shadow-sm group-hover:bg-blue-700 transition-colors">
                <ShieldCheck className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-base tracking-tight font-extrabold text-navy-950">Privacy Ledger</span>
                <span className="text-[10px] text-slate-500 font-normal leading-none -mt-0.5">個人情報管理台帳</span>
              </div>
            </Link>

            {/* デスクトップ ナビリンク */}
            {session && (
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? "bg-slate-100 text-blue-700 font-semibold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* 右側アクション */}
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <Link href="/services/new" className="hidden sm:inline-flex">
                  <Button size="sm" className="gap-1.5 shadow-sm">
                    <PlusCircle className="h-4 w-4" />
                    サービス追加
                  </Button>
                </Link>

                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-medium text-slate-800">{session.user?.name || "ユーザー"}</span>
                  <span className="text-[11px] text-slate-500">{session.user?.email}</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-slate-600 hover:text-red-600 hover:bg-red-50 hidden sm:inline-flex gap-1"
                >
                  <LogOut className="h-4 w-4" />
                  ログアウト
                </Button>

                {/* モバイルメニュー開閉ボタン */}
                <button
                  type="button"
                  className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    ログイン
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">無料で始める</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* モバイルナビンドロワー */}
      {mobileMenuOpen && session && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <div className="px-3 py-2 mb-2 bg-slate-50 rounded-lg">
            <p className="text-sm font-semibold text-slate-900">{session.user?.name || "ユーザー"}</p>
            <p className="text-xs text-slate-500">{session.user?.email}</p>
          </div>
          <Link
            href="/services/new"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white mb-2"
          >
            <PlusCircle className="h-4 w-4" />
            サービスを新規登録
          </Link>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? "bg-slate-100 text-blue-700 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
            >
              <LogOut className="h-4 w-4" />
              ログアウト
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
