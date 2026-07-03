/**
 * @file student-group.repository.ts
 * @feature student-groups
 */

import type { StudentGroup } from "@/generated/prisma/client"
import type {
  CreateStudentGroupEntityInput,
  StudentGroupEntity,
  UpdateStudentGroupEntityInput,
} from "@/features/student-groups/types/student-group-entity.type"
import { prisma } from "@/shared/lib/db"

function toStudentGroupEntity(row: StudentGroup): StudentGroupEntity {
  return {
    id: row.id,
    name: row.name,
    type: "SAVED",
    teacherId: row.teacherId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function findAllSaved(): Promise<StudentGroupEntity[]> {
  const rows = await prisma.studentGroup.findMany({
    where: { type: "SAVED" },
    orderBy: { createdAt: "desc" },
  })

  return rows.map(toStudentGroupEntity)
}

export async function findById(id: string): Promise<StudentGroupEntity | null> {
  const row = await prisma.studentGroup.findUnique({
    where: { id },
  })

  return row ? toStudentGroupEntity(row) : null
}

export async function findMemberStudentIds(groupId: string): Promise<string[]> {
  const rows = await prisma.studentGroupMember.findMany({
    where: { groupId },
    select: { studentId: true },
    orderBy: { createdAt: "asc" },
  })

  return rows.map((row) => row.studentId)
}

export async function findMemberStudentIdsMap(
  groupIds: string[]
): Promise<Map<string, string[]>> {
  if (groupIds.length === 0) {
    return new Map()
  }

  const rows = await prisma.studentGroupMember.findMany({
    where: { groupId: { in: groupIds } },
    select: { groupId: true, studentId: true },
    orderBy: { createdAt: "asc" },
  })

  const map = new Map<string, string[]>()
  for (const row of rows) {
    const list = map.get(row.groupId) ?? []
    list.push(row.studentId)
    map.set(row.groupId, list)
  }

  return map
}

export async function create(
  input: CreateStudentGroupEntityInput
): Promise<StudentGroupEntity> {
  return prisma.$transaction(async (tx) => {
    const group = await tx.studentGroup.create({
      data: {
        name: input.name,
        type: "SAVED",
        teacherId: input.teacherId ?? null,
      },
    })

    if (input.studentIds.length > 0) {
      await tx.studentGroupMember.createMany({
        data: input.studentIds.map((studentId) => ({
          groupId: group.id,
          studentId,
        })),
      })
    }

    return toStudentGroupEntity(group)
  })
}

export async function update(
  id: string,
  input: UpdateStudentGroupEntityInput
): Promise<StudentGroupEntity> {
  return prisma.$transaction(async (tx) => {
    const group = await tx.studentGroup.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.teacherId !== undefined
          ? { teacherId: input.teacherId }
          : {}),
      },
    })

    if (input.studentIds !== undefined) {
      await tx.studentGroupMember.deleteMany({ where: { groupId: id } })
      if (input.studentIds.length > 0) {
        await tx.studentGroupMember.createMany({
          data: input.studentIds.map((studentId) => ({
            groupId: id,
            studentId,
          })),
        })
      }
    }

    return toStudentGroupEntity(group)
  })
}

export async function remove(id: string): Promise<void> {
  await prisma.studentGroup.delete({ where: { id } })
}

export const studentGroupRepository = {
  findAllSaved,
  findById,
  findMemberStudentIds,
  findMemberStudentIdsMap,
  create,
  update,
  remove,
}
