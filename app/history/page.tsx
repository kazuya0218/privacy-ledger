"use client";

import { useEffect, useState } from "react";
import { History, PlusCircle, Edit, Trash2, KeyRound, UserCheck, ShieldCheck, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivityLogItem } from "@/types";
import { formatDateTime } from "@/lib/utils";

const ACTION_CONFIGS: Record<
  string,
  { label: string; icon: any; colorClass: string; badgeClass: string }
> = {
  SERVICE_CREATE: {
    label: "サービス新規登録",
    icon: PlusCircle,
    colorClass: "bg-blue-100 text-blue-700",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  SERVICE_UPDATE: {
    label: "サービス情報編集",
    icon: Edit,
    colorClass: "bg-indigo-100 text-indigo-700",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  SERVICE_DELETE: {
    label: "サービス削除",
    icon: Trash2,
    colorClass: "bg-red-100 text-red-700",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
  },
  PERSONAL_DATA_UPDATE: {
    label: "個人情報更新",
    icon: UserCheck,
    colorClass: "bg-purple-100 text-purple-700",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
  SECURITY_UPDATE: {
    label: "セキュリティ設定",
    icon: KeyRound,
    colorClass: "bg-emerald-100 text-emerald-700",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  CLEANUP_UPDATE: {
    label: "アカウント整理",
    icon: Trash2,
    colorClass: "bg-amber-100 text-amber-700",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  USER_REGISTER: {
    label: "アカウント作成",
    icon: ShieldCheck,
    colorClass: "bg-teal-100 text-teal-700",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
  },
  USER_LOGIN: {
    label: "ログイン",
    icon: Clock,
    colorClass: "bg-slate-100 text-slate-700",
    badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
  },
};

export default function HistoryPage() {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await fetch("/api/history?limit=100");
        if (res.ok) {
          const json = await res.json();
          setLogs(json.logs);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
          操作履歴
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          登録、編集、削除、セキュリティ確認などの全アクティビティログ
        </p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                アクティビティタイムライン
              </CardTitle>
              <CardDescription>直近 100 件の操作履歴</CardDescription>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              全 {logs.length} 件
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">履歴を読み込み中...</div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              まだ操作履歴はありません
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {logs.map((log) => {
                const conf =
                  ACTION_CONFIGS[log.action] || {
                    label: log.action,
                    icon: History,
                    colorClass: "bg-slate-100 text-slate-600",
                    badgeClass: "bg-slate-50 text-slate-600 border-slate-200",
                  };
                const Icon = conf.icon;

                return (
                  <div key={log.id} className="relative flex items-start gap-3 text-xs">
                    {/* タイムラインの丸アイコン */}
                    <div
                      className={`absolute -left-[27px] mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white ${conf.colorClass}`}
                    >
                      <Icon className="h-2.5 w-2.5" />
                    </div>

                    <div className="flex-1 bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${conf.badgeClass}`}
                        >
                          {conf.label}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatDateTime(log.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 pt-0.5">
                        {log.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
