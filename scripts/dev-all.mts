/**
 * @file dev-all.mts
 * @purpose 一键启动：Prisma Dev 数据库 + 迁移 + Next.js 开发服
 *
 * 用法：npm run dev:all
 *
 * 默认保留 Prisma Dev 本地数据；僵死时仅 stop → start 重启。
 */

import "dotenv/config"

import {
  ensurePrismaDevReady,
  MIGRATE_RETRY_DELAY_MS,
  printRecoveryHelp,
  run,
  sleep,
} from "./prisma-dev-utils"

const MIGRATE_RETRY = 5

function getEnvDatabaseUrl(): string {
  const connectionString = process.env.DATABASE_URL?.trim()
  if (!connectionString) {
    throw new Error("未找到 DATABASE_URL，请检查 .env 配置")
  }
  return connectionString
}

async function migrateWithRetry(databaseUrl: string): Promise<void> {
  console.log("▶ 应用数据库迁移…")

  for (let attempt = 1; attempt <= MIGRATE_RETRY; attempt += 1) {
    const migrateExit = await run(
      "npx",
      ["prisma", "migrate", "deploy"],
      { DATABASE_URL: databaseUrl }
    )

    if (migrateExit === 0) {
      return
    }

    if (attempt === MIGRATE_RETRY) {
      console.error("✗ 数据库迁移失败")
      printRecoveryHelp()
      process.exit(migrateExit)
    }

    console.log(
      `ℹ️  迁移失败，${MIGRATE_RETRY_DELAY_MS / 1000}s 后重试（${attempt}/${MIGRATE_RETRY}）…`
    )
    await sleep(MIGRATE_RETRY_DELAY_MS)
  }
}

async function main(): Promise<void> {
  const envUrl = getEnvDatabaseUrl()
  const databaseUrl = await ensurePrismaDevReady(envUrl)
  await migrateWithRetry(databaseUrl)

  console.log("▶ 启动 Next.js 开发服 http://localhost:3000")
  console.log("ℹ️  关闭网站用 Ctrl+C；数据库会继续在后台运行")
  console.log("ℹ️  下班可执行：npm run db:stop")
  const webExit = await run("npm", ["run", "dev"], { DATABASE_URL: databaseUrl })
  process.exit(webExit)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  printRecoveryHelp()
  process.exit(1)
})
