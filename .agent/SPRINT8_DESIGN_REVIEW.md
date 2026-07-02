# Sprint 8 Design Review — Rev 2

> **Work Order**：S8-DESIGN-001  
> **日期**：2026-07-02  
> **状态**：✅ FINAL APPROVED（2026-07-02）  
> **编码**：M1 已完成，待 Review — **禁止进入 M2 直至 M1 Review**

---

## Rev 1 → Rev 2 变更摘要

Tech Lead Rev 1 结论：**CHANGES REQUIRED**。Rev 2 响应 **RC1～RC6** 及 **NB1～NB3**。

| RC | 要求 | 落实文档 | 章节 |
|----|------|----------|------|
| **RC1** | Export Payload 契约冻结 | Spec | §2 |
| | | Plan | §5.1 |
| | | ADR-014 | §决策 2 |
| **RC2** | monthlyTrend 口径 + `AttendanceMonthlyTrendPoint` | Spec | §5 |
| | | Plan | §3.1 · §6.1 |
| | | ADR-014 | §决策 3 |
| **RC3** | remainingLessonRank 学员集 + 顺序名次 | Spec | §6 |
| | | Plan | §3.1 · §6.2 |
| | | ADR-014 | §决策 4 |
| **RC4** | Statistics CSV **3 Section** 冻结 | Spec | §4 |
| | | ADR-014 | §决策 5 |
| **RC5** | Serializer 边界 + 冻结调用链 | Spec | §3.1 · §4.1 |
| | | Plan | §4.2 · §4.3 · §5 |
| | | ADR-014 | §决策 6 |
| **RC6** | `getAttendanceStatistics` 唯一事实源 | Spec | §4.1 · §7.3 |
| | | Plan | §4.1 · §4.3 |
| | | ADR-014 | §决策 7 |
| **NB1** | Audit CSV 6 列 | Spec | §3.2 |
| **NB2** | 文件名规则 | Spec | §2.3 |
| **NB3** | UTF-8 BOM · RFC 4180 · LF | Spec | §2.4 |

---

## Design Summary（Rev 2）

Sprint 8 **只做** Export + Trend + Remaining Rank；**零 Schema 变更**。

| 能力 | 事实源 / 链 |
|------|-------------|
| Audit CSV | `listAttendanceAudit` → `toAuditCsvPayload` |
| Statistics CSV | **`getAttendanceStatistics`** → `toStatisticsCsvPayload` |
| monthlyTrend | `groupValidAttendanceByMonth` → Mapper 补零 |
| remainingLessonRank | 范围内 VALID 学员全量 → `getBalances` → Mapper 顺序名次 |

新增 **Export Service + Serializer** 边界；Sprint 7 Statistics 链路 **扩展不重写**。

---

## Contract Freeze

### Export Payload（RC1）

```typescript
type AttendanceExportPayload = {
  fileName: string
  mimeType: "text/csv;charset=utf-8"
  content: string
}
```

### Monthly Trend ViewModel（RC2）

```typescript
type AttendanceMonthlyTrendPoint = {
  month: string
  validAttendanceCount: number
}
// monthlyTrend?: AttendanceMonthlyTrendPoint[]
```

### Remaining Lesson Rank ViewModel（RC3）

```typescript
type RemainingLessonRankRow = {
  rank: number
  studentId: string
  studentName: string
  remainingLessons: number
}
```

### Statistics CSV Sections（RC4）

| Section | 列 |
|---------|-----|
| A Summary | total · valid · voided · checkInEvent · voidEvent · restoreEvent |
| B Trend | month · validAttendanceCount |
| C Rank | rank · studentName · remainingLessons |

### Export Call Chain（RC5 + RC6）

```text
exportAttendanceAudit
  → exportService → listAttendanceAudit → toAuditCsvPayload

exportAttendanceStatistics
  → exportService → getAttendanceStatistics → toStatisticsCsvPayload
```

---

## Deliverables Checklist

| # | 交付物 | Rev 2 |
|---|--------|-------|
| ① | `specs/attendance-export-trend.md` | ✅ Rev 2 |
| ② | `specs/attendance-export-trend.plan.md` | ✅ Rev 2 |
| ③ | `.agent/adr/014-attendance-export-trend.md` | ✅ Rev 2 |
| ④ | `.agent/SPRINT8_DESIGN_REVIEW.md` | ✅ Rev 2 |
| ⑤ | `.agent/STATE.json` | ✅ |
| ⑥ | `.agent/CHANGELOG.md` | ✅ |
| ⑦ | `.agent/DECISIONS.md` | ✅ |
| — | 无业务代码 / Schema / Migration | ✅ |

---

**等待 Tech Lead FINAL APPROVAL 后方可进入 Sprint 8 M1 Repository 开发。**
