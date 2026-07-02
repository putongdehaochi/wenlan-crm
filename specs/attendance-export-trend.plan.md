# Attendance Export & Trend Implementation Plan — Sprint 8

> **状态：Plan Rev 2 — Tech Lead RC1～RC6 已响应（Coding Forbidden）**
>
> 依据：`specs/attendance-export-trend.md` Rev 2 · ADR-014 Rev 2
>
> 本文档不含任何源码。

---

## 1. Module Overview

| 项 | 内容 |
|----|------|
| Sprint | Sprint 8 |
| Spec | `specs/attendance-export-trend.md` Rev 2 |
| Schema | **无变更** |
| 统计事实源 | `attendanceStatisticsService.getAttendanceStatistics` — **唯一**（RC6） |

### 1.1 冻结（Sprint 2～7）

写链 · `listAttendanceAudit` · `getAttendanceAuditTimeline` 对外行为不变 · `FindAuditInput` / `FindStatisticsInput` 不改参 · `student.service` / `lesson.service` 零改动。

### 1.2 Sprint 8 新增

| 组件 | 说明 |
|------|------|
| `attendance-export.service.ts` | Export 编排 |
| `attendance-export.serializer.ts` | **唯一** CSV 生成边界（RC5） |
| `export-attendance-audit.action.ts` | |
| `export-attendance-statistics.action.ts` | |
| Repository | `groupValidAttendanceByMonth` |
| Statistics 扩展 | `voidEventCount` · `monthlyTrend` · `remainingLessonRank` |

---

## 2. Feature First Directory

```
src/features/attendance/
├── types/
│   ├── attendance-export-payload.type.ts       [S8 — AttendanceExportPayload 冻结]
│   ├── export-attendance-audit-input.type.ts     [S8 — = FindAuditInput 别名]
│   ├── export-attendance-statistics-input.type.ts [S8 — = FindStatisticsInput 别名]
│   ├── attendance-monthly-trend-point.type.ts    [S8 — RC2 元素类型]
│   ├── month-aggregate-row.type.ts               [S8 — Repository 稀疏行]
│   └── attendance-statistics-summary.type.ts     [S8 扩展 voidEventCount · 激活 Reserved]
├── repositories/
│   └── attendance-statistics.repository.ts       [S8 +groupValidAttendanceByMonth]
│                                                 [S8 +groupAllValidStudentsInScope 或 limit=null 变体]
├── services/
│   ├── attendance-statistics.service.ts          [S8 扩展 — 唯一事实源 RC6]
│   ├── attendance-export.service.ts              [S8 新建]
│   └── attendance.service.ts                     [沿用 listAttendanceAudit]
├── serializers/
│   └── attendance-export.serializer.ts           [S8 — toAuditCsvPayload · toStatisticsCsvPayload]
├── validators/
│   ├── export-attendance-audit.validator.ts
│   └── export-attendance-statistics.validator.ts
├── mappers/
│   └── attendance-statistics.mapper.ts           [S8 补零 · rank 装配]
├── actions/
│   ├── export-attendance-audit.action.ts
│   └── export-attendance-statistics.action.ts
└── components/
    ├── attendance-export-download.tsx            [S8 — payload → Blob 下载]
    ├── attendance-monthly-trend.tsx
    ├── attendance-remaining-rank.tsx
    └── attendance-statistics-summary.tsx         [S8 扩展]
```

---

## 3. Repository Contract

### 3.1 新增方法

```typescript
type MonthAggregateRow = { month: string; validAttendance: number }

groupValidAttendanceByMonth(
  filter: FindStatisticsInput
): Promise<MonthAggregateRow[]>
```

- WHERE 与 `countValidAttendance` **同源**
- GROUP BY `attendance_date` 年月
- 返回**稀疏**列表；**不补零**

```typescript
groupAllValidAttendanceByStudent(
  filter: FindStatisticsInput
): Promise<StudentAggregateRow[]>
```

- **无** `rankingLimit` — 供 `remainingLessonRank` 候选学员 ID（RC3）
- 与 `groupValidAttendanceByStudent(filter, limit)` 区分；后者仍供 `studentRank`

### 3.2 边界

| ✔ | ✘ |
|---|---|
| SQL 聚合 | CSV · ViewModel · `getBalances` |
| 稀疏月 / 学员计数 | 补零 · `rank` · `studentName` |

---

## 4. Service Flow

### 4.1 `getAttendanceStatistics`（RC6 — Sprint 8 唯一事实源）

```text
getAttendanceStatisticsAction
    ↓
attendanceStatisticsService.getAttendanceStatistics
    ↓
validateGetAttendanceStatisticsInput
    ↓
Promise.all([
  countTotalAttendance,
  countValidAttendance,
  countVoidedAttendance,
  countLifecycleEvents RESTORE,
  countLifecycleEvents CHECK_IN,
  countLifecycleEvents VOID,              ← S8 voidEventCount
  groupValidAttendanceByStudent(filter, rankingLimit),
  groupValidAttendanceByMonth,            ← S8
  groupAllValidAttendanceByStudent,       ← S8 remaining rank 候选
])
    ↓
studentRepository.findByIds
    ↓
lessonBalanceRepository.getBalances(rankCandidateIds)
    ↓
toAttendanceStatisticsSummary（含 monthlyTrend 补零 · remainingLessonRank 顺序名次）
    ↓
ActionResult<AttendanceStatisticsSummary>
```

