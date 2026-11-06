import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { CRITICAL_DATA_TYPES } from "@/lib/constants";

export const dynamic = "force-dynamic";

// GET /api/security - セキュリティ一覧およびリスク分析
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
      orderBy: { name: "asc" },
    });

    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // リスク分析の集計
    const noTwoFactorServices: string[] = [];
    const criticalDataServices: string[] = [];
    const oldUncheckedServices: string[] = [];
    const unusedAccounts: string[] = [];

    let total2faEnabled = 0;
    const activeServices = services.filter((s) => s.status === "ACTIVE");

    for (const service of services) {
      const sec = service.securitySettings;
      const is2fa = sec?.twoFactorEnabled ?? false;
      if (is2fa) total2faEnabled++;

      // 利用中かつ2FA未設定
      if (service.status === "ACTIVE" && !is2fa) {
        noTwoFactorServices.push(service.name);
      }

      // 未確認期間が90日以上、または一度も確認されていない
      const lastChecked = sec?.lastCheckedAt ? new Date(sec.lastCheckedAt) : null;
      if (service.status === "ACTIVE" && (!lastChecked || lastChecked < ninetyDaysAgo)) {
        oldUncheckedServices.push(service.name);
      }

      // クレジットカードや銀行口座などの重要データ保持
      const hasCriticalData = service.personalData.some(
        (p) => (CRITICAL_DATA_TYPES as readonly string[]).includes(p.dataType) && p.isRegistered
      );
      if (hasCriticalData && service.status !== "CANCELLED") {
        criticalDataServices.push(service.name);
      }

      // 不要・利用停止予定のアカウント
      if (service.status === "SUSPENDED") {
        unusedAccounts.push(service.name);
      }
    }

    const twoFactorRate =
      activeServices.length > 0
        ? Math.round((total2faEnabled / activeServices.length) * 100)
        : 100;

    // リスクスコア算出 (0: 安全 〜 100: 高リスク)
    let riskScore = 0;
    if (noTwoFactorServices.length > 0) riskScore += Math.min(noTwoFactorServices.length * 15, 40);
    if (unusedAccounts.length > 0) riskScore += Math.min(unusedAccounts.length * 15, 30);
    if (oldUncheckedServices.length > 0) riskScore += Math.min(oldUncheckedServices.length * 10, 20);
    if (criticalDataServices.some((name) => noTwoFactorServices.includes(name))) {
      riskScore += 20; // 重要情報保持かつ2FA未設定の場合は加点
    }
    riskScore = Math.min(riskScore, 100);

    let riskLevel: "HIGH" | "MEDIUM" | "LOW" = "LOW";
    if (riskScore >= 60) riskLevel = "HIGH";
    else if (riskScore >= 30) riskLevel = "MEDIUM";

    return NextResponse.json({
      services,
      twoFactorRate,
      riskAnalysis: {
        score: riskScore,
        level: riskLevel,
        factors: [
          {
            type: "NO_2FA",
            title: "二段階認証が未設定のサービス",
            description: "アカウントの乗っ取りを防ぐため、二段階認証の設定を強く推奨します。",
            serviceNames: noTwoFactorServices,
          },
          {
            type: "CRITICAL_DATA",
            title: "重要個人情報（決済・口座等）を登録中のサービス",
            description: "漏洩時の影響が大きいため、定期的なパスワード変更や二段階認証の設定を確認してください。",
            serviceNames: criticalDataServices,
          },
          {
            type: "UNUSED_ACCOUNT",
            title: "利用停止予定の放置アカウント",
            description: "利用していないアカウントを放置すると、パスワード漏洩などの温床になります。早めの退会手続きを推奨します。",
            serviceNames: unusedAccounts,
          },
          {
            type: "OLD_UNCHECKED",
            title: "長期間（90日以上）セキュリティ未確認のサービス",
            description: "定期的なログイン設定の確認をおすすめします。",
            serviceNames: oldUncheckedServices,
          },
        ],
      },
    });
  } catch (error) {
    console.error("GET /api/security error:", error);
    return NextResponse.json({ error: "セキュリティ情報の取得に失敗しました" }, { status: 500 });
  }
}
