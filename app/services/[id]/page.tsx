"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Edit,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Layers,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ServiceWithDetails } from "@/types";
import { STATUS_LABELS, PASSKEY_LABELS, CRITICAL_DATA_TYPES } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils";

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [service, setService] = useState<ServiceWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 2FAトグルクイック更新
  const [isUpdating2FA, setIsUpdating2FA] = useState(false);

  const fetchService = async () => {
    try {
      const res = await fetch(`/api/services/${id}`);
      if (res.ok) {
        const json = await res.json();
        setService(json.service);
      } else {
        router.push("/services");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchService();
    }
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/services");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggle2FA = async () => {
    if (!service) return;
    setIsUpdating2FA(true);
    const new2fa = !service.securitySettings?.twoFactorEnabled;

    try {
      const res = await fetch(`/api/security/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          twoFactorEnabled: new2fa,
          passkeyStatus: service.securitySettings?.passkeyStatus || "UNKNOWN",
          notes: service.securitySettings?.notes,
        }),
      });

      if (res.ok) {
        await fetchService();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating2FA(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-sm text-slate-500">サービス情報を読み込み中...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="py-12 text-center text-slate-500">
        サービスが見つかりませんでした
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[service.status] || STATUS_LABELS.ACTIVE;
  const passkeyInfo = PASSKEY_LABELS[service.securitySettings?.passkeyStatus || "UNKNOWN"] || PASSKEY_LABELS.UNKNOWN;
  const is2fa = service.securitySettings?.twoFactorEnabled ?? false;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 戻るリンク */}
      <div className="flex items-center justify-between">
        <Link
          href="/services"
          className="inline-flex items-center text-xs text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          サービス一覧に戻る
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/services/${id}/edit`}>
            <Button variant="outline" size="sm" className="gap-1.5 h-8">
              <Edit className="w-3.5 h-3.5" />
              編集
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteModalOpen(true)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            削除
          </Button>
        </div>
      </div>

      {/* サービス概要ヘッダーカード */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950">
                  {service.name}
                </h1>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.badgeClass}`}
                >
                  {statusInfo.label}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                  {service.category}
                </span>
                <span>登録日: {formatDate(service.registeredAt)}</span>
                <span>更新日: {formatDate(service.updatedAt)}</span>
              </div>

              {service.url && (
                <div className="pt-1">
                  <a
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                  >
                    公式サイトを開く: {service.url}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* ステータスが利用停止予定の場合の退会支援バナー */}
            {service.status === "SUSPENDED" && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1 sm:max-w-xs">
                <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  利用停止予定のアカウント
                </div>
                <p className="text-amber-800">
                  不要な放置アカウントは不正アクセスの原因になります。公式サイトから退会手続きを行いましょう。
                </p>
                <div className="pt-1">
                  <Link href="/cleanup">
                    <Button size="sm" variant="outline" className="h-7 text-[11px] border-amber-300">
                      アカウント整理画面で確認
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* メモ */}
          {service.notes && (
            <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-700 bg-slate-50/70 p-3 rounded-lg">
              <span className="text-xs font-semibold text-slate-500 block mb-1">メモ:</span>
              <p className="whitespace-pre-wrap">{service.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2カラムレイアウト: 個人情報登録状況 & セキュリティ設定 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 個人情報登録状況 */}
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  登録している個人情報
                </CardTitle>
                <CardDescription>
                  登録有無の記録（実値は保存されません）
                </CardDescription>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {service.personalData.filter((p) => p.isRegistered).length} 項目登録中
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="divide-y divide-slate-100">
              {service.personalData.map((item) => {
                const isCritical = (CRITICAL_DATA_TYPES as readonly string[]).includes(item.dataType);
                return (
                  <div
                    key={item.dataType}
                    className="py-2.5 flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-slate-800">{item.dataType}</span>
                      {isCritical && (
                        <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-1 py-0.2 rounded font-medium">
                          重要
                        </span>
                      )}
                    </div>
                    {item.isRegistered ? (
                      <span className="inline-flex items-center gap-1 text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                        登録あり
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                        <XCircle className="w-3.5 h-3.5 text-slate-300" />
                        登録なし
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* セキュリティ設定カード */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">
              セキュリティ設定状況
            </CardTitle>
            <CardDescription>
              二段階認証や認証設定の確認
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">二段階認証 (2FA)</h4>
                  <p className="text-xs text-slate-500">アカウントの乗っ取り防止</p>
                </div>
                <Button
                  size="sm"
                  variant={is2fa ? "default" : "outline"}
                  onClick={handleToggle2FA}
                  disabled={isUpdating2FA}
                  className={`text-xs h-8 ${
                    is2fa
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "border-amber-400 text-amber-700 hover:bg-amber-50"
                  }`}
                >
                  {isUpdating2FA ? "更新中..." : is2fa ? "設定済み (ON)" : "未設定 (OFF)"}
                </Button>
              </div>

              {!is2fa && (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                  ⚠️ 二段階認証が未設定です。パスワード漏洩時のリスクが高いため設定を推奨します。
                </p>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">パスキー対応:</span>
                <span className={`px-2 py-0.5 rounded border text-[11px] font-medium ${passkeyInfo.badgeClass}`}>
                  {passkeyInfo.label}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">最終セキュリティ確認日:</span>
                <span className="text-slate-800">
                  {formatDate(service.securitySettings?.lastCheckedAt)}
                </span>
              </div>

              {service.securitySettings?.notes && (
                <div className="py-2">
                  <span className="text-slate-600 font-medium block mb-1">セキュリティメモ:</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-100">
                    {service.securitySettings.notes}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 削除確認モーダル */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="サービスの削除確認"
        description={`「${service.name}」を台帳から削除しますか？登録した個人情報フラグやセキュリティ設定もすべて削除されます。`}
        confirmText="削除する"
        confirmVariant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
