export const SERVICE_CATEGORIES = [
  "EC・ショッピング",
  "SNS・コミュニケーション",
  "エンタメ・動画・音楽",
  "金融・決済",
  "仕事・ビジネス",
  "生活・インフラ",
  "その他",
] as const;

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

// 高リスク・重要とみなす個人情報種別
export const CRITICAL_DATA_TYPES = [
  "クレジットカード情報",
  "銀行口座情報",
  "本人確認書類",
] as const;

export const STATUS_LABELS: Record<string, { label: string; badgeClass: string; color: string }> = {
  ACTIVE: {
    label: "利用中",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    color: "#10b981",
  },
  SUSPENDED: {
    label: "利用停止予定",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    color: "#f59e0b",
  },
  CANCELLED: {
    label: "退会済み",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
    color: "#64748b",
  },
};

export const PASSKEY_LABELS: Record<string, { label: string; badgeClass: string }> = {
  SUPPORTED: {
    label: "対応済",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  UNSUPPORTED: {
    label: "未対応",
    badgeClass: "bg-slate-50 text-slate-600 border-slate-200",
  },
  UNKNOWN: {
    label: "未確認",
    badgeClass: "bg-gray-50 text-gray-500 border-gray-200",
  },
};
