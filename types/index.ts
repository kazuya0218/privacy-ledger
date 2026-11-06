export type ServiceStatus = "ACTIVE" | "SUSPENDED" | "CANCELLED";

export type PasskeyStatus = "SUPPORTED" | "UNSUPPORTED" | "UNKNOWN";

export const DATA_TYPES = [
  "氏名",
  "メールアドレス",
  "電話番号",
  "住所",
  "生年月日",
  "クレジットカード情報",
  "銀行口座情報",
  "本人確認書類",
  "その他",
] as const;

export type DataType = (typeof DATA_TYPES)[number];

export const SERVICE_CATEGORIES = [
  "EC・ショッピング",
  "SNS・コミュニケーション",
  "エンタメ・動画・音楽",
  "金融・決済",
  "仕事・ビジネス",
  "生活・インフラ",
  "その他",
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export interface PersonalDataItem {
  id?: string;
  dataType: DataType | string;
  isRegistered: boolean;
}

export interface SecuritySettingItem {
  id?: string;
  twoFactorEnabled: boolean;
  passkeyStatus: PasskeyStatus;
  lastCheckedAt: string | Date | null;
  notes?: string | null;
}

export interface ServiceWithDetails {
  id: string;
  userId: string;
  name: string;
  url: string | null;
  category: string;
  status: ServiceStatus;
  registeredAt: string | Date | null;
  notes: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  personalData: PersonalDataItem[];
  securitySettings: SecuritySettingItem | null;
}

export interface ActivityLogItem {
  id: string;
  userId: string;
  action: string;
  description: string;
  createdAt: string | Date;
}

export interface RiskAnalysis {
  level: "HIGH" | "MEDIUM" | "LOW";
  score: number; // 0-100
  factors: {
    type: "CRITICAL_DATA" | "NO_2FA" | "OLD_UNCHECKED" | "UNUSED_ACCOUNT";
    title: string;
    description: string;
    serviceNames: string[];
  }[];
}

export interface DashboardStats {
  totalServices: number;
  activeServices: number;
  suspendedServices: number;
  cancelledServices: number;
  twoFactorRate: number; // 0-100%
  dataTypeCounts: { name: string; count: number }[];
  categoryCounts: { name: string; count: number }[];
  recentLogs: ActivityLogItem[];
  highRiskCount: number;
}
