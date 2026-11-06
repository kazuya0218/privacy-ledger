import { describe, it, expect, beforeAll, afterAll } from "vitest";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

describe("Security & Multi-tenant Isolation Tests", () => {
  let userAId: string;
  let userBId: string;
  let serviceAId: string;

  beforeAll(async () => {
    // 2人のテストユーザーを作成して完全なデータ分離を検証
    const hash = await bcrypt.hash("Password123!", 10);

    const userA = await prisma.user.create({
      data: {
        email: `usera-${Date.now()}@example.com`,
        name: "User A",
        passwordHash: hash,
      },
    });
    userAId = userA.id;

    const userB = await prisma.user.create({
      data: {
        email: `userb-${Date.now()}@example.com`,
        name: "User B",
        passwordHash: hash,
      },
    });
    userBId = userB.id;

    // User A のサービスを作成
    const serviceA = await prisma.service.create({
      data: {
        userId: userAId,
        name: "User A Private Service",
        category: "金融・決済",
        status: "ACTIVE",
        personalData: {
          create: [
            { dataType: "クレジットカード情報", isRegistered: true },
            { dataType: "氏名", isRegistered: true },
          ],
        },
        securitySettings: {
          create: {
            twoFactorEnabled: true,
            passkeyStatus: "SUPPORTED",
          },
        },
      },
    });
    serviceAId = serviceA.id;
  });

  afterAll(async () => {
    // クリーンアップ
    if (userAId) await prisma.user.delete({ where: { id: userAId } }).catch(() => {});
    if (userBId) await prisma.user.delete({ where: { id: userBId } }).catch(() => {});
  });

  it("User B が User A のサービスを検索しても取得できないこと（マルチテナント隔離）", async () => {
    const accessibleByUserB = await prisma.service.findFirst({
      where: {
        id: serviceAId,
        userId: userBId, // User B のスコープ
      },
    });

    expect(accessibleByUserB).toBeNull();
  });

  it("User A は自身のサービスとその個人情報フラグにアクセスできること", async () => {
    const service = await prisma.service.findFirst({
      where: {
        id: serviceAId,
        userId: userAId,
      },
      include: {
        personalData: true,
        securitySettings: true,
      },
    });

    expect(service).not.toBeNull();
    expect(service?.name).toBe("User A Private Service");
    expect(service?.securitySettings?.twoFactorEnabled).toBe(true);

    const creditCardData = service?.personalData.find((p) => p.dataType === "クレジットカード情報");
    expect(creditCardData?.isRegistered).toBe(true);
    // 個人情報の実値（番号等）は存在せず、型定義上も保持していないことを確認
    expect((creditCardData as any).value).toBeUndefined();
  });

  it("bcrypt によるパスワードハッシュが平文と一致しないこと、検証が正しく行えること", async () => {
    const user = await prisma.user.findUnique({ where: { id: userAId } });
    expect(user?.passwordHash).not.toBe("Password123!");
    expect(user?.passwordHash.startsWith("$2")).toBe(true);

    const isMatch = await bcrypt.compare("Password123!", user!.passwordHash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await bcrypt.compare("WrongPassword", user!.passwordHash);
    expect(isWrongMatch).toBe(false);
  });
});
