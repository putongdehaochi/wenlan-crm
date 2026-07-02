# Attendance Audit & Statistics Spec — Sprint 7

> **状态：Rev 2 — Tech Lead RC1～RC5 已响应，待 FINAL APPROVAL（Coding Forbidden）**
>
> 本文档定义 Sprint 7「签到审计 Timeline + 签到统计」范围，不含源码。
>
> 依据：ADR-007 · ADR-011 · ADR-012 · ADR-013 Rev 2 · Sprint 2～6 已交付能力

---

## 0. Design Review — Rev 2 Summary

| 项 | 内容 |
|----|------|
| Sprint | Sprint 7 |
| Rev 2 响应 | RC1 Lifecycle Contract · RC2 Statistics Repository · RC3 Timeline Reserved · RC4 Statistics Summary · RC5 Transaction Sequence |
| 能力 | **A.** `/attendance/audit` Timeline · **B.** `/attendance/statistics` 聚合 |
| Schema | 新增 `voidedAt` · 新增 `attendance_lifecycle_events`（含 `operator_id` · `metadata` JSON） |
| API 冻结 | Sprint 2～6 全部 Action / Service 签名 **不变** |
| Statistics 路径 | Statistics Service → **AttendanceStatisticsRepository** → Lesson Balance Repository（只读） |
| Audit 路径 | Attendance Repository → Timeline Mapper → Audit ViewModel |
| Sprint 8 预留 | Export · Teacher/Class Rank · Monthly Trend · Heatmap |

---

## 1. Business Goal

### 1.1 Sprint 7 目标

在 Sprint 6 Restore + History Filter 基础上，为老师提供**可追溯的生命周期审计**与**只读运营统计**。

| 能力 | 说明 |
|------|------|
| **Attendance Audit** | `/attendance/audit` — 全量生命周期 Timeline；VALID / VOIDED / Restore 可追溯 |
| **Attendance Statistics** | `/attendance/statistics` — 总签到 · 有效 · 撤销 · Restore · 学员排行 · 课消 |
| **Schema 演进** | `voidedAt` 列激活；`AttendanceLifecycleEvent` 持久化 Restore 等不可逆痕迹 |
| **Statistics 架构** | 禁止 `studentService` 互调；余额排行经 `lessonBalanceRepository` 只读 |

### 1.2 业务价值

- 解决 Sprint 6 边界：Restore 清除 `voidedAt` 后，仍可通过 **Lifecycle Event** 追溯撤销/恢复历史
- 工作室可查看汇总数据，支撑 Phase2「课消月报」前置（完整月报归 Sprint 8）
- **不修改** Sprint 4 Check-in · Sprint 5 Undo · Sprint 6 Restore / History **对外 API**

### 1.3 与演进路线关系

```text
Sprint 4  Today Check-in
    ↓
Sprint 5  History + Undo
    ↓
Sprint 6  Restore + Date Filter
    ↓
Sprint 7  Audit Timeline + Statistics   ← 本 Sprint
    ↓
Sprint 8  Export · Teacher/Class · Trend · Heatmap
```

---

## 2. Use Case

### 2.1 查看签到审计列表（Audit List）

```
作为书法工作室老师，
我希望在「签到审计」页面按日期查看所有签到记录及其当前状态，
并支持按学员、状态、日期范围筛选，
以便核对到课与撤销情况。
```

### 2.2 查看单条签到 Timeline（Audit Detail）

```
作为书法工作室老师，
我希望点击某条签到记录查看完整生命周期 Timeline
（签到 → 撤销 → 恢复），
以便追溯误操作与恢复过程。
```

### 2.3 查看签到统计概览（Statistics）

```
作为书法工作室老师，
我希望在「签到统计」页面看到选定日期范围内的
总签到次数、有效签到、撤销次数、Restore 次数及课消总量，
以便了解工作室运营概况。
```

### 2.4 学员签到排行

```
作为书法工作室老师，
我希望看到学员有效签到次数排行，
以便识别高频到课学员。
```

### 2.5 空数据与筛选无结果

```
作为书法工作室老师，
当筛选条件下无记录时，我希望看到明确空状态，
而不是报错或空白页。
```

