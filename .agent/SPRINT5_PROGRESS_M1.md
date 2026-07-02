# Sprint 5 Progress Report — M1（Schema / Repository）

> **里程碑**：M1 — Schema / Repository  
> **日期**：2026-07-01  
> **状态**：✅ 完成，待 Tech Lead Review  
> **前置**：Sprint 5 Design Rev 3 APPROVED

---

## 1. 交付内容

| 项 | 说明 |
|----|------|
| Prisma Schema | **无变更**（ADR-011 冻结） |
| Migration | **无** |
| `FindHistoryInput` | `src/features/attendance/types/find-history-input.type.ts` |
| `attendance.repository` | +`findById` · +`findHistory` · +`void` |
| `student.repository` | +`findByIds` |
| 自测 | `scripts/m1-attendance-history-repository.test.mts` — `npm run test:m1-attendance-history` |

---

## 2. Repository Contract Summary

### 2.1 `attendanceRepository`

| 方法 | Sprint | 类型 | 职责 |
|------|--------|------|------|
| `create()` | 4 | 写 | 插入 VALID 签到 |
| `findById()` | 5 | 读 | `id` → `AttendanceEntity \| null` |
| `findHistory()` | 5 | 读 | `FindHistoryInput` → `AttendanceEntity[]` |
| `void()` | 5 | 写 | `UPDATE status = VOIDED` |
| `existsToday()` | 4 | 读 | 单学员当日 VALID |
| `getTodayStatuses()` | 4 | 读 | 批量当日 VALID studentId |

`void` 实现函数名为 `voidRecord`（保留字规避），门面导出为 `void()`。

### 2.2 `findHistory` 行为（冻结）

```typescript
type FindHistoryInput = { studentId?: string; limit?: number }
```

| 参数 | 行为 |
|------|------|
| `studentId` | 有值 → 按学员过滤；无值 → 全部 |
| `limit` | 有值 → `take`；无值 → 全量 |
| 排序 | `attendanceDate desc`, `createdAt desc` |

### 2.3 `studentRepository`

| 方法 | 职责 | 消费者 |
|------|------|--------|
| `findByIds(ids)` | 批量 `StudentEntity[]` | M2 `attendanceService` only |

`student.service` **未调用** `findByIds`。

---

## 3. Repository Import Audit

| 文件 | 允许导入 | 实际 |
|------|----------|------|
| `attendance.repository.ts` | `prisma`, Entity types, `attendance-date` | ✅ 无 Service / 无 balance repo |
| `student.repository.ts` | `prisma`, `StudentEntity` | ✅ 无 attendance / lesson repo |

**跨 Feature 消费关系（M2 将使用，M1 仅新增能力）：**

| 消费者 | 依赖 |
|--------|------|
| `attendance.service` | `attendanceRepository`, `studentRepository`, `lessonBalanceRepository` |
| `student.service` | `studentRepository` only（**无 findByIds**） |
| `lesson.service` | `studentRepository` only |

`lesson-balance.repository.ts` — **本 M1 零 diff**，公开契约未变。

---

## 4. Repository Responsibility Audit

### 4.1 `attendanceRepository` ✔ / ✘

| ✔ 负责 | ✘ 绝不（源码审计通过） |
|--------|------------------------|
| Query / Update / `toAttendanceEntity` | `lessonBalanceRepository` |
| | `attendanceService` / `studentService` |
| | `ALREADY_VOIDED` / `ATTENDANCE_NOT_FOUND` |
| | `canVoid` / `getBalance` |

### 4.2 `studentRepository.findByIds` ✔ / ✘

| ✔ 负责 | ✘ 绝不（源码审计通过） |
|--------|------------------------|
| `prisma.student.findMany({ id: { in } })` | JOIN Attendance |
| 返回 `StudentEntity[]` | JOIN LessonPackage |
| | 返回 ViewModel |

### 4.3 M1 Exit Criteria

| 准则 | 结果 |
|------|------|
| Repository 不含业务判断 | ✅ |
| Repository 不调用 Service | ✅ |
| Repository 不计算余额 | ✅ |
| `lesson-balance.repository` 契约未改 | ✅ |
| Student Module 零回归 | ✅ |
| Repository Tests 通过 | ✅ |

---

## 5. 验证

| 命令 | 结果 |
|------|------|
| `npm run test:m1-attendance-history` | ✅ |
| `npm run test:m1` | ✅ 回归 |
| `npm run test:m1-lesson` | ✅ 回归 |
| `npm run test:m1-attendance` | ✅ 回归 |

---

## 6. 未做（M2）

- Validator / Mapper（`AttendanceHistoryRow`）
- `attendanceService.listAttendanceHistory` / `voidAttendance`
- Actions · `action-result` errorType 扩展
- `/attendance/history` UI

---

## 7. 下一步

提交本报告 → Tech Lead Review M1 → 通过后 **M2（Validator / Service / Actions）**

---

**M1 编码已停止，等待 Tech Lead Review。**
