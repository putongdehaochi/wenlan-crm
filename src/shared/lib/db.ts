/**
 * @file db.ts
 * @feature shared
 * @purpose Prisma 客户端单例；HMR 下复用连接池，供 Repository 层访问数据库
 */

import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

import { PrismaClient } from "@/generated/prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
  pool?: pg.Pool
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set")
  }

  // Prisma Dev 本地实例连接上限约 10；限制 pool 并发并在池内排队，避免 P1017
  const pool =
    globalForPrisma.pool ??
    new pg.Pool({
      connectionString,
      max: 5,
      connectionTimeoutMillis: 0,
      idleTimeoutMillis: 1_000,
    })
  if (!globalForPrisma.pool) {
    globalForPrisma.pool = pool
  }

  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