---

## 3. Business Rules

### 3.1 Audit — 生命周期事件

| 规则 | 说明 |
|------|------|
| A1 | 每条 `Attendance` 对应 0..n 条 `AttendanceLifecycleEvent` |
| A2 | Check-in / create 写入 `CHECK_IN` 事件（`occurredAt = createdAt`） |
| A3 | void 写入 `VOID` 事件，并 SET `attendances.voided_at` |
| A4 | restore 写入 `RESTORE` 事件，并 SET `voided_at = NULL`（ADR-012） |
| A5 | Timeline **按 `occurredAt` 升序**；Mapper 装配，UI 禁止拼装 |
| A6 | 历史数据迁移：现有 VALID 行补一条 `CHECK_IN`；VOIDED 行补 `CHECK_IN` + `VOID`（`voidedAt` 可为 null 直至首次 void） |

### 3.2 Audit — 筛选

| 规则 | 说明 |
|------|------|
| AF1 | 复用 `FindHistoryInput` Evolution；Sprint 7 **实现** `status` 筛选 |
| AF2 | `dateFrom` / `dateTo` / `studentId` / `limit` 与 Sprint 6 语义一致 |
| AF3 | `teacherId` / `classId` / `cursor` — **Reserved**（Sprint 8+） |
| AF4 | Audit List 默认按 `attendanceDate` **降序**（与 History 一致） |

### 3.3 Statistics — 口径（ADR-007 对齐 · RC4 冻结字段名）

| ViewModel 字段 | 定义 |
|----------------|------|
| `totalAttendance` | 筛选范围内 Attendance 行数（VALID + VOIDED） |
| `validAttendance` | `status = VALID` 行数 |
| `voidedAttendance` | `status = VOIDED` 行数 |
| `restoreCount` | 筛选范围内 `RESTORE` Lifecycle Event 次数 |
| `consumedLessons` | `validAttendance`（每条 VALID = 1 课时） |
| `checkInCount` | 筛选范围内 `CHECK_IN` Event 次数（内部聚合；Sprint 7 UI 可选展示） |

> **Sprint 7 起 `AttendanceStatisticsSummary` 字段名冻结**；Sprint 8 仅填充 Reserved 子结构，不 rename。

### 3.4 Statistics — 架构约束

| 规则 | 说明 |
|------|------|
| S1 | Statistics **仅读**；不写 Attendance / LessonPackage |
| S2 | **禁止** `attendanceStatisticsService` 调用 `studentService` |
| S3 | 学员姓名：`studentRepository.findByIds`（与 History 相同模式） |
| S4 | 剩余课时排行：`lessonBalanceRepository.getBalances`（只读，Reserved UI） |

---

## 4. ViewModel

### 4.1 `AttendanceAuditListRow`（列表）

| 字段 | UI | 说明 |
|------|-----|------|
| `id` | — | Attendance ID |
| `studentId` | 否 | |
| `studentName` | ✅ | |
| `attendanceDate` | ✅ | `YYYY-MM-DD` |
| `status` | ✅ | `VALID` \| `VOIDED` |
| `checkedInAt` | ✅ | 来自 `createdAt` |
| `voidedAt` | ✅ | VOIDED 时有值；VALID 为 `null` |
| `lastEventType` | ✅ | 最近一条 Lifecycle Event 类型 |
| `lastEventAt` | ✅ | 最近事件时间 |
| `eventCount` | 可选 | Timeline 事件总数 |
| `teacherName?` | 否 | **Reserved** |
| `className?` | 否 | **Reserved** |

### 4.2 `AttendanceAuditTimeline`（详情 · RC3 Evolution）

| 字段 | 说明 |
|------|------|
| `attendanceId` | |
| `studentId` | |
| `studentName` | |
| `attendanceDate` | |
| `currentStatus` | 当前 `VALID` \| `VOIDED` |
| `events` | `AttendanceAuditTimelineEvent[]` **升序** |
| `operatorName?` | **Reserved** — Sprint 7 恒 `undefined` |
| `reason?` | **Reserved** — Sprint 7 恒 `undefined` |
| `source?` | **Reserved** — Sprint 7 恒 `undefined` |

