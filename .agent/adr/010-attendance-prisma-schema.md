# ADR-010：Attendance Prisma Schema（M1 实现）

| 项 | 内容 |
|----|------|
| 状态 | 已采纳 |
| 日期 | 2026-06-29 |
| 决策者 | Sprint 4 M1 |
| 关联 | ADR-009 · `specs/attendance.md` |

## 决策

M1 落地 `attendances` 表与 `AttendanceStatus` 枚举：

| 列 / 枚举 | 说明 |
|-----------|------|
| `AttendanceStatus` | `VALID` · `VOIDED` |
| `id` | cuid |
| `student_id` | FK → students, ON DELETE RESTRICT |
| `attendance_date` | `@db.Date` |
| `status` | 默认 `VALID` |
| `created_at` | timestamp |

**索引与约束**

- `@@unique([studentId, attendanceDate])`
- `@@index([attendanceDate])`

Migration：`20260629160000_init_attendance`

## 原因

落实 ADR-009 业务规则；`VOIDED` 预留撤销签到，Sprint 4 仅写入 `VALID`。

## 影响

- `Student.attendances` relation
- `attendance.repository` CRUD / 今日状态查询
- `lesson-balance.repository` 聚合 COUNT(VALID)
