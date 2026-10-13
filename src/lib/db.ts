import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import os from "os";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function resolveDatabaseUrl(): string {
  // 1. If explicit DATABASE_URL is set (e.g. PostgreSQL or custom URL)
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("dev.db")) {
    return process.env.DATABASE_URL;
  }

  // 2. Local development path
  const localDb = path.join(process.cwd(), "prisma", "dev.db");

  // 3. Serverless environments (Vercel / AWS Lambda)
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME
  );

  if (isServerless && typeof window === "undefined") {
    // /tmp is the standard writable scratch disk in AWS Lambda / Vercel
    const tmpDir = process.env.VERCEL ? "/tmp" : os.tmpdir();
    const tmpDbPath = path.join(tmpDir, "dev.db");

    // Potential source locations of pre-seeded dev.db in deployment bundle
    const candidatePaths = [
      path.join(process.cwd(), "prisma", "dev.db"),
      path.join(process.cwd(), "dev.db"),
      path.resolve(__dirname, "..", "..", "prisma", "dev.db"),
      path.resolve(__dirname, "prisma", "dev.db"),
      path.resolve(__dirname, "dev.db"),
    ];

    const sourceDb = candidatePaths.find((p) => {
      try {
        return fs.existsSync(p);
      } catch {
        return false;
      }
    });

    if (sourceDb) {
      try {
        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir, { recursive: true });
        }
        if (!fs.existsSync(tmpDbPath)) {
          fs.copyFileSync(sourceDb, tmpDbPath);
        }
        return `file:${tmpDbPath}`;
      } catch (err) {
        console.warn("[Prisma] Fallback to read direct bundle:", err);
        return `file:${sourceDb}`;
      }
    }

    return `file:${tmpDbPath}`;
  }

  return process.env.DATABASE_URL || `file:${localDb}`;
}

const dbUrl = resolveDatabaseUrl();
process.env.DATABASE_URL = dbUrl;

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;