> Timeline 头级 Reserved 供 Sprint 8+ 汇总展示；Sprint 8 **不得删改**上述字段。

### 4.3 `AttendanceAuditTimelineEvent`（RC3 Evolution）

| 字段 | Sprint 7 UI | 说明 |
|------|-------------|------|
| `eventType` | ✅ | `CHECK_IN` \| `VOID` \| `RESTORE` |
| `occurredAt` | ✅ | ISO 8601 |
| `label` | ✅ | Mapper 纯函数（「签到」「撤销」「恢复」） |
| `operatorName?` | 否 | **Reserved** — Sprint 7 恒 `null` |
| `reason?` | 否 | **Reserved** — Sprint 7 恒 `null`；Sprint 8+ void/restore reason |
| `source?` | 否 | **Reserved** — Sprint 7 恒 `null`；Sprint 8+ import/batch |

### 4.4 `AttendanceStatisticsSummary`（RC4 — 最终冻结）

```typescript
type AttendanceStatisticsSummary = {
  dateFrom?: string
  dateTo?: string
  totalAttendance: number
  validAttendance: number
  voidedAttendance: number
  restoreCount: number
  consumedLessons: number
  checkInCount: number
  studentRank: StudentRankRow[]
  teacherRank?: TeacherRankRow[]
  classRank?: ClassRankRow[]
  monthlyTrend?: MonthlyTrendRow[]
  heatmap?: HeatmapCell[]
  remainingLessonRank?: RemainingLessonRankRow[]
}
```

| 字段 | Sprint 7 UI | 说明 |
|------|-------------|------|
| `dateFrom` / `dateTo` | ✅ | 回显筛选 |
| `totalAttendance` | ✅ | §3.3 |
| `validAttendance` | ✅ | |
| `voidedAttendance` | ✅ | |
| `restoreCount` | ✅ | |
| `consumedLessons` | ✅ | |
| `checkInCount` | 可选 | |
| `studentRank` | ✅ | 有效签到排行 |
| `teacherRank?` | 否 | **Reserved** — Sprint 8 |
| `classRank?` | 否 | **Reserved** — Sprint 8 |
| `monthlyTrend?` | 否 | **Reserved** — Sprint 8 |
| `heatmap?` | 否 | **Reserved** — Sprint 8 |
| `remainingLessonRank?` | 否 | **Reserved** — Sprint 8 UI |

### 4.5 `StudentRankRow`

| 字段 | 说明 |
|------|------|
| `studentId` | |
| `studentName` | |
| `validAttendance` | 有效签到次数 |
| `rank` | 1-based |

### 4.6 Reserved Row Types（Sprint 7 类型声明 · 不装配）

`TeacherRankRow` · `ClassRankRow` · `MonthlyTrendRow` · `HeatmapCell` · `RemainingLessonRankRow` — 字段在 Plan §3 声明；Sprint 7 Mapper 返回 `undefined`。

---

## 5. Scope

### 5.1 In Scope

| 项 | 说明 |
|----|------|
| Schema | `voidedAt` · `attendance_lifecycle_events` |
| Repository | `attendanceStatisticsRepository` · Lifecycle · Audit 读 |
| Service | `listAttendanceAudit` · `getAttendanceAuditTimeline` · `getAttendanceStatistics` |
| Actions | 对应 Server Actions |
| UI | `/attendance/audit` · `/attendance/statistics` |
| void/restore **内部** | 同事务写入 Lifecycle Event + 更新 `voidedAt`（API 签名不变） |

### 5.2 Out of Scope（Sprint 7）

| 项 | 归属 |
|----|------|
| Export CSV / Excel | Sprint 8 |
| Teacher / Class 维度统计 | Sprint 8 |
| Monthly Trend · Heatmap | Sprint 8 — 激活 `AttendanceStatisticsSummary` Reserved 字段 |
| `operatorName` / `reason` / `source` | Sprint 8 — 激活 Timeline Reserved；metadata 解析 |
| Edit `attendanceDate` | Future + ADR |
| 修改 History / Today / Check-in 页面行为 | 禁止 |

---

## 6. Acceptance（Given / When / Then）

