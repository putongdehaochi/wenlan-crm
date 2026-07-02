/**
 * @file db-reset.mts
 * @purpose 清空并重建 Prisma Dev（会删除本地测试数据）
 *
 * 用法：npm run db:reset
 *
 * Prisma 会要求手动输入：i will lose local data
 */

import "dotenv/config"

import {
  PRISMA_DEV_NAME,
  canQueryDatabase,
  parseTcpDatabaseUrl,
  run,
  runCapture,
  sleep,
  startPrismaDevDetached,
  waitForDatabase,
} from "./prisma-dev-utils"

async function main(): Promise<void> {
  console.log("")
  console.log("⚠️  此操作会删除 Prisma Dev 本地数据库中的所有数据。")
  console.log("    若只想重启并保留数据，请改用：npm run db:recover")
  console.log("")

  console.log("▶ 删除并重建 Prisma Dev（需按提示确认）…")
  const rmExit = await run("npx", [
    "prisma",
    "dev",
    "rm",
    PRISMA_DEV_NAME,
    "--force",
  ])

  if (rmExit !== 0) {
    throw new Error("Prisma Dev 重置已取消或失败")
  }

  await sleep(2_000)

  console.log("▶ 重新创建 Prisma Dev…")
  const databaseUrl = await startPrismaDevDetached()
  if (!databaseUrl) {
    throw new Error("Prisma Dev 创建失败")
  }

  await waitForDatabase(databaseUrl, 120_000)

  if (!(await canQueryDatabase(databaseUrl))) {
    throw new Error("Prisma Dev 已创建但暂时无法连接")
  }

  console.log("✓ Prisma Dev 已重置（数据已清空）")
  console.log(`  DATABASE_URL="${databaseUrl}"`)
  console.log("")
  console.log("请执行：npx prisma migrate deploy && npm run dev:all")
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
