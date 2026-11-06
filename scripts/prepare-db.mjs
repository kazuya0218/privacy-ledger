import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const schemaPath = path.join(rootDir, 'prisma', 'schema.prisma');

const dbUrl = process.env.DATABASE_URL || '';
const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');

let schema = fs.readFileSync(schemaPath, 'utf-8');

if (isPostgres) {
  console.log('🐘 Detected PostgreSQL in DATABASE_URL. Setting provider="postgresql" for production deployment...');
  schema = schema.replace(/provider\s*=\s*"(sqlite|postgresql)"/, 'provider = "postgresql"');
  schema = schema.replace(/url\s*=\s*("file:[^"]*"|env\("DATABASE_URL"\))/, 'url = env("DATABASE_URL")');
} else if (dbUrl.startsWith('file:') || !dbUrl) {
  console.log('📁 Detected SQLite (local). Setting provider="sqlite"...');
  schema = schema.replace(/provider\s*=\s*"(sqlite|postgresql)"/, 'provider = "sqlite"');
  schema = schema.replace(/url\s*=\s*("file:[^"]*"|env\("DATABASE_URL"\))/, 'url = env("DATABASE_URL")');
}

fs.writeFileSync(schemaPath, schema, 'utf-8');

console.log('📦 Generating Prisma Client...');
execSync('npx prisma generate', { cwd: rootDir, stdio: 'inherit' });
