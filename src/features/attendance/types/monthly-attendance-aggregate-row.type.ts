/**
 * @file monthly-attendance-aggregate-row.type.ts
 * @feature attendance
 * @purpose Statistics Repository 按月稀疏聚合行；非 ViewModel
 */

export type MonthlyAttendanceAggregateRow = {
  month: string
  validAttendanceCount: number
}
