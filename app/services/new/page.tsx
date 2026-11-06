import { ServiceForm } from "@/components/services/service-form";

export const metadata = {
  title: "新規サービス登録 | Privacy Ledger",
};

export default function NewServicePage() {
  return (
    <div className="space-y-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-extrabold text-navy-950 tracking-tight">
          Webサービスの新規登録
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          利用しているサービスと、そこに預けている個人情報の種類を登録します
        </p>
      </div>
      <ServiceForm />
    </div>
  );
}
