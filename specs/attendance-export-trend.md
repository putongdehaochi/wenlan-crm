# Attendance Export & Trend Spec — Sprint 8

> **状态：Rev 2 — Tech Lead RC1～RC6 已响应，待 FINAL APPROVAL（Coding Forbidden）**
>
> 本文档定义 Sprint 8「签到审计 / 统计 CSV 导出 + 月度趋势 + 剩余课时排行」范围，不含源码。
>
> 依据：ADR-007 · ADR-013 · ADR-014 Rev 2 · `specs/attendance-audit.md` Rev 2 · Sprint 7 已交付能力

---

## 0. Design Review — Rev 2 Summary

| 项 | 内容 |
|----|------|
| Sprint | Sprint 8 |
| Work Order | S8-DESIGN-001 |
| Rev 2 响应 | RC1 Export Payload · RC2 Monthly Trend · RC3 Remaining Rank · RC4 CSV Sections · RC5 Serializer 边界 · RC6 Statistics 唯一事实源 |
| 能力 | **A.** Audit List CSV · **B.** Statistics CSV（3 Section）· **C.** `monthlyTrend` · **D.** `remainingLessonRank` |
| Schema | **无变更** |
| 统计事实源 | `getAttendanceStatistics` — Sprint 8 **唯一** Summary 产出链（RC6） |

---

## 1. Business Goal

### 1.1 Sprint 8 目标

| 能力 | 说明 |
|------|------|
| **Audit CSV Export** | 复用 `listAttendanceAudit` 同源数据；**仅 Audit List**，不含 Timeline |
| **Statistics CSV Export** | 复用 `getAttendanceStatistics` 同源 Summary；3 Section 冻结 |
| **Monthly Trend** | 激活 `monthlyTrend` — 按月有效签到趋势 |
| **Remaining Lesson Rank** | 激活 `remainingLessonRank` — 统计范围内学员剩余课时顺序排行 |

### 1.2 Out of Scope（冻结）

Teacher / Class · Heatmap · Excel / xlsx · Audit Timeline Export · Timeline metadata · Sprint 2～7 写链改造

---

## 2. Export Contract（RC1 — 冻结）

### 2.1 统一 Export Payload

Audit 与 Statistics Export **均返回**同一 Payload 类型：

```typescript
type AttendanceExportPayload = {
  fileName: string
  mimeType: "text/csv;charset=utf-8"
  content: string   // UTF-8 BOM + CSV 正文
}
```

| 规则 | 说明 |
|------|------|
| P1 | Action 返回 `ActionResult<AttendanceExportPayload>` — **不是** Blob · Response · Buffer |
| P2 | UI 接收 payload，自行 `Blob` + `<a download>` |
| P3 | Serializer **仅**产出 `fileName` + `content`；不触碰浏览器 API |

### 2.2 Export 输入类型

```typescript
/** 与 FindAuditInput 对齐；Export Validator 可附加 exportLimit 默认 */
type ExportAttendanceAuditInput = FindAuditInput

/** 与 FindStatisticsInput 对齐 */
type ExportAttendanceStatisticsInput = FindStatisticsInput
```

`FindAuditInput` / `FindStatisticsInput` Sprint 7 签名 **不改**；Export 专用 Validator 包装上述类型。

### 2.3 文件名规则（NB2 — 冻结）

| Export | 规则 |
|--------|------|
| Audit | `attendance-audit-YYYYMMDD-HHmmss.csv` |
| Statistics | `attendance-statistics-YYYYMMDD-HHmmss.csv` |

`YYYYMMDD-HHmmss` = 服务器本地导出时刻；**不含**筛选范围片段。

### 2.4 CSV 格式（NB3 — 冻结）

| 项 | 值 |
|----|-----|
| 编码 | UTF-8 **with BOM**（`\uFEFF` 前缀） |
| 转义 | RFC 4180 |
| 换行 | **LF**（`\n`） |
| 分隔符 | `,` |

---

## 3. Audit Export Spec

### 3.1 数据链

```text
exportAttendanceAuditAction
  → attendanceExportService.exportAttendanceAudit
  → validateExportAttendanceAuditInput
  → attendanceService.listAttendanceAudit（Sprint 7 同源）
  → attendance-export.serializer.toAuditCsvPayload
  → ActionResult<AttendanceExportPayload>
```

**禁止**（RC5）：Action / UI / Repository 拼 CSV；Export 绕开 `listAttendanceAudit` 另查数据。

### 3.2 列定义（NB1 — 冻结顺序）

| # | CSV 列头 | 源字段 |
|---|----------|--------|
| 1 | 签到日期 | `attendanceDate` |
| 2 | 学员姓名 | `studentName` |
| 3 | 状态 | `status` |
| 4 | 撤销时间 | `voidedAt` |
| 5 | 最近事件 | `lastEventType` |
| 6 | 最近事件时间 | `lastEventAt` |

