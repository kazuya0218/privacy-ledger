import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

// DELETE /api/user/account - アカウントおよび全データの完全削除（カスケード削除）
export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    await prisma.user.delete({
      where: { id: user.id },
    });

    return NextResponse.json({ message: "アカウントおよび全データを安全に削除しました" });
  } catch (error) {
    console.error("DELETE /api/user/account error:", error);
    return NextResponse.json({ error: "アカウントの削除に失敗しました" }, { status: 500 });
  }
}
