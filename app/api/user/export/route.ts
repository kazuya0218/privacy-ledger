import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

// GET /api/user/export - ユーザーの全管理データをJSONエクスポート（個人情報の実値は含まず安全）
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        services: {
          include: {
            personalData: {
              select: {
                dataType: true,
                isRegistered: true,
              },
            },
            securitySettings: {
              select: {
                twoFactorEnabled: true,
                passkeyStatus: true,
                lastCheckedAt: true,
                notes: true,
              },
            },
          },
        },
        activityLogs: {
          select: {
            action: true,
            description: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      exportDate: new Date().toISOString(),
      app: "Privacy Ledger",
      data: userData,
    });
  } catch (error) {
    console.error("GET /api/user/export error:", error);
    return NextResponse.json({ error: "データエクスポートに失敗しました" }, { status: 500 });
  }
}
