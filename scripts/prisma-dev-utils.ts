/**
 * @file prisma-dev-utils.ts
 * @purpose Prisma Dev 启动/恢复工具（默认保留数据）
 */

import { spawn } from "node:child_process"

import pg from "pg"

export const PRISMA_DEV_NAME = "default"
export const DB_WAIT_MS = 120_000
export const MIGRATE_RETRY_DELAY_MS = 3_000

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function run(
  command: string,
  args: string[],
  env?: Record<string, string>
): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: true,
      env: { ...process.env, ...env },
    })

    child.on("error", reject)
    child.on("close", (code) => resolve(code ?? 1))
  })
}

export function runCapture(
  command: string,
  args: string[]
): Promise<{ stdout: string; exitCode: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      shell: true,
      env: process.env,
    })

    let stdout = ""

    child.stdout?.on("data", (chunk) => {
      stdout += String(chunk)
    })
    child.stderr?.on("data", (chunk) => {
      stdout += String(chunk)
    })

    child.on("error", reject)
    child.on("close", (code) => {
      resolve({ stdout, exitCode: code ?? 1 })
    })
  })
}

export function parseTcpDatabaseUrl(output: string): string | null {
  const match = output.match(
    /postgres:\/\/postgres:postgres@localhost:\d+\/[^\s"']+/i
  )
  return match?.[0] ?? null
}

export async function readPrismaDevTcpUrl(): Promise<string | null> {
  const { stdout } = await runCapture("npx", ["prisma", "dev", "ls"])
  return parseTcpDatabaseUrl(stdout)
}

export async function canQueryDatabase(
  connectionString: string
): Promise<boolean> {
  const pool = new pg.Pool({
    connectionString,
    connectionTimeoutMillis: 3_000,
    max: 1,
  })

  try {
    const client = await pool.connect()
    await client.query("SELECT 1")
    client.release()
    return true
  } catch {
    return false
  } finally {
    await pool.end().catch(() => undefined)
  }
}

export async function waitForDatabase(
  connectionString: string,
  timeoutMs: number
): Promise<void> {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    if (await canQueryDatabase(connectionString)) {
      return
    }

    await sleep(1_500)
  }

  throw new Error(`等待数据库就绪超时（${timeoutMs / 1000}s）`)
}

export async function startPrismaDevDetached(): Promise<string | null> {
  const { stdout, exitCode } = await runCapture("npx", [
    "prisma",
    "dev",
    "-d",
    "-n",
    PRISMA_DEV_NAME,
  ])

  if (exitCode !== 0) {
    return null
  }

  return parseTcpDatabaseUrl(stdout) ?? (await readPrismaDevTcpUrl())
}

/** 停止后重新启动，保留 Prisma Dev 本地数据 */
export async function restartPrismaDevPreserveData(): Promise<string> {
  console.log("▶ 重启 Prisma Dev（保留数据：stop → start）…")

  await run("npx", ["prisma", "dev", "stop", PRISMA_DEV_NAME])
  await sleep(3_000)

  console.log("▶ 启动 Prisma Dev…")
  const { stdout, exitCode } = await runCapture("npx", [
    "prisma",
    "dev",
    "start",
    PRISMA_DEV_NAME,
  ])

  if (exitCode !== 0) {
    throw new Error("Prisma Dev 启动失败")
  }

  let databaseUrl =
    parseTcpDatabaseUrl(stdout) ?? (await readPrismaDevTcpUrl())

  for (let attempt = 0; attempt < 8 && !databaseUrl; attempt += 1) {
    await sleep(2_000)
    databaseUrl = await readPrismaDevTcpUrl()
  }

  if (!databaseUrl) {
    throw new Error("无法获取 Prisma Dev 连接地址")
  }

  await waitForDatabase(databaseUrl, DB_WAIT_MS)
  return databaseUrl
}

export function warnIfEnvPortMismatch(envUrl: string, activeUrl: string): void {
  if (envUrl === activeUrl) {
    return
  }

  const envPort = envUrl.match(/localhost:(\d+)/)?.[1]
  const activePort = activeUrl.match(/localhost:(\d+)/)?.[1]

  console.log("")
  console.log("⚠️  .env 中的 DATABASE_URL 端口与 Prisma Dev 实际端口不一致：")
  console.log(`    .env 端口: ${envPort ?? "未知"}`)
  console.log(`    实际端口: ${activePort ?? "未知"}`)
  console.log(`    请将 .env 更新为：`)
  console.log(`    DATABASE_URL="${activeUrl}"`)
  console.log("")
}

export async function ensurePrismaDevReady(envUrl: string): Promise<string> {
  if (await canQueryDatabase(envUrl)) {
    console.log("✓ 数据库连接正常")
    return envUrl
  }

  console.log("ℹ️  .env 配置的数据库暂不可连接，检查 Prisma Dev…")
  const listedUrl = await readPrismaDevTcpUrl()

  if (listedUrl && (await canQueryDatabase(listedUrl))) {
    console.log("✓ 已使用 Prisma Dev 当前实例")
    warnIfEnvPortMismatch(envUrl, listedUrl)
    return listedUrl
  }

  if (listedUrl) {
    console.log(
      "ℹ️  Prisma Dev 显示为运行中但无法连接，尝试重启（不会删除已有数据）…"
    )
  } else {
    console.log("ℹ️  未检测到 Prisma Dev 实例，正在创建…")
    const createdUrl = await startPrismaDevDetached()
    if (!createdUrl) {
      throw new Error("Prisma Dev 创建失败")
    }
    await waitForDatabase(createdUrl, DB_WAIT_MS)
    console.log("✓ 数据库已就绪")
    warnIfEnvPortMismatch(envUrl, createdUrl)
    return createdUrl
  }

  const recoveredUrl = await restartPrismaDevPreserveData()
  console.log("✓ 数据库已恢复（数据已保留）")
  warnIfEnvPortMismatch(envUrl, recoveredUrl)
  return recoveredUrl
}

export function printRecoveryHelp(): void {
  console.log("")
  console.log("若仍无法连接，可手动尝试（保留数据）：")
  console.log("  npx prisma dev stop default")
  console.log("  npx prisma dev start default")
  console.log("")
  console.log("仅在确认可以清空本地测试数据时，才执行：")
  console.log("  npm run db:reset")
  console.log("（会提示输入 i will lose local data）")
  console.log("")
}
