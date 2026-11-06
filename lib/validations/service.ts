import { z } from "zod";
import { DATA_TYPES } from "../constants";

export const serviceFormSchema = z.object({
  name: z.string().min(1, "サービス名は必須です").max(100, "サービス名は100文字以内で入力してください"),
  url: z.string().url("有効なURL形式で入力してください").or(z.literal("")).optional(),
  category: z.string().min(1, "カテゴリーを選択してください"),
  status: z.enum(["ACTIVE", "SUSPENDED", "CANCELLED"]),
  registeredAt: z.string().optional().nullable(),
  notes: z.string().max(1000, "メモは1000文字以内で入力してください").optional().nullable(),
  // 登録している個人情報（種類ごとのbooleanマップ）
  personalData: z.record(z.boolean()).optional(),
  // セキュリティ設定
  twoFactorEnabled: z.boolean().default(false),
  passkeyStatus: z.enum(["SUPPORTED", "UNSUPPORTED", "UNKNOWN"]).default("UNKNOWN"),
  securityNotes: z.string().max(1000, "セキュリティメモは1000文字以内で入力してください").optional().nullable(),
});

export type ServiceFormData = z.infer<typeof serviceFormSchema>;
