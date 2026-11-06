"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ServiceForm } from "@/components/services/service-form";
import { ServiceWithDetails } from "@/types";

export default function EditServicePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [service, setService] = useState<ServiceWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
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
    }
    if (id) {
      load();
    }
  }, [id, router]);

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

  return (
    <div className="space-y-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-extrabold text-navy-950 tracking-tight">
          サービス情報の編集: {service.name}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          登録個人情報の変更やステータス・セキュリティ設定の更新を行います
        </p>
      </div>
      <ServiceForm initialData={service} isEdit={true} />
    </div>
  );
}
