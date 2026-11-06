import "@testing-library/jest-dom";

process.env.NEXTAUTH_URL = "http://localhost:3000";
process.env.NEXTAUTH_SECRET = "test-secret-1234567890-test-test-key";
process.env.DATABASE_URL = "file:./dev.db";
