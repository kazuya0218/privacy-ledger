import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "@/lib/validations/auth";
import { serviceFormSchema } from "@/lib/validations/service";
import { securityUpdateSchema } from "@/lib/validations/security";

describe("Input Validation Tests (Zod)", () => {
  describe("User Registration Validation", () => {
    it("有効なユーザー登録データを受け入れること", () => {
      const valid = {
        name: "テストユーザー",
        email: "test@example.com",
        password: "Password123",
      };
      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("無効なメールアドレスを拒否すること", () => {
      const invalid = {
        name: "テストユーザー",
        email: "not-an-email",
        password: "Password123",
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email).toBeDefined();
      }
    });

    it("8文字未満の短いパスワードを拒否すること", () => {
      const invalid = {
        name: "テストユーザー",
        email: "test@example.com",
        password: "Pass1",
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("数字を含まないパスワードを拒否すること", () => {
      const invalid = {
        name: "テストユーザー",
        email: "test@example.com",
        password: "PasswordOnlyLetters",
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("Service Form Validation", () => {
    it("有効なサービスデータを受け入れること", () => {
      const valid = {
        name: "Amazon",
        url: "https://amazon.co.jp",
        category: "EC・ショッピング",
        status: "ACTIVE" as const,
        registeredAt: "2024-01-01",
        notes: "メモテスト",
        personalData: {
          氏名: true,
          メールアドレス: true,
          クレジットカード情報: true,
        },
        twoFactorEnabled: true,
        passkeyStatus: "SUPPORTED" as const,
        securityNotes: "TOTP設定済",
      };
      const result = serviceFormSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("空のサービス名を拒否すること", () => {
      const invalid = {
        name: "",
        category: "その他",
        status: "ACTIVE" as const,
      };
      const result = serviceFormSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.name).toBeDefined();
      }
    });

    it("不正なURL形式を拒否すること", () => {
      const invalid = {
        name: "テストサービス",
        url: "not-a-valid-url",
        category: "その他",
        status: "ACTIVE" as const,
      };
      const result = serviceFormSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.url).toBeDefined();
      }
    });
  });

  describe("Security Update Validation", () => {
    it("セキュリティ設定の更新データを受け入れること", () => {
      const valid = {
        twoFactorEnabled: true,
        passkeyStatus: "SUPPORTED" as const,
        lastCheckedAt: new Date().toISOString(),
        notes: "二段階認証アプリ確認済",
      };
      const result = securityUpdateSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });
});