### 6.1 Audit List

| # | Given | When | Then |
|---|-------|------|------|
| AL1 | 3 条 VALID + 1 条 VOIDED | `listAttendanceAuditAction()` | 4 条；含 `voidedAt` / `lastEventType` |
| AL2 | 混合状态 | `status=VALID` | 仅 VALID |
| AL3 | 6/1～6/5 记录 | `dateFrom`/`dateTo` | 闭区间正确 |
| AL4 | 学员 A 多条 | `studentId` | 仅 A |
| AL5 | 无记录 | 筛选 | 空数组 success |

### 6.2 Audit Timeline

| # | Given | When | Then |
|---|-------|------|------|
| AT1 | 仅 Check-in | `getAttendanceAuditTimelineAction` | 1 事件 CHECK_IN |
| AT2 | Check-in → Void | Timeline | CHECK_IN → VOID 升序 |
| AT3 | Check-in → Void → Restore | Timeline | 3 事件；`currentStatus=VALID` |
| AT4 | 不存在 id | Timeline | `ATTENDANCE_NOT_FOUND` |
| AT5 | Restore 后 | Timeline | 仍含 VOID 事件（历史保留） |

### 6.3 Statistics

| # | Given | When | Then |
|---|-------|------|------|
| ST1 | 10 VALID, 2 VOIDED, 1 Restore | `getAttendanceStatisticsAction` | 口径符合 §3.3 |
| ST2 | 日期范围 | `dateFrom`/`dateTo` | 仅范围内聚合 |
| ST3 | 多学员 | `studentRank` | 按 `validAttendance` 降序 |
| ST4 | 无数据 | 统计 | 全 0 success |

### 6.4 回归

| # | 场景 | Then |
|---|------|------|
| R1 | `voidAttendanceAction` / `restoreAttendanceAction` | 签名与错误码不变 |
| R2 | `listAttendanceHistoryAction` | Sprint 6 行为不变 |
| R3 | `checkInStudentAction` | Sprint 4 行为不变 |
| R4 | `listStudentsAction` 余额 | ADR-007 公式一致 |
| R5 | Statistics 无 `studentService` 调用 | 静态审计 |
| R6 | Audit UI Action Only | 静态审计 |

---

## 7. Future Scope（Sprint 8+）

| 能力 | 说明 | API 破坏 |
|------|------|----------|
| Export CSV / Excel | 复用 Statistics / Audit Query Input | 否 — 新增 Action |
| Teacher Statistics | `FindStatisticsInput.teacherId` Reserved 实现 | 否 |
| Class Statistics | `FindStatisticsInput.classId` Reserved 实现 | 否 |
| Monthly Trend | 新增 `getAttendanceMonthlyTrendAction` | 否 |
| Heatmap | 新增 ViewModel + Action | 否 |
| `remainingLessonRank` UI | 激活 Reserved 字段 | 否 |
| Timeline `reason` / `source` | 从 `metadata` JSON 映射 | 否 |

**原则**：Sprint 7 的 `FindAuditInput` / `FindStatisticsInput` / ViewModel **一次定型**；Sprint 8 仅扩展实现与填充 Reserved，不删改 Sprint 7 字段名。

---

## 8. Open Questions

| # | 问题 | 决策 |
|---|------|------|
| 1 | Audit 与 History 是否合并页面？ | **否** |
| 2 | Statistics 默认日期范围？ | 无参 = 全量 |
| 3 | Ranking Top N 默认？ | `rankingLimit=10` |

---

## 9. Rev 2 — Required Changes 落实

| RC | 落实位置 |
|----|----------|
| RC1 | Plan §3.4 `appendLifecycleEvent` 冻结签名 · ADR-013 §决策 6 |
| RC2 | Plan §3.7 `AttendanceStatisticsRepository` |
| RC3 | 本文 §4.2 · §4.3 Timeline Reserved |
| RC4 | 本文 §3.3 · §4.4 `AttendanceStatisticsSummary` |
| RC5 | Plan §7.1 Transaction Sequence Freeze |

---

**Rev 2 — 2026-07-01 — Sprint 7 Design Review 重提交，禁止编码直至 FINAL APPROVAL**
