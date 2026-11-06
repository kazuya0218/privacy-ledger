import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { loginSchema } from "./validations/auth";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const normalizedEmail = email.toLowerCase().trim();

        let user = null;
        try {
          user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
          });
        } catch (dbError) {
          console.error("Database query failed during authorize:", dbError);
          return null;
        }

        // デモアカウントの自己修復（初回デプロイ直後でシードが未実行の場合でも自動作成）
        if (!user && normalizedEmail === "demo@example.com" && password === "Password123!") {
          try {
            console.log("🌱 First-time login detected: Auto-provisioning demo user in database...");
            const passwordHash = await bcrypt.hash("Password123!", 10);
            user = await prisma.user.create({
              data: {
                email: "demo@example.com",
                name: "デモユーザー",
                passwordHash,
                services: {
                  create: [
                    {
                      name: "Amazon.co.jp",
                      url: "https://www.amazon.co.jp",
                      category: "EC・ショッピング",
                      status: "ACTIVE",
                      notes: "メインのショッピング用アカウント",
                      securitySettings: {
                        create: {
                          twoFactorEnabled: true,
                          passkeyStatus: "SUPPORTED",
                          lastCheckedAt: new Date(),
                          notes: "2FAアプリ設定済",
                        },
                      },
                      personalData: {
                        create: [
                          { dataType: "氏名", isRegistered: true },
                          { dataType: "メールアドレス", isRegistered: true },
                          { dataType: "住所", isRegistered: true },
                          { dataType: "クレジットカード情報", isRegistered: true },
                        ],
                      },
                    },
                    {
                      name: "Google",
                      url: "https://accounts.google.com",
                      category: "仕事・ビジネス",
                      status: "ACTIVE",
                      notes: "Gmailおよび仕事用ドライブ",
                      securitySettings: {
                        create: {
                          twoFactorEnabled: true,
                          passkeyStatus: "SUPPORTED",
                          lastCheckedAt: new Date(),
                        },
                      },
                      personalData: {
                        create: [
                          { dataType: "氏名", isRegistered: true },
                          { dataType: "メールアドレス", isRegistered: true },
                        ],
                      },
                    },
                  ],
                },
              },
            });
            console.log("✅ Auto-provisioning completed successfully.");
          } catch (autoSeedErr) {
            console.error("Auto-provisioning demo user error:", autoSeedErr);
          }
        }

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        // ログイン操作ログを記録
        try {
          await prisma.activityLog.create({
            data: {
              userId: user.id,
              action: "USER_LOGIN",
              description: "ログインしました",
            },
          });
        } catch {
          // ログ失敗でログインをブロックしない
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-privacy-ledger-app",
};
