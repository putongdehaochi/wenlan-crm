/**
 * 导出本地 Prisma Dev 数据到 prisma/data/export.json
 * 用法：npm run db:export
 */

import "dotenv/config"
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"

import { prisma } from "../src/shared/lib/db"

async function main(): Promise<void> {
  const [students, lessonPackages, attendances, lifecycleEvents] =
    await Promise.all([
      prisma.student.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.lessonPackage.findMany({ orderBy: { purchasedAt: "asc" } }),
      prisma.attendance.findMany({ orderBy: { attendanceDate: "asc" } }),
      prisma.attendanceLifecycleEvent.findMany({
        orderBy: { occurredAt: "asc" },
      }),
    ])

  const payload = {
    exportedAt: new Date().toISOString(),
    students,
    lessonPackages,
    attendances,
    lifecycleEvents,
  }

  const dir = join(process.cwd(), "prisma", "data")
  await mkdir(dir, { recursive: true })
  const filePath = join(dir, "export.json")
  await writeFile(filePath, JSON.stringify(payload, null, 2), "utf8")

  console.log(`✓ 已导出到 ${filePath}`)
  console.log(
    `  学员 ${students.length} · 课时 ${lessonPackages.length} · 签到 ${attendances.length} · 事件 ${lifecycleEvents.length}`
  )
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
