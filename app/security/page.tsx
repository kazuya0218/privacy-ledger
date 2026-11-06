"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Clock,
  RefreshCw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ServiceWithDetails, RiskAnalysis } from "@/types";
import { PASSKEY_LABELS, CRITICAL_DATA_TYPES, STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default function SecurityPage() {
  const [services, setServices] = useState<ServiceWithDetails[]>([]);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);
  const [twoFactorRate, setTwoFactorRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchSecurityData = async () => {
    try {
      const res = await fetch("/api/security");
      if (res.ok) {
        const json = await res.json();
        setServices(json.services);
        setRiskAnalysis(json.riskAnalysis);
        setTwoFactorRate(json.twoFactorRate);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  // 2FAトグルクイック切り替え
  const handleToggle2FA = async (service: ServiceWithDetails) => {
    setUpdatingId(service.id);
    const new2FA = !service.securitySettings?.twoFactorEnabled;

    try {
      const res = await fetch(`/api/security/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          twoFactorEnabled: new2FA,
          passkeyStatus: service.securitySettings?.passkeyStatus || "UNKNOWN",
          lastCheckedAt: new Date().toISOString(),
          notes: service.securitySettings?.notes,
        }),
      });

      if (res.ok) {
        await fetchSecurityData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  // 「今すぐ確認済みにする」アクション
  const handleMarkChecked = async (service: ServiceWithDetails) => {
    setUpdatingId(service.id);
    try {
      const res = await fetch(`/api/security/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          twoFactorEnabled: service.securitySettings?.twoFactorEnabled ?? false,
          passkeyStatus: service.securitySettings?.passkeyStatus || "UNKNOWN",
          lastCheckedAt: new Date().toISOString(),
          notes: service.securitySettings?.notes,
        }),
      });

      if (res.ok) {
        await fetchSecurityData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
          セキュリティ設定・リスク可視化
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          各Webサービスの2段階認証設定状況と、登録状況に基づくリスク分析
        </p>
      </div>

      {/* リスク診断サマリーカード */}
      {riskAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                セキュリティ健全度スコア
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-4xl font-extrabold ${
                    riskAnalysis.level === "HIGH"
                      ? "text-red-600"
                      : riskAnalysis.level === "MEDIUM"
                      ? "text-amber-600"
                      : "text-emerald-600"
                  }`}
                >
                  {100 - riskAnalysis.score}
                </span>
                <span className="text-slate-400 text-sm">/ 100点</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {riskAnalysis.level === "HIGH"
                  ? "⚠️ 改善が必要なセキュリティ事項があります"
                  : riskAnalysis.level === "MEDIUM"
                  ? "⚡ 一部のサービスで確認をおすすめします"
                  : "✅ 良好にセキュリティ管理されています"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                二段階認証 (2FA) 導入率
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-indigo-600">
                {twoFactorRate}%
              </div>
              <p className="text-xs text-slate-500 mt-2">
                利用中のサービスにおける設定率
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                管理上の注意事項
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-navy-950">
                {riskAnalysis.factors.reduce((acc, f) => acc + f.serviceNames.length, 0)}
                <span className="text-sm font-normal text-slate-400 ml-1">件</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                未設定・長期間未確認・放置等の注意点
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 注意事項詳細アコーディオン / アラート一覧 */}
      {riskAnalysis && riskAnalysis.factors.some((f) => f.serviceNames.length > 0) && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              登録状況に基づく管理上の注意事項
            </CardTitle>
            <CardDescription>
              実際の情報漏洩を断定するものではなく、アカウントの安全管理に向けたチェックリストです
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {riskAnalysis.factors
              .filter((f) => f.serviceNames.length > 0)
              .map((factor) => (
                <div
                  key={factor.type}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-sm font-bold text-slate-900">
                      {factor.title} ({factor.serviceNames.length} 件)
                    </h4>
                    <span className="text-xs text-slate-500">
                      {factor.description}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {factor.serviceNames.map((name) => (
                      <span
                        key={name}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-white border border-slate-300 font-medium text-slate-800 shadow-2xs"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* サービス一覧セキュリティテーブル */}
      <Card className="border-slate-200">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              各サービスのセキュリティ設定一覧
            </CardTitle>
            <CardDescription>
              ワンクリックで2段階認証の記録や確認日時の更新が可能です
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="サービスを検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-2 text-xs text-slate-500">読み込み中...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              該当するサービスがありません
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                    <th className="py-3 px-4">サービス名</th>
                    <th className="py-3 px-4">ステータス</th>
                    <th className="py-3 px-4">二段階認証 (2FA)</th>
                    <th className="py-3 px-4">パスキー</th>
                    <th className="py-3 px-4">最終確認日</th>
                    <th className="py-3 px-4 text-right">アクション</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((service) => {
                    const is2fa = service.securitySettings?.twoFactorEnabled ?? false;
                    const passkey = PASSKEY_LABELS[service.securitySettings?.passkeyStatus || "UNKNOWN"];
                    const status = STATUS_LABELS[service.status] || STATUS_LABELS.ACTIVE;
                    const isUpdating = updatingId === service.id;

                    return (
                      <tr key={service.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <Link
                            href={`/services/${service.id}`}
                            className="font-bold text-slate-900 hover:text-blue-600"
                          >
                            {service.name}
                          </Link>
                          <div className="text-[11px] text-slate-400">{service.category}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${status.badgeClass}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggle2FA(service)}
                            disabled={isUpdating}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                              is2fa
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                            }`}
                          >
                            {is2fa ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                設定済
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                未設定
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded border text-[11px] font-medium ${passkey.badgeClass}`}>
                            {passkey.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {formatDate(service.securitySettings?.lastCheckedAt)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isUpdating}
                              onClick={() => handleMarkChecked(service)}
                              className="h-7 text-[11px] text-slate-600 hover:text-blue-600"
                              title="今日の日付で確認済みにする"
                            >
                              <RefreshCw className={`w-3 h-3 mr-1 ${isUpdating ? "animate-spin" : ""}`} />
                              確認済みに更新
                            </Button>
                            <Link href={`/services/${service.id}/edit`}>
                              <Button variant="outline" size="sm" className="h-7 text-[11px]">
                                編集
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
