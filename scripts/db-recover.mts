/**
 * @file db-recover.mts
 * @purpose 修复 Prisma Dev 连接问题（保留本地数据）
 *
 * 用法：npm run db:recover
 */

import "dotenv/config"

import {
  ensurePrismaDevReady,
  printRecoveryHelp,
  warnIfEnvPortMismatch,
} from "./prisma-dev-utils"

function getEnvDatabaseUrl(): string {
  const connectionString = process.env.DATABASE_URL?.trim()
  if (!connectionString) {
    throw new Error("未找到 DATABASE_URL，请检查 .env 配置")
  }
  return connectionString
}

async function main(): Promise<void> {
  const envUrl = getEnvDatabaseUrl()
  const databaseUrl = await ensurePrismaDevReady(envUrl)

  console.log("✓ Prisma Dev 已就绪（数据已保留）")
  console.log(`  DATABASE_URL="${databaseUrl}"`)
  warnIfEnvPortMismatch(envUrl, databaseUrl)
  console.log("可继续执行：npm run dev  或  npm run dev:all")
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  printRecoveryHelp()
  process.exit(1)
})
