# Privacy Ledger (個人情報管理台帳)

個人ユーザーが、自分の個人情報をどのWebサービスに登録しているのかを一元管理し、情報漏洩のリスクや不要なアカウントを把握できるWebアプリケーションです。

---

## 🎯 解決する社会課題 & 開発目的

1. **登録先の把握不能**: 多数のWebサービスに登録し、どこに何を預けたかわからない問題を解決。
2. **登録個人情報の透明化**: 氏名・住所・電話番号・クレジットカードなどの登録状況を可視化。
3. **不要アカウントの放置防止**: 使わなくなったサービスを「利用停止予定」として管理し、退会手続きを支援。
4. **漏洩発生時の迅速な影響把握**: セキュリティインシデント発生時に、該当サービスに何を預けていたか即座に確認可能。
5. **個人情報の実値を保持しない安心設計**: クレジットカード番号や暗証番号などの値そのものは保存せず、「登録の有無（フラグ）」のみを管理するため、当アプリ自身が漏洩源になりません。

---

## 🛠 技術スタック

- **Frontend**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (白基調・ネイビー/ブルーアクセント)
- **UI Components**: shadcn/ui 設計パターン (Tailwind + Lucide React)
- **Backend**: Next.js Route Handlers
- **Database**: PostgreSQL (Docker Compose) / 開発・即時テスト用 SQLite フォールバック完備
- **ORM**: Prisma ORM
- **Authentication**: Auth.js (NextAuth.js v4) + bcryptjs (Credentials Provider / JWT Session)
- **Validation**: Zod
- **Form**: React Hook Form (@hookform/resolvers/zod)
- **Chart**: Recharts (横棒グラフ, ドーナツチャート)
- **Testing**: Vitest + Testing Library + jsdom
- **Environment**: Docker Compose

---

## 🚀 クイックスタート & 動作確認手順

### 1. 依存関係のインストール

```bash
cd privacy-ledger
npm install
```

### 2. データベースのセットアップ

#### 💡 オプション A: ローカル即時起動 (SQLite / Docker不要)
Docker環境がないPCでも即座に完全なCRUD動作確認ができます。

```bash
npm run db:setup:sqlite
```
*※ Prismaクライアント生成、テーブル作成、デモユーザーおよび実用的なWebサービス（Amazon, Google, GitHub, メルカリ等）のシードデータが自動挿入されます。*

#### 🐳 オプション B: PostgreSQL & Docker Compose での起動 (本番互換)
Docker環境が利用可能な場合:

```bash
docker compose up -d
npm run db:setup:postgres
npm run prisma:push
npm run prisma:seed
```

---

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスしてください。

---

### 4. デモアカウントでのログイン確認

ログイン画面 (`http://localhost:3000/login`) にアクセスし、「デモアカウント情報を入力」ボタンを押すか、以下を入力してログインしてください。

- **メールアドレス**: `demo@example.com`
- **パスワード**: `Password123!`

---

### 5. 自動テストの実行 (Vitest)

```bash
npm test
```

以下の要件を網羅するテストが実行され、すべてパスします:
- ユーザー登録・ログイン入力検証（不正パスワード、無効メールの拒否）
- サービス新規登録・編集・削除（CRUD）
- 個人情報登録状況の更新
- セキュリティ設定の更新
- 他ユーザーのデータへのアクセス拒否（マルチテナント隔離）
- 個人情報実値の非保持検証
- カスケード削除の整合性検証

---

## 📱 画面構成

| パス | 画面名 | 主な機能・特徴 |
| :--- | :--- | :--- |
| `/` | サービス紹介 | プロダクト概要、社会課題、デモログイン案内 |
| `/login` | ログイン | クレデンシャル認証、デモワンクリック入力 |
| `/register` | 新規登録 | アカウント作成、バリデーション、自動ログイン |
| `/dashboard` | ダッシュボード | サービス数・利用中・不要アカウント数カード、個人情報種別棒グラフ、ステータス比率円グラフ、セキュリティアラート、最新ログ |
| `/services` | サービス一覧 | サービス名検索、カテゴリー・ステータス絞り込み、詳細リンク、削除モーダル |
| `/services/new` | サービス新規登録 | 基本情報入力、9種類の個人情報フラグ設定、2FA・パスキー設定 |
| `/services/[id]` | サービス詳細 | 登録個人情報の可視化、2FAクイック切替、退会案内、編集・削除 |
| `/services/[id]/edit` | サービス編集 | 登録内容・個人情報フラグ・セキュリティ設定の一括更新 |
| `/security` | セキュリティ管理 | 健全度スコア、注意事項カード、各サービスの2FA/パスキー一覧、確認日ワンクリック更新 |
| `/cleanup` | アカウント整理 | 退会予定サービスの抽出、公式サイト退会リンク、退会手順メモ編集、退会完了トグル、アーカイブ一覧 |
| `/history` | 操作履歴 | 全CRUD・セキュリティ更新アクティビティの時系列タイムライン |
| `/settings` | ユーザー設定 | プロファイル確認、JSONデータエクスポート、退会・全データ完全削除モーダル |

---

## 🔒 セキュリティ実装詳細

1. **多層防御の認可制御**:
   - `middleware.ts` によるURLレベルの認証ガード
   - 各 Route Handler における `getCurrentUser()` と Prisma `where: { userId }` スコープによる完全なデータ分離
2. **パスワードの安全な保護**:
   - `bcryptjs`（ソルトラウンド10）でハッシュ化して保存。平文保存は一切排除。
3. **個人情報実値の非保持**:
   - `PersonalData` テーブルには `isRegistered: Boolean` のみを格納。カード番号や住所の実値はDBにカラムすら存在しません。
4. **セッション保護**:
   - NextAuth JWTセッションによる安全なCookie管理（HttpOnly、SameSite）。
5. **入力検証**:
   - Zod による厳格なスキーマバリデーション。SQLインジェクションは Prisma のプリペアドステートメントにより根本遮断。
6. **安全な削除プロセス**:
   - 誤操作防止の確認モーダル（削除・退会）および外部キーのカスケード削除による孤立データ防止。
