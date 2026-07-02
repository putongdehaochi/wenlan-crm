# Attendance History & Undo Implementation Plan — Sprint 5

> **状态：Plan Rev 3 — Tech Lead RC1～RC5 已响应，待最终批准**
>
> 依据：`specs/attendance-history.md`（Rev 3）· ADR-007 · ADR-009 · ADR-011
>
> 本文档不含任何源码。

---

## 1. Module Overview

### 1.1 Feature Structure

| 项 | 内容 |
|----|------|
| 模块名 | `attendance`（扩展） |
| 路径 | `src/features/attendance/` |
| Sprint | Sprint 5 |
| Spec | `specs/attendance-history.md` Rev 3 |
| 能力 | History 查询 + Undo 撤销 |

### 1.2 交付能力

| 能力 | 说明 |
|------|------|
| `listAttendanceHistory` | 历史列表（倒序） |
| `voidAttendance` | VALID → VOIDED |
| `/attendance/history` | History + Undo UI |

### 1.3 冻结（不得修改）

| 模块 / API | 说明 |
|------------|------|
| `student.service.ts` | 零改动 |
| `lesson.service.ts` | 零改动 |
| `lesson-balance.repository` | 契约不变 |
| `checkInStudent` / `listTodayAttendance` | 行为与调用顺序不变 |
| `findHistory` 入参对象模式 | 仅扩展字段，不改调用层 |
| `voidAttendance` Service 调用链 | §4.2 冻结 |
| Sprint 2～4 ActionResult 既有字段 | 仅扩展 errorType |

### 1.4 架构约束

ADR-002 · ADR-007 · ADR-009 · ADR-011

---

## 2. Feature First Directory

```
wenlan-crm/
├── specs/
│   ├── attendance-history.md
│   └── attendance-history.plan.md
│
├── src/features/attendance/
│   ├── types/
│   │   ├── attendance-history-row.type.ts
│   │   ├── find-history-input.type.ts          [Repository + Service 共用]
│   │   ├── void-attendance-input.type.ts
│   │   └── void-attendance-result.type.ts
│   ├── repositories/attendance.repository.ts   [扩展]
│   ├── services/attendance.service.ts          [扩展]
│   ├── actions/
│   │   ├── list-attendance-history.action.ts
│   │   └── void-attendance.action.ts
│   └── components/                             [History UI]
│
├── src/app/attendance/history/page.tsx
└── .agent/adr/011-attendance-history.md
```

> **无** `prisma/` 变更 · **无** migration

---

## 3. Repository Contract（冻结 — RC1 + RC2）

### 3.1 `attendanceRepository` 完整契约

| 方法 | Sprint | 类型 | 职责 |
|------|--------|------|------|
| `create()` | 4 | 写 | 插入 `Attendance`（`status = VALID`） |
| `findById()` | 5 | 读 | `id` → `AttendanceEntity \| null` |
| `findHistory()` | 5 | 读 | `FindHistoryInput` → `AttendanceEntity[]` |
| `void()` | 5 | 写 | `id` → `UPDATE status = VOIDED` |
| `existsToday()` | 4 | 读 | 单学员当日是否有 VALID 签到 |
| `getTodayStatuses()` | 4 | 读 | 批量当日 VALID 签到 studentId 集合 |

> 实现层若 `void` 为保留字，导出名为 `voidRecord` / `voidById`，**对外契约仍称 `void()`**。

### 3.2 Repository 职责边界（RC1）

**Repository 负责 ✔**

| 职责 | 说明 |
|------|------|
| 查询 | SELECT / findMany / findFirst / findUnique |
| 更新 | `void()` 执行 `status` UPDATE |
| Mapping | Prisma Row → `AttendanceEntity`（`toAttendanceEntity`） |

**Repository 绝不 ✘**

| 禁止 | 归属 |
|------|------|
| 判断能不能撤销 | Service |
| 判断是否已 VOIDED | Service |
| 判断余额是否足够 | Service |
| 计算 `lessonBalance` | `lesson-balance.repository` |
| JOIN Student 取姓名 | Service + `studentRepository` |
| 物理 DELETE | 禁止（ADR-011） |
| 返回 ViewModel | Mapper |

### 3.3 `findHistory` 契约（冻结 — RC2）

