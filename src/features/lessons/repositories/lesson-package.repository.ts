/**
 * @file lesson-package.repository.ts
 * @feature lessons
 * @purpose LessonPackage CRUD；仅返回 Entity，不计算余额（ADR-007）
 */

import type { LessonPackage } from "@/generated/prisma/client"
import type { FindLessonRecordsInput } from "@/features/lessons/types/lesson-record-list-row.type"
import type {
  CreateLessonPackageEntityInput,
  LessonPackageEntity,
} from "@/features/lessons/types/lesson-package-entity.type"
import { prisma } from "@/shared/lib/db"

const ADJUSTMENT_NOTE_PREFIX = "【调整】"

function toLessonPackageEntity(row: LessonPackage): LessonPackageEntity {
  return {
    id: row.id,
    studentId: row.studentId,
    quantity: row.quantity,
    note: row.note,
    purchasedAt: row.purchasedAt,
    createdAt: row.createdAt,
  }
}

export async function create(
  input: CreateLessonPackageEntityInput
): Promise<LessonPackageEntity> {
  const row = await prisma.lessonPackage.create({
    data: {
      studentId: input.studentId,
      quantity: input.quantity,
      note: input.note,
    },
  })

  return toLessonPackageEntity(row)
}

export async function findByStudentId(
  studentId: string
): Promise<LessonPackageEntity[]> {
  const rows = await prisma.lessonPackage.findMany({
    where: { studentId },
    orderBy: { purchasedAt: "desc" },
  })

  return rows.map(toLessonPackageEntity)
}

function buildFindAllWhere(
  filter: FindLessonRecordsInput = {}
): NonNullable<Parameters<typeof prisma.lessonPackage.findMany>[0]>["where"] {
  const where: NonNullable<Parameters<typeof prisma.lessonPackage.findMany>[0]>["where"] = {}

  if (filter.studentId) {
    where.studentId = filter.studentId
  }

  if (filter.recordType === "adjustment") {
    where.note = { startsWith: ADJUSTMENT_NOTE_PREFIX }
  }

  if (filter.recordType === "purchase") {
    where.OR = [{ note: null }, { NOT: { note: { startsWith: ADJUSTMENT_NOTE_PREFIX } } }]
  }

  return where
}

export async function findAll(
  filter: FindLessonRecordsInput = {}
): Promise<LessonPackageEntity[]> {
  const rows = await prisma.lessonPackage.findMany({
    where: buildFindAllWhere(filter),
    orderBy: { purchasedAt: "desc" },
    take: filter.limit ?? 200,
  })

  return rows.map(toLessonPackageEntity)
}

export async function countByRecordType(): Promise<{
  purchaseCount: number
  adjustmentCount: number
}> {
  const [purchaseCount, adjustmentCount] = await Promise.all([
    prisma.lessonPackage.count({
      where: buildFindAllWhere({ recordType: "purchase" }),
    }),
    prisma.lessonPackage.count({
      where: buildFindAllWhere({ recordType: "adjustment" }),
    }),
  ])

  return { purchaseCount, adjustmentCount }
}

export const lessonPackageRepository = {
  create,
  findByStudentId,
  findAll,
  countByRecordType,
}
