/**
 * Vercel 生产构建：generate → migrate → seed → next build
 */

import "dotenv/config"

import { spawnSync } from "node:child_process"

import { requireMigrationDatabaseUrl } from "./lib/database-url"

function run(command: string, args: string[]): void {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: true,
    env: process.env,
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

function main(): void {
  run("npx", ["prisma", "generate"])

  const migrationUrl = requireMigrationDatabaseUrl()
  process.env.DATABASE_URL = migrationUrl

  console.log("▶ 使用数据库连接执行 migrate deploy…")
  run("npx", ["prisma", "migrate", "deploy"])

  console.log("▶ 初始化演示数据…")
  run("npx", ["tsx", "prisma/seed.ts"])

  run("npx", ["next", "build"])
}

main()
