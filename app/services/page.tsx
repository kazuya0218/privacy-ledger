"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Search,
  Filter,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Edit,
  Trash2,
  AlertCircle,
  MoreVertical,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ServiceWithDetails } from "@/types";
import { SERVICE_CATEGORIES, STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // 削除モーダル用ステート
  const [deleteTarget, setDeleteTarget] = useState<ServiceWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // 検索・絞り込みフィルタリング
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch =
        search.trim() === "" ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.notes && s.notes.toLowerCase().includes(search.toLowerCase()));

      const matchesCategory =
        categoryFilter === "ALL" || s.category === categoryFilter;

      const matchesStatus =
        statusFilter === "ALL" || s.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [services, search, categoryFilter, statusFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/services/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setServices((prev) => prev.filter((s) => s.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            登録サービス一覧
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            個人情報を預けているWebサービスの一元管理・編集
          </p>
        </div>
        <Link href="/services/new">
          <Button className="gap-2 shadow-sm">
            <PlusCircle className="w-4 h-4" />
            サービスを新規登録
          </Button>
        </Link>
      </div>

      {/* 検索・フィルターバー */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* サービス名検索 */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="サービス名・メモで検索..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10"
              />
            </div>

            {/* カテゴリー絞り込み */}
            <div>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="ALL">全カテゴリー</option>
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>

            {/* 利用状況絞り込み */}
            <div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">全ステータス</option>
                <option value="ACTIVE">利用中</option>
                <option value="SUSPENDED">利用停止予定</option>
                <option value="CANCELLED">退会済み</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* サービス件数サマリー */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>全 {services.length} 件中 {filteredServices.length} 件を表示</span>
      </div>

      {/* サービスリスト */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-sm text-slate-500">サービス一覧を読み込み中...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <Card className="border-slate-200 py-12 text-center">
          <CardContent className="space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">
              該当するサービスが見つかりませんでした
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              検索条件を変更するか、新しいWebサービスを登録してください。
            </p>
            <div className="pt-2">
              <Link href="/services/new">
                <Button size="sm">新しいサービスを追加</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => {
            const statusInfo = STATUS_LABELS[service.status] || STATUS_LABELS.ACTIVE;
            const regPersonalDataCount = service.personalData.filter((p) => p.isRegistered).length;
            const is2fa = service.securitySettings?.twoFactorEnabled ?? false;

            return (
              <Card
                key={service.id}
                className="border-slate-200/90 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <CardContent className="p-5 space-y-4">
                  {/* ヘッダー情報 */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/services/${service.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 text-base line-clamp-1 transition-colors"
                        >
                          {service.name}
                        </Link>
                        {service.url && (
                          <a
                            href={service.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-slate-600"
                            title="公式サイトを開く"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <span className="inline-block text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
                        {service.category}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.badgeClass}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* 登録個人情報のタグ要約 */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-semibold text-slate-600">
                      登録中の個人情報 ({regPersonalDataCount}種):
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {service.personalData
                        .filter((p) => p.isRegistered)
                        .slice(0, 4)
                        .map((p) => (
                          <span
                            key={p.dataType}
                            className="text-[10px] bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600"
                          >
                            {p.dataType}
                          </span>
                        ))}
                      {regPersonalDataCount > 4 && (
                        <span className="text-[10px] text-slate-400 px-1 py-0.5">
                          +{regPersonalDataCount - 4}
                        </span>
                      )}
                      {regPersonalDataCount === 0 && (
                        <span className="text-[10px] text-slate-400 italic">登録情報なし</span>
                      )}
                    </div>
                  </div>

                  {/* セキュリティバッジ & 登録日 */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      {is2fa ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          2FA有効
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-medium">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                          2FA未設定
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      登録: {formatDate(service.registeredAt)}
                    </span>
                  </div>

                  {/* カードフッター操作ボタン */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5">
                    <Link href={`/services/${service.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 text-xs text-blue-600">
                        詳細
                      </Button>
                    </Link>
                    <Link href={`/services/${service.id}/edit`}>
                      <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-600">
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        編集
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(service)}
                      className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* サービス削除確認モーダル */}
      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="サービスの削除確認"
        description={`「${deleteTarget?.name}」の管理情報を削除してもよろしいですか？関連する個人情報登録状況やセキュリティ設定もすべて削除されます。`}
        confirmText="削除する"
        confirmVariant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
