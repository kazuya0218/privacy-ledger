"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Shield,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  FileDown,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [isExporting, setIsExporting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // データエクスポート
  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/user/export");
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `privacy-ledger-export-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  // アカウント完全削除（退会）
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/user/account", {
        method: "DELETE",
      });
      if (res.ok) {
        await signOut({ callbackUrl: "/" });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
          ユーザー設定
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          登録アカウントの確認、管理データのエクスポートおよび退会
        </p>
      </div>

      {/* 1. アカウント情報 */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900">
            登録プロファイル情報
          </CardTitle>
          <CardDescription>
            現在サインイン中のアカウント情報
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {session?.user?.name || "ユーザー"}
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {session?.user?.email}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. データエクスポート */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900">
            データのエクスポート (JSON)
          </CardTitle>
          <CardDescription>
            登録した全サービス・個人情報フラグ・セキュリティ設定をJSON形式でダウンロードします
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Privacy Ledger はデータポータビリティを尊重しています。記録したすべての台帳情報をいつでも安全に取り出すことができます。
          </p>
          <Button
            variant="outline"
            onClick={handleExportData}
            disabled={isExporting}
            className="gap-2 text-xs h-9"
          >
            <FileDown className="w-4 h-4 text-blue-600" />
            {isExporting ? "エクスポート中..." : "台帳データをJSONでダウンロード"}
          </Button>
        </CardContent>
      </Card>

      {/* 3. 危険ゾーン（退会・データ完全削除） */}
      <Card className="border-red-200 bg-red-50/20">
        <CardHeader>
          <CardTitle className="text-base font-bold text-red-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            退会・アカウント削除
          </CardTitle>
          <CardDescription className="text-red-700/80">
            アカウントおよび登録されているすべてのサービス・個人情報記録を完全に消去します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            一度アカウントを削除すると、登録されたサービス一覧やセキュリティ記録は復元できません。
          </p>
          <Button
            variant="destructive"
            onClick={() => setDeleteModalOpen(true)}
            className="text-xs h-9 gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            アカウントを完全に削除する
          </Button>
        </CardContent>
      </Card>

      {/* 退会確認モーダル */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="アカウント削除（退会）の最終確認"
        description="本当にアカウントを削除しますか？登録したすべてのWebサービス管理情報、セキュリティ設定、操作履歴が完全に削除され、復元することはできません。"
        confirmText="完全に削除して退会する"
        confirmVariant="destructive"
        onConfirm={handleDeleteAccount}
        isLoading={isDeleting}
      />
    </div>
  );
}
