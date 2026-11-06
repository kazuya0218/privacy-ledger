import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 既存のデモユーザーの有無を確認（冪等性の担保）
  const demoEmail = 'demo@example.com';
  const existingUser = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  if (existingUser) {
    const isPwValid = await bcrypt.compare('Password123!', existingUser.passwordHash);
    if (isPwValid) {
      console.log('✅ Demo user already exists with valid password. Skipping seed to preserve data.');
      return;
    } else {
      // パスワードが異なる場合のみハッシュを更新
      const newHash = await bcrypt.hash('Password123!', 10);
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { passwordHash: newHash },
      });
      console.log('🔄 Updated password hash for existing demo user.');
      return;
    }
  }

  // デモユーザー作成
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const user = await prisma.user.create({
    data: {
      email: demoEmail,
      name: 'デモユーザー',
      passwordHash,
    },
  });

  console.log(`👤 Created user: ${user.email} (id: ${user.id})`);

  // サンプルサービスデータ
  const sampleServices = [
    {
      name: 'Amazon.co.jp',
      url: 'https://www.amazon.co.jp',
      category: 'EC・ショッピング',
      status: 'ACTIVE',
      registeredAt: new Date('2020-04-15'),
      notes: 'メインのショッピング用アカウント。',
      dataTypes: ['氏名', 'メールアドレス', '電話番号', '住所', 'クレジットカード情報'],
      security: {
        twoFactorEnabled: true,
        passkeyStatus: 'SUPPORTED',
        lastCheckedAt: new Date(),
        notes: '2段階認証アプリ(TOTP)設定済み。パスキーも登録済み。',
      },
    },
    {
      name: 'Google',
      url: 'https://accounts.google.com',
      category: '仕事・ビジネス',
      status: 'ACTIVE',
      registeredAt: new Date('2018-01-10'),
      notes: 'Gmailおよび仕事用ドライブ。',
      dataTypes: ['氏名', 'メールアドレス', '電話番号', '生年月日'],
      security: {
        twoFactorEnabled: true,
        passkeyStatus: 'SUPPORTED',
        lastCheckedAt: new Date(),
        notes: 'Googleプロンプト + セキュリティキー設定。',
      },
    },
    {
      name: 'GitHub',
      url: 'https://github.com',
      category: '仕事・ビジネス',
      status: 'ACTIVE',
      registeredAt: new Date('2021-06-20'),
      notes: '開発コード・リポジトリ管理。',
      dataTypes: ['氏名', 'メールアドレス'],
      security: {
        twoFactorEnabled: true,
        passkeyStatus: 'SUPPORTED',
        lastCheckedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30日前
        notes: 'TOTP認証設定済み。',
      },
    },
    {
      name: 'メルカリ',
      url: 'https://jp.mercari.com',
      category: 'EC・ショッピング',
      status: 'ACTIVE',
      registeredAt: new Date('2022-09-05'),
      notes: 'フリマ売買用。本人確認済み。',
      dataTypes: ['氏名', 'メールアドレス', '電話番号', '住所', '銀行口座情報', '本人確認書類', 'クレジットカード情報'],
      security: {
        twoFactorEnabled: false, // 2FA未設定 (リスク検出用)
        passkeyStatus: 'SUPPORTED',
        lastCheckedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 4ヶ月前(長期間未確認)
        notes: 'SMS認証はあるが専用2FAアプリ未設定。銀行口座ありのため要確認。',
      },
    },
    {
      name: '旧動画ストリーミング',
      url: 'https://example-old-stream.com',
      category: 'エンタメ・動画・音楽',
      status: 'SUSPENDED', // 利用停止・退会予定
      registeredAt: new Date('2021-11-12'),
      notes: '無料トライアル後使っていない。クレジットカードが登録されたままになっているため退会必要。',
      dataTypes: ['メールアドレス', '生年月日', 'クレジットカード情報'],
      security: {
        twoFactorEnabled: false,
        passkeyStatus: 'UNSUPPORTED',
        lastCheckedAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
        notes: '最終ログインから半年以上経過。',
      },
    },
    {
      name: '放置ニュースレター',
      url: 'https://example-old-news.com',
      category: 'その他',
      status: 'CANCELLED', // 退会済み
      registeredAt: new Date('2019-03-01'),
      notes: '2024年に公式サイトよりアカウント削除手続き完了。',
      dataTypes: ['メールアドレス'],
      security: {
        twoFactorEnabled: false,
        passkeyStatus: 'UNKNOWN',
        lastCheckedAt: new Date('2024-01-10'),
        notes: '削除確認済み。',
      },
    },
  ];

  const allPossibleDataTypes = [
    '氏名',
    'メールアドレス',
    '電話番号',
    '住所',
    '生年月日',
    'クレジットカード情報',
    '銀行口座情報',
    '本人確認書類',
    'その他',
  ];

  for (const item of sampleServices) {
    const service = await prisma.service.create({
      data: {
        userId: user.id,
        name: item.name,
        url: item.url,
        category: item.category,
        status: item.status,
        registeredAt: item.registeredAt,
        notes: item.notes,
        securitySettings: {
          create: {
            twoFactorEnabled: item.security.twoFactorEnabled,
            passkeyStatus: item.security.passkeyStatus,
            lastCheckedAt: item.security.lastCheckedAt,
            notes: item.security.notes,
          },
        },
        personalData: {
          create: allPossibleDataTypes.map((dt) => ({
            dataType: dt,
            isRegistered: item.dataTypes.includes(dt),
          })),
        },
      },
    });

    console.log(`  + Added service: ${service.name}`);
  }

  // アクティビティログ
  const logs = [
    { action: 'SERVICE_CREATE', description: '「Amazon.co.jp」の管理情報を登録しました' },
    { action: 'SECURITY_UPDATE', description: '「Google」の2段階認証設定を確認・更新しました' },
    { action: 'PERSONAL_DATA_UPDATE', description: '「メルカリ」の登録個人情報（銀行口座・本人確認）を更新しました' },
    { action: 'CLEANUP_UPDATE', description: '「旧動画ストリーミング」のステータスを「利用停止予定」に設定しました' },
    { action: 'SERVICE_CREATE', description: '「放置ニュースレター」を退会済みとして記録しました' },
  ];

  for (const log of logs) {
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: log.action,
        description: log.description,
      },
    });
  }

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
