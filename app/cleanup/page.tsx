"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trash2,
  CheckCircle,
  ExternalLink,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Edit,
  Save,
  Archive,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServiceWithDetails } from "@/types";
import { formatDate } from "@/lib/utils";

export default function CleanupPage() {
  const [services, setServices] = useState<ServiceWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      if (res.ok) {
        const json = await res.json();
        setServices(json.services);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // 退会予定のサービス
  const suspendedServices = services.filter((s) => s.status === "SUSPENDED");
  // すでに退会済みのサービス
  const cancelledServices = services.filter((s) => s.status === "CANCELLED");

  // ステータス更新（例: SUSPENDED -> CANCELLED）
  const handleUpdateStatus = async (id: string, newStatus: "ACTIVE" | "SUSPENDED" | "CANCELLED") => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/cleanup/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchServices();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  // メモ保存
  const handleSaveNotes = async (id: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/cleanup/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "SUSPENDED",
          notes: notesText,
        }),
      });
      if (res.ok) {
        setEditingNotesId(null);
        await fetchServices();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const startEditNotes = (service: ServiceWithDetails) => {
    setEditingNotesId(service.id);
    setNotesText(service.notes || "");
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
          不要アカウント整理・退会管理
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          使わなくなったサービスのアカウント放置を防ぎ、安全に退会手続きを進めるためのワークスペース
        </p>
      </div>

      {/* ガイダンスインフォ */}
      <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-sm text-blue-950">
          <ShieldAlert className="w-4 h-4 text-blue-600" />
          なぜ不要アカウントの整理が重要なのか？
        </div>
        <p className="text-blue-800 leading-relaxed">
          長期間利用していないサービスはパスワードや決済情報が放置されやすく、情報漏洩事故が発生した際に影響を受けるリスクが跳ね上がります。
          当アプリでは、公式サイトでの退会手続きを安全に完了できるよう手順メモや登録個人情報の確認をサポートします。
        </p>
      </div>

      {/* 1. 退会予定のサービス（要対応） */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900">
              退会予定・整理対象のサービス ({suspendedServices.length} 件)
            </h2>
          </div>
          <Link href="/services">
            <Button variant="outline" size="sm" className="text-xs">
              サービス一覧からステータスを変更
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">読み込み中...</div>
        ) : suspendedServices.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-200 py-10 text-center">
            <CardContent className="space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-semibold text-slate-800">
                現在、退会予定の未整理アカウントはありません
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                サービス一覧から「利用停止予定」にステータスを変更したサービスがここに表示されます。
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {suspendedServices.map((service) => {
              const regData = service.personalData.filter((p) => p.isRegistered);
              const isEditingThisNote = editingNotesId === service.id;

              return (
                <Card
                  key={service.id}
                  className="border-amber-200/90 bg-amber-50/20 shadow-sm transition-all"
                >
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/services/${service.id}`}
                            className="text-lg font-bold text-slate-900 hover:text-blue-600"
                          >
                            {service.name}
                          </Link>
                          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                            {service.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          登録日: {formatDate(service.registeredAt)}
                        </p>
                      </div>

                      {/* 公式手続きリンク */}
                      {service.url && (
                        <a
                          href={service.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-white border border-slate-300 text-blue-700 hover:bg-slate-50 shadow-2xs w-fit"
                        >
                          公式サイトへアクセスして退会
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* 預けている個人情報の警告 */}
                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1.5">
                      <span className="font-semibold text-slate-700 block">
                        登録されている個人情報（退会前に確認してください）:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {regData.map((d) => (
                          <span
                            key={d.dataType}
                            className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-medium text-[11px]"
                          >
                            {d.dataType}
                          </span>
                        ))}
                        {regData.length === 0 && (
                          <span className="text-slate-400 italic">登録なし</span>
                        )}
                      </div>
                    </div>

                    {/* 退会手順メモ */}
                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">
                          退会手順・アカウント整理メモ:
                        </span>
                        {!isEditingThisNote && (
                          <button
                            onClick={() => startEditNotes(service)}
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                          >
                            <Edit className="w-3 h-3" />
                            メモを編集
                          </button>
                        )}
                      </div>

                      {isEditingThisNote ? (
                        <div className="space-y-2">
                          <textarea
                            rows={3}
                            value={notesText}
                            onChange={(e) => setNotesText(e.target.value)}
                            placeholder="例: 設定 > アカウント削除から手続き可能。ポイント残高を使い切ってから退会する。"
                            className="w-full rounded border border-slate-300 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => setEditingNotesId(null)}
                            >
                              キャンセル
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-xs gap-1"
                              disabled={isUpdating}
                              onClick={() => handleSaveNotes(service.id)}
                            >
                              <Save className="w-3 h-3" />
                              保存
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-600 whitespace-pre-wrap">
                          {service.notes || "退会手順や注意点のメモが未登録です。「メモを編集」から記録できます。"}
                        </p>
                      )}
                    </div>
                  </CardContent>

                  {/* アクションフッター */}
                  <CardFooter className="bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 py-3">
                    <span className="text-[11px] text-slate-500">
                      公式サイトでの退会処理が完了したら「退会完了」をクリックしてください
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(service.id, "ACTIVE")}
                        className="text-xs h-8"
                      >
                        利用中に戻す
                      </Button>
                      <Button
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(service.id, "CANCELLED")}
                        className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        退会完了として記録
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. 退会済みアーカイブ（過去に整理したアカウント） */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <Archive className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-bold text-slate-800">
            退会済みアーカイブ ({cancelledServices.length} 件)
          </h2>
        </div>

        {cancelledServices.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">退会済みのサービスはありません</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {cancelledServices.map((service) => (
              <div
                key={service.id}
                className="p-3 bg-slate-100/70 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <Link
                    href={`/services/${service.id}`}
                    className="font-bold text-slate-800 hover:text-blue-600 line-clamp-1"
                  >
                    {service.name}
                  </Link>
                  <span className="text-[10px] text-slate-400">
                    {service.category} / 最終更新: {formatDate(service.updatedAt)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUpdateStatus(service.id, "ACTIVE")}
                  className="h-7 text-[10px] text-slate-500 hover:text-blue-600"
                  title="再利用する場合"
                >
                  <RefreshCcw className="w-3 h-3 mr-1" />
                  復帰
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
