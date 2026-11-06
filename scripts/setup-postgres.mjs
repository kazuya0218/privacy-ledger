import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('🔄 Setting up PostgreSQL Database (Docker)...');

// 1. Copy schema.postgres.prisma to schema.prisma
const pgSchemaContent = `// Prisma Schema for Privacy Ledger (PostgreSQL)
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String        @id @default(cuid())
  email        String        @unique
  name         String?
  passwordHash String
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  services     Service[]
  activityLogs ActivityLog[]

  @@map("users")
}

model Service {
  id               String            @id @default(cuid())
  userId           String
  name             String
  url              String?
  category         String            @default("その他")
  status           String            @default("ACTIVE")
  registeredAt     DateTime?
  notes            String?
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  user             User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  personalData     PersonalData[]
  securitySettings SecuritySettings?

  @@index([userId])
  @@index([status])
  @@index([category])
  @@map("services")
}

model PersonalData {
  id           String   @id @default(cuid())
  serviceId    String
  dataType     String
  isRegistered Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  service      Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  @@unique([serviceId, dataType])
  @@index([serviceId])
  @@map("personal_data")
}

model SecuritySettings {
  id               String    @id @default(cuid())
  serviceId        String    @unique
  twoFactorEnabled Boolean   @default(false)
  passkeyStatus    String    @default("UNKNOWN")
  lastCheckedAt    DateTime?
  notes            String?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  service          Service   @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  @@map("security_settings")
}

model ActivityLog {
  id          String   @id @default(cuid())
  userId      String
  action      String
  description String
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([createdAt])
  @@map("activity_logs")
}
`;

fs.writeFileSync(path.join(rootDir, 'prisma', 'schema.prisma'), pgSchemaContent, 'utf-8');

// 2. Write .env for PostgreSQL
const envContent = `# Database (PostgreSQL via Docker Compose)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/privacy_ledger?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="super-secret-privacy-ledger-key-change-in-production-min32chars"
NODE_ENV="development"
`;
fs.writeFileSync(path.join(rootDir, '.env'), envContent, 'utf-8');

console.log('📦 Generating Prisma Client for PostgreSQL...');
execSync('npx prisma generate', { cwd: rootDir, stdio: 'inherit', shell: true });

console.log('✅ PostgreSQL configuration restored. When Docker is running:');
console.log('   docker compose up -d');
console.log('   npx prisma db push');
console.log('   npm run prisma:seed');