**扩展规则（RC6）**：在既有 Summary 上 **增量** 字段；**禁止**重写 Sprint 7 聚合语义或旁路 Repository。

### 4.2 `exportAttendanceAudit`（RC5 — 冻结链）

```text
exportAttendanceAuditAction
    ↓
attendanceExportService.exportAttendanceAudit
    ↓
validateExportAttendanceAuditInput
    ↓
attendanceService.listAttendanceAudit(input)
    ↓
toAuditCsvPayload(rows, exportedAt)        ← serializer only
    ↓
ActionResult<AttendanceExportPayload>
```

### 4.3 `exportAttendanceStatistics`（RC5 + RC6 — 冻结链）

```text
exportAttendanceStatisticsAction
    ↓
attendanceExportService.exportAttendanceStatistics
    ↓
validateExportAttendanceStatisticsInput
    ↓
attendanceStatisticsService.getAttendanceStatistics(input)   ← 必须复用，禁止旁路
    ↓
toStatisticsCsvPayload(summary, exportedAt)                    ← serializer only
    ↓
ActionResult<AttendanceExportPayload>
```

### 4.4 禁止项（RC5）

| 禁止 | |
|------|--|
| Action 拼 CSV | |
| UI 拼 CSV | |
| Repository 返回 CSV | |
| Statistics Service 内手写 CSV 文本 | |
| Export 旁路 `getAttendanceStatistics` 再 count 一遍 | |

---

## 5. Export Architecture（RC1 + RC5）

### 5.1 `AttendanceExportPayload`（冻结）

```typescript
type AttendanceExportPayload = {
  fileName: string
  mimeType: "text/csv;charset=utf-8"
  content: string
}
```

### 5.2 Serializer 职责

| 函数 | 输入 | 输出 |
|------|------|------|
| `toAuditCsvPayload` | `AttendanceAuditListRow[]`, `exportedAt` | `AttendanceExportPayload` |
| `toStatisticsCsvPayload` | `AttendanceStatisticsSummary`, `exportedAt` | `AttendanceExportPayload` |

- BOM + RFC 4180 + **LF**
- 列头 / Section 与 Spec §3.2 · §4.2～4.4 **一一对应**
- **禁止** Service 内联 CSV 字符串拼接

### 5.3 UI 下载

```text
AttendanceExportDownload
    ↓
exportXxxAction(input)
    ↓ success
new Blob([payload.content], { type: payload.mimeType })
<a download={payload.fileName}>
```

---

## 6. Mapper

### 6.1 `toMonthlyTrendPoints`

```text
MonthAggregateRow[]（稀疏）
+ dateFromLabel? + dateToLabel?
    ↓
AttendanceMonthlyTrendPoint[]（升序；双边界补零）
```

### 6.2 `toRemainingLessonRankRows`

```text
StudentAggregateRow[]（全量候选）
+ balances Map
+ studentMap
    ↓
sort: remainingLessons DESC → studentName ASC → studentId ASC
map rank 1..n（顺序名次，无并列）
    ↓
RemainingLessonRankRow[]
```

---

## 7. Transaction / Read Boundary

Export · Trend · Rank — **只读**；无新写事务；Lifecycle / create / void / restore **不改动**。

---

## 8. Milestones

### M1 — Repository

- `groupValidAttendanceByMonth`
- `groupAllValidAttendanceByStudent`
- `npm run test:m1-attendance-export-trend`

### M2 — Service / Serializer / Actions

- 扩展 `getAttendanceStatistics`（RC6）
- `attendance-export.service.ts` + `attendance-export.serializer.ts`
- Export Actions × 2
- `npm run test:m2-attendance-export-trend`

### M3 — UI

- Export 下载组件 · Trend · Rank 展示
- `npm run build`

### M4 — Acceptance

- Spec §9 EX/TR/RR/R + Sprint 7 回归
- Evidence 包

---

## 9. Risks

| 风险 | 缓解 |
|------|------|
| Export 与 ViewModel 脱节 | RC6 强制 `getAttendanceStatistics` 单路径 |
| monthlyTrend 口径漂移 | 共用 statistics where · `attendance_date` |
| remainingLessonRank 学员集错误 | RC3 全量 `groupAllValidAttendanceByStudent` |
| Sprint 7 Summary 被破坏 | 扩展而非重写（RC6） |
| CSV 边界渗透 | RC5 Serializer 单点 |

---

## 10. Rev 2 — RC 落实

| RC | 章节 |
|----|------|
| RC1 | §5.1 Payload |
| RC2 | §3.1 · §6.1 |
| RC3 | §3.1 · §6.2 |
| RC4 | §5.2 Statistics Section |
| RC5 | §4.2 · §4.3 · §5 |
| RC6 | §4.1 · §4.3 |

---

**Rev 2 — 2026-07-02 — 禁止编码直至 FINAL APPROVAL**
