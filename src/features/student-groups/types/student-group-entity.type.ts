/**
 * @file student-group-entity.type.ts
 * @feature student-groups
 */

export type StudentGroupType = "SAVED"

export type StudentGroupEntity = {
  id: string
  name: string
  type: StudentGroupType
  teacherId: string | null
  createdAt: Date
  updatedAt: Date
}

export type CreateStudentGroupEntityInput = {
  name: string
  studentIds: string[]
  teacherId?: string | null
}

export type UpdateStudentGroupEntityInput = {
  name?: string
  studentIds?: string[]
  teacherId?: string | null
}
