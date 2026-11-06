import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

describe("CRUD Operations & Cascade Integrity Tests", () => {
  let userId: string;

  beforeAll(async () => {
    const hash = await bcrypt.hash("Password123!", 10);
    const user = await prisma.user.create({
      data: {
        email: `crud-test-${Date.now()}@example.com`,
        name: "CRUD Tester",
        passwordHash: hash,
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
  });

  it("サービスの作成、個人情報登録フラグ、セキュリティ設定が正しく永続化されること", async () => {
    const service = await prisma.service.create({
      data: {
        userId,
        name: "Test Shopping Service",
        url: "https://shop.example.com",
        category: "EC・ショッピング",
        status: "ACTIVE",
        personalData: {
          create: [
            { dataType: "氏名", isRegistered: true },
            { dataType: "住所", isRegistered: true },
            { dataType: "銀行口座情報", isRegistered: false },
          ],
        },
        securitySettings: {
          create: {
            twoFactorEnabled: false,
            passkeyStatus: "UNKNOWN",
          },
        },
      },
      include: {
        personalData: true,
        securitySettings: true,
      },
    });

    expect(service.id).toBeDefined();
    expect(service.name).toBe("Test Shopping Service");
    expect(service.personalData.length).toBe(3);
    expect(service.securitySettings?.twoFactorEnabled).toBe(false);

    // 編集
    const updated = await prisma.service.update({
      where: { id: service.id },
      data: {
        name: "Updated Shopping Service",
        status: "SUSPENDED",
      },
    });
    expect(updated.name).toBe("Updated Shopping Service");
    expect(updated.status).toBe("SUSPENDED");

    // セキュリティ設定の更新
    const updatedSec = await prisma.securitySettings.update({
      where: { serviceId: service.id },
      data: {
        twoFactorEnabled: true,
        passkeyStatus: "SUPPORTED",
      },
    });
    expect(updatedSec.twoFactorEnabled).toBe(true);
    expect(updatedSec.passkeyStatus).toBe("SUPPORTED");

    // 削除（カスケード削除の確認）
    await prisma.service.delete({
      where: { id: service.id },
    });

    const deletedService = await prisma.service.findUnique({
      where: { id: service.id },
    });
    expect(deletedService).toBeNull();

    // 紐付いていたPersonalDataやSecuritySettingsもカスケード削除されていること
    const orphanedData = await prisma.personalData.findMany({
      where: { serviceId: service.id },
    });
    expect(orphanedData.length).toBe(0);

    const orphanedSec = await prisma.securitySettings.findUnique({
      where: { serviceId: service.id },
    });
    expect(orphanedSec).toBeNull();
  });
});
