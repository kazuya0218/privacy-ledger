import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { serviceFormSchema } from "@/lib/validations/service";
import { DATA_TYPES } from "@/lib/constants";

// GET /api/services/[id] - サービス詳細
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const service = await prisma.service.findFirst({
      where: {
        id: params.id,
        userId: user.id, // 厳格なユーザーデータ分離
      },
      include: {
        personalData: true,
        securitySettings: true,
      },
    });

    if (!service) {
      return NextResponse.json({ error: "サービスが見つかりません" }, { status: 404 });
    }

    return NextResponse.json({ service });
  } catch (error) {
    console.error(`GET /api/services/${params.id} error:`, error);
    return NextResponse.json({ error: "サービス詳細の取得に失敗しました" }, { status: 500 });
  }
}

// PUT /api/services/[id] - サービス情報の更新
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // 所有権の事前確認
    const existingService = await prisma.service.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        securitySettings: true,
      },
    });

    if (!existingService) {
      return NextResponse.json({ error: "サービスが見つかりません" }, { status: 404 });
    }

    const body = await req.json();
    const result = serviceFormSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "入力内容に不備があります", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    const updated = await prisma.$transaction(async (tx) => {
      // 1. サービス基本情報の更新
      const s = await tx.service.update({
        where: { id: params.id },
        data: {
          name: data.name,
          url: data.url || null,
          category: data.category,
          status: data.status,
          registeredAt: data.registeredAt ? new Date(data.registeredAt) : null,
          notes: data.notes || null,
        },
      });

      // 2. セキュリティ設定の更新
      await tx.securitySettings.upsert({
        where: { serviceId: params.id },
        create: {
          serviceId: params.id,
          twoFactorEnabled: data.twoFactorEnabled,
          passkeyStatus: data.passkeyStatus,
          lastCheckedAt: new Date(),
          notes: data.securityNotes || null,
        },
        update: {
          twoFactorEnabled: data.twoFactorEnabled,
          passkeyStatus: data.passkeyStatus,
          lastCheckedAt: new Date(),
          notes: data.securityNotes || null,
        },
      });

      // 3. 個人情報登録状況の更新
      if (data.personalData) {
        for (const dt of DATA_TYPES) {
          const isReg = Boolean(data.personalData[dt]);
          await tx.personalData.upsert({
            where: {
              serviceId_dataType: {
                serviceId: params.id,
                dataType: dt,
              },
            },
            create: {
              serviceId: params.id,
              dataType: dt,
              isRegistered: isReg,
            },
            update: {
              isRegistered: isReg,
            },
          });
        }
      }

      // 4. 操作履歴
      let logAction = "SERVICE_UPDATE";
      let logDesc = `「${data.name}」の情報を更新しました`;

      if (existingService.status !== data.status) {
        logAction = "CLEANUP_UPDATE";
        logDesc = `「${data.name}」のステータスを「${data.status}」に変更しました`;
      }

      await tx.activityLog.create({
        data: {
          userId: user.id,
          action: logAction,
          description: logDesc,
        },
      });

      return tx.service.findUnique({
        where: { id: params.id },
        include: {
          personalData: true,
          securitySettings: true,
        },
      });
    });

    return NextResponse.json({ service: updated });
  } catch (error) {
    console.error(`PUT /api/services/${params.id} error:`, error);
    return NextResponse.json({ error: "サービス情報の更新に失敗しました" }, { status: 500 });
  }
}

// DELETE /api/services/[id] - サービス削除
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const existingService = await prisma.service.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingService) {
      return NextResponse.json({ error: "サービスが見つかりません" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // ログ記録
      await tx.activityLog.create({
        data: {
          userId: user.id,
          action: "SERVICE_DELETE",
          description: `「${existingService.name}」を削除しました`,
        },
      });

      // 削除（カスケード設定により関連データも削除）
      await tx.service.delete({
        where: { id: params.id },
      });
    });

    return NextResponse.json({ message: "サービスを削除しました" });
  } catch (error) {
    console.error(`DELETE /api/services/${params.id} error:`, error);
    return NextResponse.json({ error: "サービスの削除に失敗しました" }, { status: 500 });
  }
}
