/**
 * @file student-group-entity.type.ts
 * @feature student-groups
 */

export type StudentGroupType = "SAVED"

export type StudentGroupEntity = {
  id: string
  name: string
  type: StudentGroupType
  createdAt: Date
  updatedAt: Date
}

export type CreateStudentGroupEntityInput = {
  name: string
  studentIds: string[]
}

export type UpdateStudentGroupEntityInput = {
  name?: string
  studentIds?: string[]
}
