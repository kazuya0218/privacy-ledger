import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const schemaPath = path.join(rootDir, 'prisma', 'schema.prisma');

const dbUrl = process.env.DATABASE_URL || '';
// file: から始まる場合のみ SQLite。それ以外（PostgreSQL または未設定時）は本番用に PostgreSQL をデフォルトにする
const isExplicitSqlite = dbUrl.startsWith('file:') || process.env.USE_SQLITE === 'true';

let schema = fs.readFileSync(schemaPath, 'utf-8');

if (isExplicitSqlite) {
  console.log('📁 Detected SQLite (local development mode). Setting provider="sqlite"...');
  schema = schema.replace(/provider\s*=\s*"(sqlite|postgresql)"/, 'provider = "sqlite"');
  schema = schema.replace(/url\s*=\s*("file:[^"]*"|env\("DATABASE_URL"\))/, 'url = env("DATABASE_URL")');
} else {
  console.log('🐘 Production/PostgreSQL mode. Setting provider="postgresql"...');
  schema = schema.replace(/provider\s*=\s*"(sqlite|postgresql)"/, 'provider = "postgresql"');
  schema = schema.replace(/url\s*=\s*("file:[^"]*"|env\("DATABASE_URL"\))/, 'url = env("DATABASE_URL")');
}

fs.writeFileSync(schemaPath, schema, 'utf-8');

console.log('📦 Generating Prisma Client...');
execSync('npx prisma generate', { cwd: rootDir, stdio: 'inherit' });

// もし PostgreSQL の DATABASE_URL が提供されている場合、テーブルを自動プッシュ＆シード
const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');
if (isPostgres) {
  try {
    console.log('🚀 Synchronizing schema with PostgreSQL database (prisma db push)...');
    execSync('npx prisma db push --skip-generate', { cwd: rootDir, stdio: 'inherit' });
    
    console.log('🌱 Ensuring demo account is provisioned in database...');
    execSync('node scripts/seed.mjs', { cwd: rootDir, stdio: 'inherit' });
  } catch (err) {
    console.warn('⚠️ Warning during DB push/seed in build step (may connect at runtime):', err.message);
  }
}
