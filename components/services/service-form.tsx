"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceFormSchema, ServiceFormData } from "@/lib/validations/service";
import { SERVICE_CATEGORIES, DATA_TYPES, CRITICAL_DATA_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { AlertCircle, ShieldCheck, KeyRound, UserCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ServiceWithDetails } from "@/types";

interface ServiceFormProps {
  initialData?: ServiceWithDetails;
  isEdit?: boolean;
}

export function ServiceForm({ initialData, isEdit = false }: ServiceFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 初期値の構築
  const defaultPersonalData: Record<string, boolean> = {};
  DATA_TYPES.forEach((dt) => {
    if (initialData?.personalData) {
      const match = initialData.personalData.find((p) => p.dataType === dt);
      defaultPersonalData[dt] = match ? match.isRegistered : false;
    } else {
      // デフォルト: 氏名・メールアドレスはON
      defaultPersonalData[dt] = dt === "氏名" || dt === "メールアドレス";
    }
  });

  const formattedDate = initialData?.registeredAt
    ? new Date(initialData.registeredAt).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      url: initialData?.url || "",
      category: initialData?.category || "その他",
      status: (initialData?.status as any) || "ACTIVE",
      registeredAt: formattedDate,
      notes: initialData?.notes || "",
      personalData: defaultPersonalData,
      twoFactorEnabled: initialData?.securitySettings?.twoFactorEnabled ?? false,
      passkeyStatus: (initialData?.securitySettings?.passkeyStatus as any) || "UNKNOWN",
      securityNotes: initialData?.securitySettings?.notes || "",
    },
  });

  const personalDataValues = watch("personalData") || {};
  const twoFactorEnabledValue = watch("twoFactorEnabled");

  const togglePersonalData = (dt: string) => {
    setValue(`personalData.${dt}`, !personalDataValues[dt]);
  };

  const onSubmit = async (data: ServiceFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const endpoint = isEdit && initialData
        ? `/api/services/${initialData.id}`
        : "/api/services";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error || "保存に失敗しました");
        setIsSubmitting(false);
        return;
      }

      router.push(`/services/${json.service.id}`);
      router.refresh();
    } catch {
      setServerError("通信エラーが発生しました");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href={isEdit && initialData ? `/services/${initialData.id}` : "/services"}
          className="inline-flex items-center text-xs text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          {isEdit ? "詳細に戻る" : "サービス一覧に戻る"}
        </Link>
      </div>

      {serverError && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* 1. 基本情報 */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900">
            1. Webサービス基本情報
          </CardTitle>
          <CardDescription>
            サービスの名称や利用ステータスを入力してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">サービス名 <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                placeholder="例: Amazon, GitHub, メルカリ"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="url">サービスURL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                {...register("url")}
              />
              {errors.url && (
                <p className="text-xs text-red-600">{errors.url.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category">カテゴリー</Label>
              <Select id="category" {...register("category")}>
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">利用状況</Label>
              <Select id="status" {...register("status")}>
                <option value="ACTIVE">利用中</option>
                <option value="SUSPENDED">利用停止予定</option>
                <option value="CANCELLED">退会済み</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="registeredAt">登録日</Label>
              <Input
                id="registeredAt"
                type="date"
                {...register("registeredAt")}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">メモ・利用用途</Label>
            <textarea
              id="notes"
              rows={3}
              placeholder="アカウントの用途やログイン方法、退会手順のリンクなど"
              className="w-full rounded-md border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              {...register("notes")}
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. 個人情報登録状況 */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
            <span>2. 登録している個人情報の種類</span>
            <span className="text-xs font-normal text-slate-500">※実際の値は保存しません</span>
          </CardTitle>
          <CardDescription>
            該当するサービスに登録した記憶のある項目にチェックを入れてください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {DATA_TYPES.map((dt) => {
              const isChecked = Boolean(personalDataValues[dt]);
              const isCritical = (CRITICAL_DATA_TYPES as readonly string[]).includes(dt);

              return (
                <div
                  key={dt}
                  onClick={() => togglePersonalData(dt)}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    isChecked
                      ? "border-blue-600 bg-blue-50/60 text-blue-900 font-medium"
                      : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // 親divのonClickでトグル
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs">{dt}</span>
                  </div>
                  {isCritical && (
                    <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-semibold">
                      重要
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 3. セキュリティ設定 */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900">
            3. セキュリティ設定状況
          </CardTitle>
          <CardDescription>
            二段階認証やパスキーの設定状態を記録し、安全性を把握します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="twoFactorEnabled" className="font-semibold text-slate-900 cursor-pointer">
                二段階認証 (2FA / MFA) を設定している
              </Label>
              <p className="text-xs text-slate-500">
                認証アプリ (Google Authenticator等) やSMS認証など
              </p>
            </div>
            <input
              id="twoFactorEnabled"
              type="checkbox"
              className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              {...register("twoFactorEnabled")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="passkeyStatus">パスキー (Passkey) 対応状況</Label>
              <Select id="passkeyStatus" {...register("passkeyStatus")}>
                <option value="UNKNOWN">未確認</option>
                <option value="SUPPORTED">設定・利用中</option>
                <option value="UNSUPPORTED">未対応</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="securityNotes">セキュリティに関するメモ</Label>
              <Input
                id="securityNotes"
                placeholder="例: TOTPアプリ設定済、バックアップコード保存済"
                {...register("securityNotes")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 送信ボタン */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link href={isEdit && initialData ? `/services/${initialData.id}` : "/services"}>
          <Button type="button" variant="outline" disabled={isSubmitting}>
            キャンセル
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting} className="px-6">
          {isSubmitting ? "保存中..." : isEdit ? "サービス情報を更新" : "サービスを登録"}
        </Button>
      </div>
    </form>
  );
}
