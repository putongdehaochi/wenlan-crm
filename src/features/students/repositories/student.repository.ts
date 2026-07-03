/**
 * @file student.repository.ts
 * @feature students
 * @purpose Student 数据访问层；仅返回 StudentEntity，不含业务规则与 ViewModel
 */

import type { Student } from "@/generated/prisma/client"
import type {
  CreateStudentEntityInput,
  StudentEntity,
} from "@/features/students/types/student-entity.type"
import { prisma } from "@/shared/lib/db"

function toStudentEntity(row: Student): StudentEntity {
  return {
    id: row.id,
    name: row.name,
    contactName: row.contactName,
    phone: row.phone,
    note: row.note,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function findActiveByIds(ids: string[]): Promise<StudentEntity[]> {
  if (ids.length === 0) {
    return []
  }

  const rows = await prisma.student.findMany({
    where: { id: { in: ids }, status: "ACTIVE" },
  })

  const entityMap = new Map(rows.map((row) => [row.id, toStudentEntity(row)]))
  return ids
    .map((id) => entityMap.get(id))
    .filter((entity): entity is StudentEntity => entity !== undefined)
}

export async function findAllActive(): Promise<StudentEntity[]> {
  const rows = await prisma.student.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  })

  return rows.map(toStudentEntity)
}

export async function findById(studentId: string): Promise<StudentEntity | null> {
  const row = await prisma.student.findUnique({
    where: { id: studentId },
  })

  return row ? toStudentEntity(row) : null
}

export async function findByIds(ids: string[]): Promise<StudentEntity[]> {
  if (ids.length === 0) {
    return []
  }

  const rows = await prisma.student.findMany({
    where: { id: { in: ids } },
  })

  return rows.map(toStudentEntity)
}

export async function existsByNameAndContact(
  name: string,
  contactName: string
): Promise<boolean> {
  const row = await prisma.student.findFirst({
    where: { name, contactName },
    select: { id: true },
  })

  return row !== null
}

export async function create(
  input: CreateStudentEntityInput
): Promise<StudentEntity> {
  const row = await prisma.student.create({
    data: {
      name: input.name,
      contactName: input.contactName,
      phone: input.phone,
      note: input.note,
      status: "ACTIVE",
    },
  })

  return toStudentEntity(row)
}

/** Repository 门面，便于 Service 注入与测试 */
export const studentRepository = {
  findAllActive,
  findActiveByIds,
  findById,
  findByIds,
  existsByNameAndContact,
  create,
}
