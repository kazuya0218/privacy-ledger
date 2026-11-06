import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { z } from "zod";

const cleanupUpdateSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "CANCELLED"]),
  notes: z.string().max(1000).optional().nullable(),
});

// PATCH /api/cleanup/[id] - 不要アカウントの整理・ステータス更新
export async function PATCH(
  req: Request,
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
        userId: user.id,
      },
    });

    if (!service) {
      return NextResponse.json({ error: "サービスが見つかりません" }, { status: 404 });
    }

    const body = await req.json();
    const result = cleanupUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "入力内容に不備があります", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { status, notes } = result.data;

    const updated = await prisma.$transaction(async (tx) => {
      const s = await tx.service.update({
        where: { id: params.id },
        data: {
          status,
          notes: notes !== undefined ? notes : service.notes,
        },
      });

      const statusText =
        status === "CANCELLED"
          ? "退会済み"
          : status === "SUSPENDED"
          ? "利用停止予定"
          : "利用中";

      await tx.activityLog.create({
        data: {
          userId: user.id,
          action: "CLEANUP_UPDATE",
          description: `「${service.name}」のアカウント整理を行い、ステータスを「${statusText}」に変更しました`,
        },
      });

      return s;
    });

    return NextResponse.json({ service: updated });
  } catch (error) {
    console.error(`PATCH /api/cleanup/${params.id} error:`, error);
    return NextResponse.json({ error: "ステータスの更新に失敗しました" }, { status: 500 });
  }
}
