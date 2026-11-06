import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { securityUpdateSchema } from "@/lib/validations/security";

// PUT /api/security/[id] - 特定サービスのセキュリティ設定を更新
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // サービス所有権の確認
    const service = await prisma.service.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!service) {
      return NextResponse.json({ error: "サービスが見つかりません" }, { status: 404 });
    }

    const body = await req.json();
    const result = securityUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "入力内容に不備があります", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    const updated = await prisma.$transaction(async (tx) => {
      const sec = await tx.securitySettings.upsert({
        where: { serviceId: params.id },
        create: {
          serviceId: params.id,
          twoFactorEnabled: data.twoFactorEnabled,
          passkeyStatus: data.passkeyStatus,
          lastCheckedAt: data.lastCheckedAt ? new Date(data.lastCheckedAt) : new Date(),
          notes: data.notes || null,
        },
        update: {
          twoFactorEnabled: data.twoFactorEnabled,
          passkeyStatus: data.passkeyStatus,
          lastCheckedAt: data.lastCheckedAt ? new Date(data.lastCheckedAt) : new Date(),
          notes: data.notes || null,
        },
      });

      await tx.activityLog.create({
        data: {
          userId: user.id,
          action: "SECURITY_UPDATE",
          description: `「${service.name}」のセキュリティ設定を更新しました（二段階認証: ${
            data.twoFactorEnabled ? "設定済" : "未設定"
          }）`,
        },
      });

      return sec;
    });

    return NextResponse.json({ securitySettings: updated });
  } catch (error) {
    console.error(`PUT /api/security/${params.id} error:`, error);
    return NextResponse.json({ error: "セキュリティ設定の更新に失敗しました" }, { status: 500 });
  }
}
