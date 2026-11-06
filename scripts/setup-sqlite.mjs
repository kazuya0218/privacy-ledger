import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('🔄 Setting up Local SQLite Database...');

// 1. Copy schema.sqlite.prisma to schema.prisma
const sqliteSchemaPath = path.join(rootDir, 'prisma', 'schema.sqlite.prisma');
const targetSchemaPath = path.join(rootDir, 'prisma', 'schema.prisma');
fs.copyFileSync(sqliteSchemaPath, targetSchemaPath);

// 2. Write .env for local SQLite
const envContent = `# Local Development with SQLite
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="local-dev-secret-privacy-ledger-super-safe-key-12345"
NODE_ENV="development"
`;
fs.writeFileSync(path.join(rootDir, '.env'), envContent, 'utf-8');

console.log('📦 Generating Prisma Client...');
execSync('npx prisma generate', { cwd: rootDir, stdio: 'inherit', shell: true });

console.log('🚀 Pushing schema to dev.db...');
execSync('npx prisma db push --skip-generate', { cwd: rootDir, stdio: 'inherit', shell: true });

console.log('🌱 Seeding initial demo data...');
execSync('node scripts/seed.mjs', { cwd: rootDir, stdio: 'inherit', shell: true });

console.log('✅ Local SQLite setup complete! You can run "npm run dev" directly.');
