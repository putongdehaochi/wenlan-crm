/**
 * @file teacher.repository.ts
 * @feature teachers
 */

import type { Teacher } from "@/generated/prisma/client"
import type { TeacherEntity } from "@/features/teachers/types/teacher-entity.type"
import { prisma } from "@/shared/lib/db"

const FALLBACK_DEFAULT_TEACHER_ID = "default-teacher"
const FALLBACK_DEFAULT_TEACHER_NAME = "默认老师"

function toTeacherEntity(row: Teacher): TeacherEntity {
  return {
    id: row.id,
    name: row.name,
    isDefault: row.isDefault,
    createdAt: row.createdAt,
  }
}

export async function findAll(): Promise<TeacherEntity[]> {
  const rows = await prisma.teacher.findMany({
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  })

  return rows.map(toTeacherEntity)
}

export async function findById(id: string): Promise<TeacherEntity | null> {
  const row = await prisma.teacher.findUnique({ where: { id } })
  return row ? toTeacherEntity(row) : null
}

export async function findByIds(ids: string[]): Promise<TeacherEntity[]> {
  if (ids.length === 0) {
    return []
  }

  const rows = await prisma.teacher.findMany({
    where: { id: { in: ids } },
  })

  return rows.map(toTeacherEntity)
}

export async function findDefault(): Promise<TeacherEntity> {
  const row = await prisma.teacher.findFirst({
    where: { isDefault: true },
    orderBy: { createdAt: "asc" },
  })

  if (row) {
    return toTeacherEntity(row)
  }

  const fallback = await prisma.teacher.findFirst({
    orderBy: { createdAt: "asc" },
  })

  if (fallback) {
    return toTeacherEntity(fallback)
  }

  const created = await prisma.teacher.create({
    data: {
      id: FALLBACK_DEFAULT_TEACHER_ID,
      name: FALLBACK_DEFAULT_TEACHER_NAME,
      isDefault: true,
    },
  })

  return toTeacherEntity(created)
}

export async function create(name: string): Promise<TeacherEntity> {
  const row = await prisma.teacher.create({
    data: { name },
  })

  return toTeacherEntity(row)
}

export async function update(id: string, name: string): Promise<TeacherEntity> {
  const row = await prisma.teacher.update({
    where: { id },
    data: { name },
  })

  return toTeacherEntity(row)
}

export async function setDefault(id: string): Promise<TeacherEntity> {
  return prisma.$transaction(async (tx) => {
    await tx.teacher.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    })

    const row = await tx.teacher.update({
      where: { id },
      data: { isDefault: true },
    })

    return toTeacherEntity(row)
  })
}

export async function countAttendances(id: string): Promise<number> {
  return prisma.attendance.count({ where: { teacherId: id } })
}

export async function remove(id: string): Promise<void> {
  await prisma.teacher.delete({ where: { id } })
}

export const teacherRepository = {
  findAll,
  findById,
  findByIds,
  findDefault,
  create,
  update,
  setDefault,
  countAttendances,
  remove,
}
