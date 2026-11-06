import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { DATA_TYPES, CRITICAL_DATA_TYPES } from "@/lib/constants";

export const dynamic = "force-dynamic";

// GET /api/dashboard/stats - ダッシュボード集計情報
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const services = await prisma.service.findMany({
      where: { userId: user.id },
      include: {
        personalData: true,
        securitySettings: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const recentLogs = await prisma.activityLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const totalServices = services.length;
    const activeServices = services.filter((s) => s.status === "ACTIVE").length;
    const suspendedServices = services.filter((s) => s.status === "SUSPENDED").length;
    const cancelledServices = services.filter((s) => s.status === "CANCELLED").length;

    // 二段階認証率 (利用中サービス中)
    const activeList = services.filter((s) => s.status === "ACTIVE");
    const twoFactorCount = activeList.filter(
      (s) => s.securitySettings?.twoFactorEnabled
    ).length;
    const twoFactorRate =
      activeList.length > 0 ? Math.round((twoFactorCount / activeList.length) * 100) : 100;

    // 個人情報の種類ごとの登録件数集計
    const dataTypeMap: Record<string, number> = {};
    DATA_TYPES.forEach((dt) => {
      dataTypeMap[dt] = 0;
    });

    // カテゴリーごとの件数集計
    const categoryMap: Record<string, number> = {};

    // 高リスクサービス（利用中で2FA未設定かつ重要情報あり、または不要アカウント）
    let highRiskCount = 0;

    for (const s of services) {
      // カテゴリー
      categoryMap[s.category] = (categoryMap[s.category] || 0) + 1;

      // 個人情報 (退会済み以外を集計)
      if (s.status !== "CANCELLED") {
        for (const p of s.personalData) {
          if (p.isRegistered) {
            dataTypeMap[p.dataType] = (dataTypeMap[p.dataType] || 0) + 1;
          }
        }
      }

      // 高リスク判定
      const hasCritical = s.personalData.some(
        (p) => (CRITICAL_DATA_TYPES as readonly string[]).includes(p.dataType) && p.isRegistered
      );
      if (
        (s.status === "ACTIVE" && !s.securitySettings?.twoFactorEnabled && hasCritical) ||
        s.status === "SUSPENDED"
      ) {
        highRiskCount++;
      }
    }

    const dataTypeCounts = Object.entries(dataTypeMap).map(([name, count]) => ({
      name,
      count,
    }));

    const categoryCounts = Object.entries(categoryMap).map(([name, count]) => ({
      name,
      count,
    }));

    return NextResponse.json({
      stats: {
        totalServices,
        activeServices,
        suspendedServices,
        cancelledServices,
        twoFactorRate,
        highRiskCount,
        dataTypeCounts,
        categoryCounts,
        recentLogs,
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard/stats error:", error);
    return NextResponse.json({ error: "ダッシュボード集計の取得に失敗しました" }, { status: 500 });
  }
}
