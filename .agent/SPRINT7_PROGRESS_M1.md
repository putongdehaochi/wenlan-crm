# Sprint 7 Progress Report — M1（Repository）

> **里程碑**：M1 — Repository  
> **日期**：2026-07-01  
> **状态**：✅ 完成，待 Tech Lead Review  
> **前置**：Sprint 7 Design Rev 2 FINAL APPROVAL（S7-DESIGN-001）

---

## 1. 交付内容

| 项 | 说明 |
|----|------|
| Prisma Schema | `voidedAt` · `LifecycleEventType` · `AttendanceLifecycleEvent` |
| Migration | `20260701120000_sprint7_attendance_audit`（含 CHECK_IN / VOID backfill） |
| `attendanceLifecycleRepository` | `appendLifecycleEvent` · `findByAttendanceId` · `findByAttendanceIds` |
| `attendanceStatisticsRepository` | `count*` · `groupValidAttendanceByStudent`（Aggregate-only） |
| `attendanceRepository` 扩展 | `findAuditList` · `create`/`void`/`restore` 事务内写 Lifecycle |
| Types | `FindAuditInput` · `FindStatisticsInput` · `AppendLifecycleEventInput` · `AttendanceLifecycleEventEntity` · `StudentAggregateRow` · `AttendanceEntity.voidedAt` |
| 自测 | `test:m1-attendance-audit` · `test:m1-attendance-statistics` |

---

## 2. Repository Contract Summary

### 2.1 `attendanceLifecycleRepository`（RC1 冻结）

| 方法 | 职责 |
|------|------|
| `appendLifecycleEvent(input, tx?)` | INSERT lifecycle event；`tx` 可选（同事务） |
| `findByAttendanceId(id)` | 按 attendanceId 查询（**无排序**） |
| `findByAttendanceIds(ids)` | 批量查询（**无排序**） |

**禁止**：Timeline 排序 · Label 转换 · Event 聚合 → M2 Mapper

### 2.2 `attendanceStatisticsRepository`（RC2 冻结）

| 方法 | 说明 |
|------|------|
| `countTotalAttendance` | COUNT attendances |
| `countValidAttendance` | COUNT status=VALID |
| `countVoidedAttendance` | COUNT status=VOIDED |
| `countLifecycleEvents(type)` | COUNT lifecycle by eventType |
| `groupValidAttendanceByStudent` | GROUP BY studentId（VALID only） |

**禁止**：Student Mapping · Balance Calculation · ViewModel · Service Logic · `studentService`

### 2.3 `attendanceRepository` 扩展

| 方法 | Sprint 7 变更 |
|------|---------------|
| `findAuditList(input)` | 新增；支持 `status` · 日期区间 · `limit` |
| `create` | 同事务 append `CHECK_IN` |
| `void` | SET `voidedAt` + append `VOID` |
| `restore` | CLEAR `voidedAt` + append `RESTORE` |

### 2.4 事务顺序（RC5 冻结）

```
BEGIN
  Attendance INSERT / UPDATE
  Lifecycle INSERT
COMMIT
```

---

## 3. Repository Responsibility Audit

| ✔ 负责 | ✘ 绝不（源码审计通过） |
|--------|------------------------|
| CRUD / Query / Entity Mapping | `studentService` / `lessonBalanceRepository`（Statistics） |
| Lifecycle append（纯 INSERT） | Timeline 排序 / Label |
| Statistics COUNT / GROUP BY | ViewModel / 余额计算 |
| `findAuditList` 读路径 | Service 层调用 |

---

## 4. 验证

| 命令 | 结果 |
|------|------|
| `npm run test:m1-attendance-audit` | ✅ |
| `npm run test:m1-attendance-statistics` | ✅ |
| `npm run test:m1-attendance-restore` | ✅ |
| `npm run test:m1-attendance-history` | ✅ |
| `npm run test:m1-attendance` | ✅ |
| `npm run test:m1` | ✅ |
| `npm run test:m1-lesson` | ✅ |

---

## 5. 不变项

| 模块 | 状态 |
|------|------|
| `lesson-balance.repository` | 零改动 |
| `student.service` / `lesson.service` | 零改动 |
| `existsToday` / `getTodayStatuses` / `findHistory` | 语义不变 |
| Sprint 2～6 Action 签名 | 未触及 |

---

## 6. 已知项（M2 范围）

- `attendance-history.mapper.ts` — `voidedAt` 仍映射为 `null`（M2 激活真实值）
- Timeline 排序 / Label — M2 Mapper
- Statistics Service + 姓名 enrichment — M2（`studentRepository.findByIds`）

---

## 7. 测试维护

- `m1-attendance-repository.test.mts`：`getTodayStatuses` batch 断言置于 unique constraint 测试之前；unique 使用 `prisma.attendance.create` 直接验证 DB 约束，避免失败事务污染 Prisma Dev 连接池

---

## 8. 未做（M2）

- `attendance-statistics.service.ts`
- `attendance-audit.mapper.ts`（Timeline 纯函数）
- Validators / Actions / UI
- `/attendance/audit` · `/attendance/statistics` 路由

---

## 9. 下一步

提交本报告 → Tech Lead Review M1 → 通过后 **M2（Service / Actions / Mapper）**

---

**M1 编码已停止，等待 Tech Lead Review。**
