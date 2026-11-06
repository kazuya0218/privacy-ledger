import { z } from "zod";

export const securityUpdateSchema = z.object({
  twoFactorEnabled: z.boolean(),
  passkeyStatus: z.enum(["SUPPORTED", "UNSUPPORTED", "UNKNOWN"]),
  lastCheckedAt: z.string().optional().nullable(),
  notes: z.string().max(1000, "メモは1000文字以内で入力してください").optional().nullable(),
});

export type SecurityUpdateInput = z.infer<typeof securityUpdateSchema>;
