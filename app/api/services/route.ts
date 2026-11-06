import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { serviceFormSchema } from "@/lib/validations/service";
import { DATA_TYPES } from "@/lib/constants";

export const dynamic = "force-dynamic";

// GET /api/services - ユーザーのサービス一覧（検索・フィルタ対応）
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";

    const where: any = {
      userId: user.id,
    };

    if (search.trim()) {
      where.name = {
        contains: search.trim(),
      };
    }

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        personalData: true,
        securitySettings: true,
      },
    });

    return NextResponse.json({ services });
  } catch (error) {
    console.error("GET /api/services error:", error);
    return NextResponse.json({ error: "サービス一覧の取得に失敗しました" }, { status: 500 });
  }
}

// POST /api/services - 新規サービス登録
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
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

    // トランザクションでサービス、個人情報種別、セキュリティ設定、ログを一括作成
    const newService = await prisma.$transaction(async (tx) => {
      const service = await tx.service.create({
        data: {
          userId: user.id,
          name: data.name,
          url: data.url || null,
          category: data.category,
          status: data.status,
          registeredAt: data.registeredAt ? new Date(data.registeredAt) : null,
          notes: data.notes || null,
          securitySettings: {
            create: {
              twoFactorEnabled: data.twoFactorEnabled,
              passkeyStatus: data.passkeyStatus,
              lastCheckedAt: new Date(),
              notes: data.securityNotes || null,
            },
          },
          personalData: {
            create: DATA_TYPES.map((dt) => ({
              dataType: dt,
              isRegistered: Boolean(data.personalData && data.personalData[dt]),
            })),
          },
        },
        include: {
          personalData: true,
          securitySettings: true,
        },
      });

      // 操作履歴を保存
      await tx.activityLog.create({
        data: {
          userId: user.id,
          action: "SERVICE_CREATE",
          description: `「${data.name}」を登録しました`,
        },
      });

      return service;
    });

    return NextResponse.json({ service: newService }, { status: 201 });
  } catch (error) {
    console.error("POST /api/services error:", error);
    return NextResponse.json({ error: "サービスの登録に失敗しました" }, { status: 500 });
  }
}
