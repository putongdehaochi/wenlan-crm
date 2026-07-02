/**
 * 解析数据库连接串（兼容 Vercel + Neon 多种环境变量名）
 */

/** 迁移 / seed 优先直连 */
const MIGRATION_URL_KEYS = [
  "DIRECT_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "POSTGRES_URL_NO_SSL",
] as const

/** 运行时 / 兜底 */
const RUNTIME_URL_KEYS = [
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
] as const

function readFirst(keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim()
    if (value) {
      return value
    }
  }
  return undefined
}

export function resolveMigrationDatabaseUrl(): string | undefined {
  return readFirst([...MIGRATION_URL_KEYS, ...RUNTIME_URL_KEYS])
}

export function resolveRuntimeDatabaseUrl(): string | undefined {
  return readFirst([...RUNTIME_URL_KEYS, ...MIGRATION_URL_KEYS])
}

export function requireMigrationDatabaseUrl(): string {
  const url = resolveMigrationDatabaseUrl()
  if (!url) {
    throw new Error(
      [
        "未找到数据库连接串。",
        "请在 Vercel 项目中：Storage → Create Database → Neon Postgres，",
        "或手动设置环境变量 DATABASE_URL / POSTGRES_URL。",
      ].join("")
    )
  }
  return url
}
