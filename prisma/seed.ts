/**
 * 数据初始化（仅手动执行，生产构建不会自动跑）
 *
 * 用法：
 *   npm run db:seed
 *   SEED_DATABASE=1 npx tsx prisma/seed.ts
 *
 * - 若存在 prisma/data/export.json：导入本地导出
 * - 否则补充演示 mock 学员
 * - 数据库已有学员时跳过
 */

import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { Prisma, PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

type ExportPayload = {
  students: Array<{
    id: string
    name: string
    contactName: string
    phone: string | null
    note: string | null
    status: "ACTIVE" | "ARCHIVED"
    createdAt: string | Date
    updatedAt: string | Date
  }>
  lessonPackages: Array<{
    id: string
    studentId: string
    quantity: number
    note: string | null
    purchasedAt: string | Date
    createdAt: string | Date
  }>
  attendances: Array<{
    id: string
    studentId: string
    attendanceDate: string | Date
    status: "VALID" | "VOIDED"
    voidedAt: string | Date | null
    createdAt: string | Date
  }>
  lifecycleEvents: Array<{
    id: string
    attendanceId: string
    studentId: string
    eventType: "CHECK_IN" | "VOID" | "RESTORE"
    occurredAt: string | Date
    operatorId: string | null
    metadata: unknown
    createdAt: string | Date
  }>
}

import { resolveRuntimeDatabaseUrl } from "../scripts/lib/database-url"

function createPrisma(): PrismaClient {
  const connectionString = resolveRuntimeDatabaseUrl()
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set")
  }

  const pool = new pg.Pool({
    connectionString,
    max: 3,
    connectionTimeoutMillis: 0,
    idleTimeoutMillis: 1_000,
  })
  return new PrismaClient({ adapter: new PrismaPg(pool) })
}

function toJsonMetadata(
  value: unknown
): Prisma.InputJsonValue | undefined {
  if (value === null || value === undefined) {
    return undefined
  }
  return value as Prisma.InputJsonValue
}

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value)
}

async function loadExport(): Promise<ExportPayload | null> {
  const filePath = join(process.cwd(), "prisma", "data", "export.json")
  try {
    const raw = await readFile(filePath, "utf8")
    return JSON.parse(raw) as ExportPayload
  } catch {
    return null
  }
}

async function ensureDefaultTeacher(prisma: PrismaClient): Promise<string> {
  const existing = await prisma.teacher.findFirst({
    where: { isDefault: true },
    orderBy: { createdAt: "asc" },
  })

  if (existing) {
    return existing.id
  }

  const created = await prisma.teacher.create({
    data: {
      id: "default-teacher",
      name: "默认老师",
      isDefault: true,
    },
  })

  return created.id
}

async function importExport(
  prisma: PrismaClient,
  payload: ExportPayload
): Promise<void> {
  if (payload.students.length === 0) {
    return
  }

  console.log("▶ 导入本地导出数据…")
  const defaultTeacherId = await ensureDefaultTeacher(prisma)

  await prisma.student.createMany({
    data: payload.students.map((row) => ({
      id: row.id,
      name: row.name,
      contactName: row.contactName,
      phone: row.phone,
      note: row.note,
      status: row.status,
      createdAt: toDate(row.createdAt),
      updatedAt: toDate(row.updatedAt),
    })),
    skipDuplicates: true,
  })

  if (payload.lessonPackages.length > 0) {
    await prisma.lessonPackage.createMany({
      data: payload.lessonPackages.map((row) => ({
        id: row.id,
        studentId: row.studentId,
        quantity: row.quantity,
        note: row.note,
        purchasedAt: toDate(row.purchasedAt),
        createdAt: toDate(row.createdAt),
      })),
      skipDuplicates: true,
    })
  }

  if (payload.attendances.length > 0) {
    await prisma.attendance.createMany({
      data: payload.attendances.map((row) => ({
        id: row.id,
        studentId: row.studentId,
        teacherId: defaultTeacherId,
        attendanceDate: toDate(row.attendanceDate),
        status: row.status,
        voidedAt: row.voidedAt ? toDate(row.voidedAt) : null,
        createdAt: toDate(row.createdAt),
      })),
      skipDuplicates: true,
    })
  }

  if (payload.lifecycleEvents.length > 0) {
    await prisma.attendanceLifecycleEvent.createMany({
      data: payload.lifecycleEvents.map((row) => ({
        id: row.id,
        attendanceId: row.attendanceId,
        studentId: row.studentId,
        eventType: row.eventType,
        occurredAt: toDate(row.occurredAt),
        operatorId: row.operatorId,
        metadata: toJsonMetadata(row.metadata),
        createdAt: toDate(row.createdAt),
      })),
      skipDuplicates: true,
    })
  }

  console.log(
    `✓ 已导入 ${payload.students.length} 名学员及相关记录`
  )
}

