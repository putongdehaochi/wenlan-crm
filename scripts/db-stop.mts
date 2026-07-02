/**
 * @file db-stop.mts
 * @purpose 停止 Prisma Dev（保留数据，下次 start 可恢复）
 *
 * 用法：npm run db:stop
 */

import { PRISMA_DEV_NAME, run } from "./prisma-dev-utils"

async function main(): Promise<void> {
  console.log("▶ 停止 Prisma Dev（数据会保留）…")
  const exitCode = await run("npx", ["prisma", "dev", "stop", PRISMA_DEV_NAME])

  if (exitCode !== 0) {
    process.exit(exitCode)
  }

  console.log("✓ 已停止。下次启动：npm run dev:all 或 npm run db:recover")
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