**签名（概念，不再变更调用模式）**

```typescript
type FindHistoryInput = {
  studentId?: string
  limit?: number
  // --- 以下 Sprint 6+ 扩展，Sprint 5 不实现 ---
  // dateFrom?: Date
  // dateTo?: Date
  // teacherId?: string
  // classId?: string
  // status?: AttendanceStatus
  // cursor?: string
}
```

```text
findHistory(input: FindHistoryInput): Promise<AttendanceEntity[]>
```

**Sprint 5 行为**

| 参数 | 行为 |
|------|------|
| `studentId` | 有值 → `where: { studentId }`；无值 → 全部学员 |
| `limit` | 有值 → `take: limit`；无值 → 全量（MVP 单人工作室） |
| 排序 | `orderBy: [{ attendanceDate: 'desc' }, { createdAt: 'desc' }]` |

**演进规则**

- Sprint 6 增加 `dateFrom` / `dateTo` / `teacherId` / `classId`：**仅扩展** `FindHistoryInput` 字段
- Service / Action **继续传入同一 input 对象**，不新增 Repository 方法
- **禁止**未来为筛选新增 `findHistoryByDate` 等平行方法

### 3.4 `void()` 契约

```text
void(id: string): Promise<AttendanceEntity>
```

| 项 | 规则 |
|----|------|
| SQL | `UPDATE attendances SET status = 'VOIDED' WHERE id = ?` |
| 返回 | 更新后 Entity |
| 业务前置检查 | **不在 Repository**（Service 先 `findById` 判断） |

### 3.5 `studentRepository` 扩展

| 方法 | 职责 | 消费者 |
|------|------|--------|
| `findByIds(ids)` | 批量 `StudentEntity[]` | `attendanceService` only |

**`student.service` 不调用 `findByIds`**

---

## 4. Service Flow

### 4.1 `listAttendanceHistory`（读）

```
Validator
    ↓
studentRepository.findById(studentId)     // 仅当 studentId 有值
    ↓
attendanceRepository.findHistory({ studentId, limit })
    ↓
studentRepository.findByIds(uniqueStudentIds)
    ↓
Mapper → AttendanceHistoryRow[]
    ↓
ActionResult
```

### 4.2 `voidAttendance`（写 — 冻结 — RC3）

**以下调用顺序不得变更：**

```
voidAttendanceAction
    ↓
attendanceService.voidAttendance
    ↓
Validator
    ↓
attendanceRepository.findById(attendanceId)
    ↓
不存在 → ATTENDANCE_NOT_FOUND
    ↓
status === VOIDED → ALREADY_VOIDED
    ↓
attendanceRepository.void(attendanceId)
    ↓
lessonBalanceRepository.getBalance(studentId)
    ↓
Mapper → VoidAttendanceResult
    ↓
ActionResult
```

| 步骤 | 层 | 说明 |
|------|-----|------|
| 存在性 / VOID 判断 | **Service** | Repository 不做 |
| `void()` | **Repository** | 纯 UPDATE |
| 余额读取 | **Service** → `lessonBalanceRepository` | 不写入 |
| ViewModel | **Mapper** | 含 `lessonBalance`（VoidResult） |

### 4.3 与 Sprint 4 Service 共存

| 方法 | Sprint | 变更 |
|------|--------|------|
| `listTodayAttendance` | 4 | **无** |
| `checkInStudent` | 4 | **无** |
| `listAttendanceHistory` | 5 | 新增 |
| `voidAttendance` | 5 | 新增 |

---

## 5. Action Contract

| Action | 输入 | 成功输出 |
|--------|------|----------|
| `listAttendanceHistoryAction` | `FindHistoryInput`（Sprint 5：`studentId?`, `limit?`） | `AttendanceHistoryRow[]` |
| `voidAttendanceAction` | `{ attendanceId: string }` | `VoidAttendanceResult` |

**新增 errorType**：`ATTENDANCE_NOT_FOUND` · `ALREADY_VOIDED`

---

## 6. Mapper Design

### 6.1 `AttendanceHistoryRow`（RC4）