async function seedMockData(prisma: PrismaClient): Promise<void> {
  const existingNames = new Set(
    (await prisma.student.findMany({ select: { name: true } })).map(
      (row) => row.name
    )
  )

  const mockStudents = [
    {
      name: "林墨轩",
      contactName: "林妈妈",
      phone: "13800010001",
      note: "楷书进阶班",
      packages: [{ quantity: 24, note: "春季购课" }],
      attendanceDates: ["2026-03-01", "2026-03-08", "2026-03-15", "2026-03-22"],
    },
    {
      name: "周若溪",
      contactName: "周爸爸",
      phone: "13800010002",
      note: "硬笔基础",
      packages: [{ quantity: 16, note: "体验课转正" }],
      attendanceDates: ["2026-04-05", "2026-04-12", "2026-04-19"],
    },
    {
      name: "陈予安",
      contactName: "陈奶奶",
      phone: "13800010003",
      note: null,
      packages: [
        { quantity: 20, note: "暑期套餐" },
        { quantity: -2, note: "【调整】请假补回" },
      ],
      attendanceDates: ["2026-05-03", "2026-05-10"],
    },
  ].filter((student) => !existingNames.has(student.name))

  if (mockStudents.length === 0) {
    console.log("ℹ️  mock 学员已存在，跳过补充")
    return
  }

  console.log(`▶ 补充 ${mockStudents.length} 名演示学员…`)
  const defaultTeacherId = await ensureDefaultTeacher(prisma)

  for (const mock of mockStudents) {
    const student = await prisma.student.create({
      data: {
        name: mock.name,
        contactName: mock.contactName,
        phone: mock.phone,
        note: mock.note,
      },
    })

    for (const pkg of mock.packages) {
      await prisma.lessonPackage.create({
        data: {
          studentId: student.id,
          quantity: pkg.quantity,
          note: pkg.note,
        },
      })
    }

    for (const dateLabel of mock.attendanceDates) {
      const attendanceDate = new Date(`${dateLabel}T00:00:00.000Z`)
      const attendance = await prisma.attendance.create({
        data: {
          studentId: student.id,
          teacherId: defaultTeacherId,
          attendanceDate,
        },
      })

      await prisma.attendanceLifecycleEvent.create({
        data: {
          attendanceId: attendance.id,
          studentId: student.id,
          eventType: "CHECK_IN",
          occurredAt: attendance.createdAt,
          operatorId: defaultTeacherId,
        },
      })
    }
  }

  console.log("✓ 演示数据已写入")
}

async function main(): Promise<void> {
  const prisma = createPrisma()
  const exportData = await loadExport()

  try {
    const studentCount = await prisma.student.count()
    if (studentCount > 0) {
      console.log(`ℹ️  数据库已有 ${studentCount} 名学员，跳过 seed`)
      return
    }

    if (exportData) {
      await importExport(prisma, exportData)
    }

    await seedMockData(prisma)
    console.log("✓ seed 完成")
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
