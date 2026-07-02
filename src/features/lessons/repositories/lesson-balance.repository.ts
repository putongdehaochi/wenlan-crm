/**
 * @file lesson-balance.repository.ts
 * @feature lessons
 * @purpose 课时余额聚合；公式唯一实现点（ADR-007、ADR-009）
 *
 * 所有余额演进仅修改 computeBalances 内部。
 */

import { prisma } from "@/shared/lib/db"

/**
 * 单一聚合入口。
 * balance = SUM(LessonPackage.quantity) − COUNT(Attendance WHERE status = VALID)
 */
async function computeBalances(
  studentIds: string[]
): Promise<Map<string, number>> {
  const [purchasedRows, attendanceRows] = await Promise.all([
    prisma.lessonPackage.groupBy({
      by: ["studentId"],
      where: { studentId: { in: studentIds } },
      _sum: { quantity: true },
    }),
    prisma.attendance.groupBy({
      by: ["studentId"],
      where: { studentId: { in: studentIds }, status: "VALID" },
      _count: { _all: true },
    }),
  ])

  const purchasedMap = new Map<string, number>()
  for (const row of purchasedRows) {
    purchasedMap.set(row.studentId, row._sum.quantity ?? 0)
  }

  const attendanceMap = new Map<string, number>()
  for (const row of attendanceRows) {
    attendanceMap.set(row.studentId, row._count._all)
  }

  const balanceMap = new Map<string, number>()
  for (const id of studentIds) {
    const purchased = purchasedMap.get(id) ?? 0
    const attended = attendanceMap.get(id) ?? 0
    balanceMap.set(id, purchased - attended)
  }

  return balanceMap
}

export async function getBalances(
  studentIds: string[]
): Promise<Map<string, number>> {
  if (studentIds.length === 0) {
    return new Map()
  }

  return computeBalances(studentIds)
}

export async function getBalance(studentId: string): Promise<number> {
  const balanceMap = await getBalances([studentId])
  return balanceMap.get(studentId) ?? 0
}

export async function getLessonSummary(studentId: string): Promise<{
  totalPurchased: number
  totalConsumed: number
  balance: number
}> {
  const [purchasedRow, totalConsumed] = await Promise.all([
    prisma.lessonPackage.aggregate({
      where: { studentId },
      _sum: { quantity: true },
    }),
    prisma.attendance.count({
      where: { studentId, status: "VALID" },
    }),
  ])

  const totalPurchased = purchasedRow._sum.quantity ?? 0
  return {
    totalPurchased,
    totalConsumed,
    balance: totalPurchased - totalConsumed,
  }
}

export async function getStudioLessonSummary(): Promise<{
  totalRecorded: number
  totalConsumed: number
  totalBalance: number
}> {
  const [recordedRow, consumed] = await Promise.all([
    prisma.lessonPackage.aggregate({
      _sum: { quantity: true },
    }),
    prisma.attendance.count({
      where: { status: "VALID" },
    }),
  ])

  const totalRecorded = recordedRow._sum.quantity ?? 0
  return {
    totalRecorded,
    totalConsumed: consumed,
    totalBalance: totalRecorded - consumed,
  }
}

export async function getStudioStudentMetricMaps(
  studentIds: string[]
): Promise<{
  recordedMap: Map<string, number>
  consumedMap: Map<string, number>
}> {
  if (studentIds.length === 0) {
    return { recordedMap: new Map(), consumedMap: new Map() }
  }

  const [recordedRows, consumedRows] = await Promise.all([
    prisma.lessonPackage.groupBy({
      by: ["studentId"],
      where: { studentId: { in: studentIds } },
      _sum: { quantity: true },
    }),
    prisma.attendance.groupBy({
      by: ["studentId"],
      where: { studentId: { in: studentIds }, status: "VALID" },
      _count: { _all: true },
    }),
  ])

  const recordedMap = new Map<string, number>()
  for (const row of recordedRows) {
    recordedMap.set(row.studentId, row._sum.quantity ?? 0)
  }

  const consumedMap = new Map<string, number>()
  for (const row of consumedRows) {
    consumedMap.set(row.studentId, row._count._all)
  }

  return { recordedMap, consumedMap }
}

export const lessonBalanceRepository = {
  getBalance,
  getBalances,
  getLessonSummary,
  getStudioLessonSummary,
  getStudioStudentMetricMaps,
}
