/**
 * Vercel 生产构建：generate → migrate → next build
 * 数据初始化请手动：SEED_DATABASE=1 npx tsx prisma/seed.ts
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

  run("npx", ["next", "build"])
}

main()