### 3.3 行为

| 规则 | 说明 |
|------|------|
| AE1 | 排序与 Audit List 一致：`attendanceDate` 降序 |
| AE2 | 空结果：仅表头行，`success: true` |
| AE3 | **不导出** Timeline 明细 |
| AE4 | `teacherId` / `classId` / `cursor` → `VALIDATION_ERROR` |

---

## 4. Statistics Export Spec（RC4 — 3 Section 冻结）

### 4.1 数据链（RC6）

```text
exportAttendanceStatisticsAction
  → attendanceExportService.exportAttendanceStatistics
  → validateExportAttendanceStatisticsInput
  → attendanceStatisticsService.getAttendanceStatistics   ← 唯一事实源
  → attendance-export.serializer.toStatisticsCsvPayload
  → ActionResult<AttendanceExportPayload>
```

**禁止**：Export 内再次 `count...` / 手工拼 Summary（RC6）。

### 4.2 Section A — Summary（键值对，两列：指标, 数值）

| CSV 指标名 | ViewModel 源字段 |
|------------|------------------|
| 总签到次数 | `totalAttendance` |
| 有效签到 | `validAttendance` |
| 撤销次数 | `voidedAttendance` |
| 签到事件数 | `checkInCount` |
| 撤销事件数 | Serializer 从 Summary 扩展字段或同源聚合 — **实现时** `getAttendanceStatistics` 须含 `voidEventCount`（VOID Lifecycle Event 次数，与 `voidedAttendance` 区分） |
| 恢复事件数 | `restoreCount` |

> Sprint 8 扩展 `getAttendanceStatistics` 返回值时，**新增** `voidEventCount: number`（内部聚合 `countLifecycleEvents(..., "VOID")`），不 rename Sprint 7 字段。Export Section A 列名 `撤销事件数` 映射 `voidEventCount`。

（空行）

### 4.3 Section B — Monthly Trend

| CSV 列头 | 源字段 |
|----------|--------|
| 月份 | `month` |
| 有效签到次数 | `validAttendanceCount` |

数据来自 `summary.monthlyTrend[]`。

（空行）

### 4.4 Section C — Remaining Lesson Rank

| CSV 列头 | 源字段 |
|----------|--------|
| 排名 | `rank` |
| 学员姓名 | `studentName` |
| 剩余课时 | `remainingLessons` |

数据来自 `summary.remainingLessonRank[]`。

### 4.5 一致性

Statistics CSV 各 Section **必须**与同一 `getAttendanceStatistics` 调用结果一致。空数据：Summary 数值为 `0`；B/C 仅表头。

---

## 5. Monthly Trend Spec（RC2 — 冻结）

### 5.1 统计口径

| 项 | 规则 |
|----|------|
| 统计对象 | **仅** `status = VALID` 的 Attendance 行 |
| 分组字段 | `attendances.attendance_date` 所在**自然月** |
| 时间范围 | `FindStatisticsInput.dateFrom` / `dateTo`（与 Statistics 同源过滤） |
| 默认范围 | **与 Sprint 7 一致**：无 `dateFrom`/`dateTo` → **全量**（不施加日期 WHERE） |
| Repository | `groupValidAttendanceByMonth` → **稀疏** `{ month, count }[]` |
| Mapper | 补零 · 排序 · 完整月序列（见 §5.2） |

### 5.2 补零与排序

| 条件 | Mapper 行为 |
|------|-------------|
| `dateFrom` **且** `dateTo` 均有值 | 闭区间每个自然月一行；无数据月 `validAttendanceCount = 0` |
| 仅一侧或无日期 | **不补零**；仅输出 Repository 稀疏月份 |
| 排序 | `month` **升序**（`YYYY-MM`） |

### 5.3 ViewModel（元素结构冻结）

```typescript
type AttendanceMonthlyTrendPoint = {
  month: string              // YYYY-MM
  validAttendanceCount: number
}

// AttendanceStatisticsSummary 中：
monthlyTrend?: AttendanceMonthlyTrendPoint[]
```

> Sprint 7 声明的 `MonthlyTrendRow`（`validAttendance`）在 Sprint 8 激活时 **演进为** `AttendanceMonthlyTrendPoint`（`validAttendanceCount`）；Summary 字段名 `monthlyTrend` **不变**。

---

## 6. Remaining Lesson Rank Spec（RC3 — 冻结）

### 6.1 学员集合

**拍板**：候选学员 = 本次 `FindStatisticsInput` 统计范围内，**至少有一条 VALID Attendance** 的学员集合（`groupValidAttendanceByStudent` **不限** `rankingLimit` 的全量聚合结果）。

再对该集合调用 `lessonBalanceRepository.getBalances(studentIds)` 获取 `remainingLessons`。

**不是**全工作室所有学员；**不是**仅 `studentRank` Top N。

### 6.2 排序与名次