| 源字段 | ViewModel 字段 |
|--------|----------------|
| `entity.id` | `id` |
| `entity.studentId` | `studentId` |
| `student.name` | `studentName` |
| `entity.attendanceDate` | `attendanceDate` |
| 业务常量 `1`（VALID 消耗） | `quantityConsumed` |
| `entity.status` | `status` |
| `entity.createdAt` | `checkedInAt` |
| `null`（Sprint 5 无列） | `voidedAt` |
| `status === VALID` | `canVoid` |

### 6.2 `VoidAttendanceResult`

`attendanceId` · `studentId` · `attendanceDate` · `status` · `lessonBalance`

---

## 7. UI Flow

### 7.1 History 加载

`listAttendanceHistoryAction({ studentId?, limit? })` → 渲染 `AttendanceHistoryRow`

### 7.2 Undo 流程

```
确认 Dialog → voidAttendanceAction → 成功 → listAttendanceHistoryAction 全量刷新
```

### 7.3 UI import 规则

| 组件 | 允许 | 禁止 |
|------|------|------|
| `attendance-history-page.tsx` | `list` + `void` Actions | Service / Repository |
| `attendance-history-row.tsx` | types + 回调 | Action / Service |

Sprint 5 UI 展示：`studentName` · `attendanceDate` · `status` · `canVoid`（`quantityConsumed` / `voidedAt` 不展示）

---

## 8. Cross Feature Dependency

### 8.1 允许

```
attendanceService → attendanceRepository / studentRepository / lessonBalanceRepository（只读余额）
UI → Actions only
Student 详情 → Link /attendance/history?studentId=
```

### 8.2 禁止

```
studentService → attendanceRepository / attendanceService
lesson-balance 写入 / History 耦合
UI → Repository
Repository 业务判断
Service 互调
```

### 8.3 Sprint 2～4 零侵入

`student.service` · `lesson.service` · `lesson-balance.repository` 契约 · Check-in Actions — **无 diff**

---

## 9. Transaction Boundary

| 操作 | 边界 |
|------|------|
| `listAttendanceHistory` | 只读；无事务 |
| `voidAttendance` | 单条 `UPDATE`；无跨表事务 |
| 余额恢复 | 派生计算；无写库 |

---

## 10. M1～M4 Milestones

### M1 — Repository

| 交付 | 测试 |
|------|------|
| `findById` · `findHistory` · `void` | `test:m1-attendance-history` |
| `FindHistoryInput` 类型 | |
| `studentRepository.findByIds` | |
| Sprint 4 方法回归 | `test:m1-attendance` |

### M2 — Service + Action

| 交付 | 测试 |
|------|------|
| Validators · Mapper（RC4 ViewModel） | `test:m2-attendance-history` |
| `listAttendanceHistory` · `voidAttendance`（§4.2 链） | |
| Actions · errorType | |

### M3 — UI

| 交付 | 测试 |
|------|------|
| `/attendance/history` + Undo | `npm run build` |

### M4 — Acceptance + Evidence

| 交付 | 测试 |
|------|------|
| Spec §7 全部 | `test:m4-attendance-history` |
| Sprint 4 回归 + Evidence | |

---

## 11. Implementation Order

```
Step 1   Rev 3 Design → Tech Lead 最终批准
Step 2   Repository（findById / findHistory / void）
Step 3   Types / Mapper / Validators
Step 4   Service（§4.1 / §4.2 冻结链）+ Actions
Step 5   test:m1 / test:m2
Step 6   Sprint 4 回归
Step 7   UI
Step 8   test:m4 + Evidence → Close Sprint 5
```

---

## 12. Risks

| # | 风险 | 缓解 |
|---|------|------|
| 1 | Repository 写业务 | §3.2 边界表 + M1 Review |
| 2 | findHistory 契约漂移 | RC2 冻结 input 对象 |
| 3 | void 链被改序 | RC3 冻结 + M2 Review |
| 4 | 同日撤销再签到 | Future Restore（ADR Evolution） |

---

## 修订记录

| 版本 | 日期 | 变更 |
|------|------|------|
| Rev 1 | 2026-07-01 | History only |
| Rev 2 | 2026-07-01 | + Undo |
| Rev 3 | 2026-07-01 | RC1 Repository 边界；RC2 findHistory 契约；RC3 void 链；RC4 ViewModel |

---

**状态：Plan Rev 3 — 待 Tech Lead 最终批准。批准后进入 M1。**
