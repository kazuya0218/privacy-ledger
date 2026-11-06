"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Layers,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  History,
  PlusCircle,
  Trash2,
  ExternalLink,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardStats } from "@/types";
import { formatDateTime } from "@/lib/utils";

const COLORS = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#1d4ed8", "#1e40af"];

export function DashboardContent() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) {
        const json = await res.json();
        setData(json.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-sm text-slate-500">ダッシュボードを読み込み中...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-12 text-center text-slate-500">
        データの読み込みに失敗しました。ページを再読み込みしてください。
      </div>
    );
  }

  const pieData = [
    { name: "利用中", value: data.activeServices, color: "#10b981" },
    { name: "停止予定", value: data.suspendedServices, color: "#f59e0b" },
    { name: "退会済", value: data.cancelledServices, color: "#94a3b8" },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-8">
      {/* ページヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            ダッシュボード
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            個人情報の登録先とセキュリティ状況の全体サマリー
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/services/new">
            <Button className="gap-2 shadow-sm">
              <PlusCircle className="w-4 h-4" />
              サービスを登録
            </Button>
          </Link>
          <Link href="/cleanup">
            <Button variant="outline" className="gap-2">
              <Trash2 className="w-4 h-4 text-amber-600" />
              アカウント整理
            </Button>
          </Link>
        </div>
      </div>

      {/* サマリーカードグリッド */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">登録サービス総数</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-navy-950">{data.totalServices}</div>
            <p className="text-xs text-slate-500 mt-1">
              台帳で管理されているサービス
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">利用中のサービス</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-600">{data.activeServices}</div>
            <p className="text-xs text-slate-500 mt-1">
              現在アクティブに利用中
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">不要・停止予定</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-amber-600">{data.suspendedServices}</div>
            <p className="text-xs text-slate-500 mt-1">
              退会手続きが未完了のアカウント
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">二段階認証設定率</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-indigo-600">{data.twoFactorRate}%</div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full"
                style={{ width: `${data.twoFactorRate}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 注意事項・アラートバナー */}
      {data.highRiskCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
              <ShieldAlert className="w-5 h-5 shrink-0" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-900">
                セキュリティ上の確認事項が {data.highRiskCount} 件あります
              </h4>
              <p className="text-xs text-amber-700">
                重要情報（決済・口座等）を登録中で二段階認証が未設定のサービス、または放置アカウントが存在します。
              </p>
            </div>
          </div>
          <Link href="/security">
            <Button size="sm" variant="outline" className="border-amber-300 text-amber-900 hover:bg-amber-100 shrink-0">
              セキュリティ診断を確認
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      )}

      {/* チャートセクション（2カラム） */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 個人情報の種類別 登録件数棒グラフ */}
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  個人情報の種類別 登録件数
                </CardTitle>
                <CardDescription>
                  どの個人情報が多く登録されているかの可視化
                </CardDescription>
              </div>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.dataTypeCounts}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={90}
                    tick={{ fontSize: 11, fill: "#475569" }}
                  />
                  <Tooltip
                    formatter={(val: number) => [`${val} サービス`, "登録件数"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                  />
                  <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* サービスのステータス比率（ドーナツチャート） */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">
              利用ステータス内訳
            </CardTitle>
            <CardDescription>利用中・停止予定・退会済みの比率</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [`${val} 件`, "件数"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>利用中 ({data.activeServices})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>停止予定 ({data.suspendedServices})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <span>退会済 ({data.cancelledServices})</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 直近の操作履歴 & カテゴリー別一覧 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 操作履歴 */}
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                最近の操作履歴
              </CardTitle>
              <CardDescription>最新の登録・更新アクティビティ</CardDescription>
            </div>
            <Link href="/history">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 gap-1">
                すべて見る
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data.recentLogs.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">まだ操作履歴はありません</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.recentLogs.map((log) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0"></span>
                      <span className="text-slate-800 font-medium">{log.description}</span>
                    </div>
                    <span className="text-slate-400 shrink-0 ml-2">
                      {formatDateTime(log.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* クイックアクション / セキュリティ推奨事項 */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">
              推奨アクション
            </CardTitle>
            <CardDescription>台帳を安全・清潔に保つためのチェックポイント</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-slate-900">サービスの登録漏れはありませんか？</p>
                <p className="text-[11px] text-slate-500">最近新しく利用開始したサービスを追加しましょう</p>
              </div>
              <Link href="/services/new">
                <Button size="sm" variant="outline" className="text-xs h-8">追加する</Button>
              </Link>
            </div>

            <div className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-slate-900">不要なアカウントを放置していませんか？</p>
                <p className="text-[11px] text-slate-500">利用していないサービスは退会手順を確認しましょう</p>
              </div>
              <Link href="/cleanup">
                <Button size="sm" variant="outline" className="text-xs h-8">整理する</Button>
              </Link>
            </div>

            <div className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-slate-900">2段階認証（2FA）の設定状況</p>
                <p className="text-[11px] text-slate-500">決済情報を持つサービスへの2FA導入を確認しましょう</p>
              </div>
              <Link href="/security">
                <Button size="sm" variant="outline" className="text-xs h-8">確認する</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