| 项 | 规则 |
|----|------|
| 主排序 | `remainingLessons` **降序** |
| 次排序 | `studentName` **升序** |
| 稳定排序 | `studentId` **升序** |
| `rank` | **1-based 顺序名次**（1,2,3,4…）— **不做**并列名次 |
| 范围 | 候选集合内 **全部** 学员（Sprint 8 **不**对 `remainingLessonRank` 施加 `rankingLimit`） |
| 时点 | `remainingLessons` 为查询时刻快照；`dateFrom`/`dateTo` **不改变**余额数值 |

### 6.3 ViewModel（冻结）

```typescript
type RemainingLessonRankRow = {
  rank: number
  studentId: string
  studentName: string
  remainingLessons: number
}

// AttendanceStatisticsSummary 中：
remainingLessonRank?: RemainingLessonRankRow[]
```

字段顺序以类型声明为准；Sprint 7 已声明同名类型，Sprint 8 **填充**并冻结排序语义。

---

## 7. ViewModel Evolution

### 7.1 Sprint 8 激活

| 字段 | Sprint 8 |
|------|----------|
| `monthlyTrend?` | `AttendanceMonthlyTrendPoint[]` |
| `remainingLessonRank?` | `RemainingLessonRankRow[]` |
| `voidEventCount`（Summary 扩展） | 新增标量，供 Export Section A |

### 7.2 仍 Reserved

`teacherRank?` · `classRank?` · `heatmap?` · Timeline metadata

### 7.3 Sprint 7 不变字段

`totalAttendance` · `validAttendance` · `voidedAttendance` · `restoreCount` · `consumedLessons` · `checkInCount` · `studentRank` — 语义 **不变**。

---

## 8. Scope

### 8.1 In Scope

Export（Audit + Statistics）· `monthlyTrend` · `remainingLessonRank` · Export Service · Serializer · UI 下载按钮 · Trend/Rank 展示

### 8.2 Out of Scope

见 §1.2

---

## 9. Acceptance

### 9.1 Export（EX）

| # | Given | When | Then |
|---|-------|------|------|
| EX1 | 3 条 Audit | `exportAttendanceAuditAction` | `AttendanceExportPayload`；6 列 §3.2 |
| EX2 | 空 Audit | Export | 仅表头；`fileName` 符合 §2.3 |
| EX3 | Statistics 有数据 | `exportAttendanceStatisticsAction` | 3 Section §4.2～4.4 |
| EX4 | 同一 input | 页面 Summary vs Export | 数值完全一致（RC6） |
| EX5 | Payload 类型 | 任意 Export | 含 `fileName` · `mimeType` · `content`；非 Blob |
| EX6 | 中文 | Export | UTF-8 BOM · LF |

### 9.2 Trend（TR）

| # | Given | When | Then |
|---|-------|------|------|
| TR1 | 6月3 VALID · 7月2 VALID · 范围 6～7月 | `monthlyTrend` | 2026-06(3) · 2026-07(2)；升序 |
| TR2 | 范围 6～8月 · 仅6月有数据 | 双边界 | 2026-07/08 `validAttendanceCount=0` |
| TR3 | 无日期 | 全量稀疏 | 仅有数据月份；不补零 |
| TR4 | `studentId` 筛选 | 趋势 | 仅该学员 |

### 9.3 Remaining Rank（RR）

| # | Given | When | Then |
|---|-------|------|------|
| RR1 | A(10) B(5) C(10) 同名破局用 studentId | `remainingLessonRank` | 顺序名次；C/A 按 studentId 升序 |
| RR2 | 范围外学员 | 排行 | **不出现** |
| RR3 | 改 dateFrom/dateTo | `remainingLessons` | 数值不变 |
| RR4 | 无 VALID 学员 | 排行 | `[]` |

### 9.4 Regression（R）

| # | 场景 | Then |
|---|------|------|
| R1 | `listAttendanceAudit` / `getAttendanceAuditTimeline` | Sprint 7 不变 |
| R2 | `getAttendanceStatistics` 既有字段 | 语义不变 |
| R3 | void / restore / checkIn | Sprint 4～6 不变 |
| R4 | 无 `studentService` in statistics | 静态审计 |
| R5 | Export 无 UI/Repo 拼 CSV | 静态审计 |
| R6 | Statistics Export 调 `getAttendanceStatistics` | 静态审计（RC6） |

---

## 10. Rev 2 — RC 落实索引

| RC | 落实 |
|----|------|
| RC1 | §2 Export Contract |
| RC2 | §5 Monthly Trend |
| RC3 | §6 Remaining Rank |
| RC4 | §4 Statistics CSV 3 Section |
| RC5 | §3.1 · §4.1 调用链 |
| RC6 | §4.1 · §7.3 |

---

**Rev 2 — 2026-07-02 — Sprint 8 Design Review 重提交，禁止编码直至 FINAL APPROVAL**
