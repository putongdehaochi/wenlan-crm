/**
 * @file student-group-summary.type.ts
 * @feature student-groups
 */

export type StudentGroupSummary = {
  id: string
  name: string
  type: "SAVED"
  studentIds: string[]
  memberCount: number
  createdAt: string
}

/** 客户端 SESSION 分组（不持久化到数据库） */
export type SessionStudentGroup = {
  id: string
  name: string
  type: "SESSION"
  studentIds: string[]
  createdAt: string
}

export type StudentGroupView = StudentGroupSummary | SessionStudentGroup
