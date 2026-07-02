# Attendance Restore & History Filter Implementation Plan — Sprint 6

> **状态：Plan Rev 2 — Tech Lead FINAL APPROVAL**
>
> 依据：`specs/attendance-restore.md` Rev 2 · ADR-012 Rev 2
>
> 本文档不含任何源码。

---

## 1. Module Overview

| 项 | 内容 |
|----|------|
| Sprint | Sprint 6 |
| Spec | `specs/attendance-restore.md` Rev 2 |
| 能力 | Restore + History Date Filter |

### 1.1 冻结

| 项 | 说明 |
|----|------|
| `restoreAttendance` 调用链 | §4.2 — Sprint 6 起冻结 |
| `voidAttendance` 链 | ADR-011 不变 |
| `student.service` / `lesson.service` | 零改动 |
| `lesson-balance.repository` | 契约不变 |
| Repository `create/void/existsToday/getTodayStatuses` | 不变 |

---

## 2. Feature First Directory

```
src/features/attendance/
├── types/
│   ├── find-history-input.type.ts          [RC3 完整 Evolution]
│   ├── attendance-history-row.type.ts      [RC4 最终 ViewModel]
│   ├── restore-attendance-input.type.ts
│   └── restore-attendance-result.type.ts
├── repositories/attendance.repository.ts   [+restore — RC2]
├── services/attendance.service.ts
├── validators/
├── mappers/attendance-history.mapper.ts
├── actions/restore-attendance.action.ts
└── components/                             [History UI 扩展]
```

> 无 `prisma/` 变更

---

## 3. Repository Contract

### 3.1 `restore()` — RC2 冻结

```text
restore(id: string): Promise<AttendanceEntity>
```

| 字段 | restore() 是否变更 | 说明 |
|------|-------------------|------|
| `status` | ✅ `VOIDED → VALID` | 唯一业务写入 |
| `id` | ❌ | |
| `studentId` | ❌ | |
| `attendanceDate` | ❌ | |
| `createdAt` | ❌ | 保留原 `checkedInAt` |
| `voidedAt` | — | Sprint 6 无 DB 列；Sprint 7+ Restore 时 **SET NULL**（ADR-012） |
| `updatedAt` | — | Sprint 6 Schema 无此列 |

SQL（Sprint 6）：`UPDATE attendances SET status = 'VALID' WHERE id = ?`

Repository **不做**：余额判断 · ALREADY_VALID · DELETE

### 3.2 `findHistory()` — RC3 完整 Evolution

```typescript
type FindHistoryInput = {
  studentId?: string
  dateFrom?: Date | string
  dateTo?: Date | string
  status?: AttendanceStatus      // Reserved — Sprint 6 不实现
  teacherId?: string             // Reserved
  classId?: string               // Reserved
  cursor?: string                // Reserved
  limit?: number
}
```

| 字段 | Sprint 6 |
|------|----------|
| `studentId` | ✅ 实现 |
| `dateFrom` / `dateTo` | ✅ 实现 |
| `limit` | ✅ 实现 |
| `status` / `teacherId` / `classId` / `cursor` | **Reserved**（类型存在，Validator/Repository 忽略） |

**时区**：`dateFrom`/`dateTo` 经 `toAttendanceDate` 归一化为**服务器本地自然日**（与 Sprint 4/5 `attendanceDate` 一致）；禁止 UI 自行做 UTC 偏移。

### 3.3 完整 Repository 方法集

| 方法 | Sprint 6 变更 |
|------|---------------|
| `create()` | 无 |
| `findById()` | 无 |
| `findHistory()` | input 扩展 |
| `void()` | 无 |
| `restore()` | **新增** |
| `existsToday()` | 无 |
| `getTodayStatuses()` | 无 |

---

## 4. Service Flow

### 4.1 `listAttendanceHistory`（读 — 扩展）

```
Validator（dateFrom/dateTo + Reserved 字段忽略）
    ↓
studentRepository.findById（仅 studentId 有值）
    ↓
attendanceRepository.findHistory(input)
    ↓
studentRepository.findByIds
    ↓
Mapper → AttendanceHistoryRow[]（RC4）
    ↓
ActionResult
```

### 4.2 `restoreAttendance`（写 — RC5 冻结）

> **Sprint 6 起，此调用链冻结；后续 Sprint 不得调整顺序，仅允许在步骤内部扩展实现。**

```
restoreAttendanceAction
    ↓
attendanceService.restoreAttendance
    ↓
Validator
    ↓
attendanceRepository.findById()
    ↓
不存在 → ATTENDANCE_NOT_FOUND
    ↓
status === VALID → ALREADY_VALID
    ↓
lessonBalanceRepository.getBalance(studentId)
    ↓
currentBalance < 1 → INSUFFICIENT_BALANCE    // RC1: 等价 balance_after >= 0
    ↓
attendanceRepository.restore()
    ↓
lessonBalanceRepository.getBalance(studentId)
    ↓
Mapper → RestoreAttendanceResult
    ↓
ActionResult
```

#### RC1 余额检查说明

```text
Restore 消耗 1 课时 ⟺ COUNT(VALID) + 1
前置：currentBalance >= 1 ⟺ Restore 后余额不为负
```

### 4.3 Service 共存

Sprint 4 `listTodayAttendance` / `checkInStudent` · Sprint 5 `voidAttendance` — **无 diff**

---

## 5. Action Contract

| Action | 输入 | 输出 |
|--------|------|------|
| `listAttendanceHistoryAction` | `FindHistoryInput` | `AttendanceHistoryRow[]` |
| `restoreAttendanceAction` | `{ attendanceId }` | `RestoreAttendanceResult` |

**errorType 新增**：`ALREADY_VALID`

---

## 6. Mapper — AttendanceHistoryRow（RC4）

| 字段 | Mapper 规则 |
|------|-------------|
| `canVoid` | `status === VALID` |
| `canRestore` | `status === VOIDED` |
| `voidedAt` | Sprint 6 恒 `null` |
| `note` / `teacherName` / `className` | Sprint 6 恒 `undefined`（Reserved） |

---

## 7. UI Flow

Restore：Dialog → `restoreAttendanceAction` → 成功 → `listAttendanceHistoryAction` 全量刷新

History Filter：query `dateFrom`/`dateTo` → Action → 渲染

---

## 8. M1～M4 Milestones

| M1 | `restore()` + `findHistory` 日期 · `test:m1-attendance-restore` |
| M2 | Service/Action · `test:m2-attendance-restore` |
| M3 | UI · `npm run build` |
| M4 | Acceptance · `test:m4-attendance-restore` + 全量回归 + **Restore Regression Checklist**（Evidence） |

---

## 9. Risks

| 风险 | 缓解 |
|------|------|
| Restore 链改序 | RC5 冻结 + M2 Review |
| Filter 破坏兼容 | HF3 验收 |
| 日期时区歧义 | `toAttendanceDate` 统一 |
| Sprint 7 voidedAt 冲突 | RC2 写死 Restore → NULL |

---

## Rev 2 变更记录

| Rev | 日期 | 变更 |
|-----|------|------|
| Rev 1 | 2026-07-01 | 初始 Plan |
| Rev 2 | 2026-07-01 | RC1 余额数学 · RC2 restore 字段 · RC3 FindHistory Evolution · RC4 ViewModel · RC5 链 Freeze |

---

**Rev 2 — 2026-07-01 — 待 Tech Lead Final Approval**
