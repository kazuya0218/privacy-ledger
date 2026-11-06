import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  UserX,
  History,
  CheckCircle2,
  ArrowRight,
  Database,
  KeyRound,
  FileSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="space-y-16 py-6 sm:py-12">
      {/* ヒーローセクション */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          個人情報の実値は保存しない、安心・安全な管理台帳
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-navy-950 leading-tight">
          どのサービスに、
          <br className="hidden sm:inline" />
          <span className="text-blue-600">何の個人情報を預けているか</span>
          <br />
          把握できていますか？
        </h1>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          「Privacy Ledger」は、Webサービスごとの個人情報登録状況を一元管理し、
          情報漏洩リスクの可視化や不要アカウントの整理を支援するセキュリティダッシュボードです。
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto gap-2 text-base px-8 py-6 shadow-md">
              無料で始める
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-6">
              ログイン画面へ
            </Button>
          </Link>
        </div>

        {/* デモアカウント案内 */}
        <div className="p-3 bg-slate-100/80 rounded-lg border border-slate-200 inline-block text-xs text-slate-600">
          💡 テスト用デモアカウント: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-300 font-semibold text-slate-800">demo@example.com</code> / パスワード: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-300 font-semibold text-slate-800">Password123!</code>
        </div>
      </section>

      {/* 解決する社会課題 */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            こんな不安や課題を抱えていませんか？
          </h2>
          <p className="text-slate-500 text-sm">
            インターネット利用が増えるにつれ、個人情報の登録先は見失われがちです。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-slate-200">
            <CardContent className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <FileSearch className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">登録先がわからない</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                どのサービスに氏名・住所・クレジットカード番号を登録したのか忘れてしまい、全体像が把握できない。
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <UserX className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">不要アカウントの放置</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                使わなくなったサービスのアカウントを放置したままにしており、不正アクセスや漏洩リスクの温床に。
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">漏洩時の影響が見えない</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                ニュースで情報漏洩が報じられても、自分が対象サービスを利用していたか、何の情報を登録していたか即座に確認できない。
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 主な機能 */}
      <section className="space-y-8 bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Privacy Ledger が提供するコア機能
          </h2>
          <p className="text-slate-500 text-sm">
            個人情報を安全に、効率的にコントロールするための4つのアプローチ
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="h-9 w-9 rounded-md bg-blue-600 text-white flex items-center justify-center">
              <EyeOff className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-slate-900">登録有無だけの安全設計</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              カード番号や暗証番号そのものは一切保存しません。「登録しているか否か」のフラグのみを安全に記録します。
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="h-9 w-9 rounded-md bg-indigo-600 text-white flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-slate-900">2段階認証・セキュリティ管理</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              各サービスの2FA設定状況やパスキー対応を一覧化。未設定の重要サービスへの対策を促します。
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="h-9 w-9 rounded-md bg-emerald-600 text-white flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-slate-900">不要アカウント整理手順</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              利用停止予定のサービスをリストアップし、退会手順メモを残しながら安全に整理・退会完了へ導きます。
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="h-9 w-9 rounded-md bg-navy-800 text-white flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-slate-900">完全な操作履歴</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              いつ、どのサービスの登録情報を更新したかをタイムラインで記録。管理の形跡をいつでも振り返ることができます。
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center space-y-4 py-8">
        <h3 className="text-2xl font-bold text-slate-900">今すぐあなたの個人情報台帳を作りましょう</h3>
        <p className="text-sm text-slate-500">登録は1分で完了。クレジットカード登録不要でご利用いただけます。</p>
        <Link href="/register">
          <Button size="lg" className="px-8 shadow">新規アカウント登録</Button>
        </Link>
      </section>
    </div>
  );
}
