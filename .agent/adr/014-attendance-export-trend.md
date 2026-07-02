# ADR-014：Attendance Export · Monthly Trend · Remaining Lesson Rank

| 项 | 内容 |
|----|------|
| 状态 | 已采纳（Sprint 8 CLOSED — 2026-07-02） |
| 日期 | 2026-07-02 |
| 决策者 | Tech Lead Design Review |
| 关联 | ADR-007 · ADR-013 · `specs/attendance-export-trend.md` Rev 2 |

---

## 背景

Sprint 7 冻结 `AttendanceStatisticsSummary` Reserved 字段。Sprint 8 Rev 1 方向获批准，但 Export Contract · Trend/Rank 口径 · CSV Section · Serializer 边界未充分冻结。Rev 2 响应 RC1～RC6。

---

## 决策 1 — Sprint 8 范围裁剪（不变）

**结论**：Export + `monthlyTrend` + `remainingLessonRank`；Teacher/Class · Heatmap · Excel **排除**。

---

## 决策 2 — Export Payload 契约（RC1）

```typescript
type AttendanceExportPayload = {
  fileName: string
  mimeType: "text/csv;charset=utf-8"
  content: string
}
```

| 项 | 决策 |
|----|------|
| Audit / Statistics | **统一** Payload |
| Action 返回 | `ActionResult<AttendanceExportPayload>` |
| 禁止 | Blob · Response · Buffer 由 Action 返回 |
| UI | 负责浏览器下载 |

输入：`ExportAttendanceAuditInput` (= `FindAuditInput`) · `ExportAttendanceStatisticsInput` (= `FindStatisticsInput`)

---

## 决策 3 — `monthlyTrend` 口径（RC2）

| 项 | 决策 |
|----|------|
| 对象 | VALID only |
| 分组 | `attendance_date` 自然月 |
| 范围 | `FindStatisticsInput`；无日期 = **全量**（同 Sprint 7） |
| Repository | 稀疏 `groupValidAttendanceByMonth` |
| 补零 | **Mapper**；仅 `dateFrom` + `dateTo` 双边界闭区间 |
| 排序 | `month` 升序 |

```typescript
type AttendanceMonthlyTrendPoint = {
  month: string
  validAttendanceCount: number
}
```

---

## 决策 4 — `remainingLessonRank` 口径（RC3）

| 项 | 决策 |
|----|------|
| 学员集 | 统计范围内有 VALID Attendance 的学员（全量聚合，非 Top N） |
| 余额 | `lessonBalanceRepository.getBalances` |
| 排序 | `remainingLessons` DESC → `studentName` ASC → `studentId` ASC |
| 名次 | **顺序名次** 1-based，无并列 |
| 限额 | Sprint 8 **不**对 remaining rank 施 `rankingLimit` |

```typescript
type RemainingLessonRankRow = {
  rank: number
  studentId: string
  studentName: string
  remainingLessons: number
}
```

**禁止**：`studentService` · UI 重算 · statisticsRepository 算余额

---

## 决策 5 — Statistics CSV 三 Section（RC4）

| Section | 内容 |
|---------|------|
| A Summary | total · valid · voided · checkInEvent · voidEvent · restoreEvent |
| B Monthly Trend | month · validAttendanceCount |
| C Remaining Rank | rank · studentName · remainingLessons |

**不含** `studentRank` Section（Sprint 8 简化）。

---

## 决策 6 — Export Serializer 边界（RC5）

| 链 | 冻结 |
|----|------|
| Audit | Export Service → `listAttendanceAudit` → `toAuditCsvPayload` |
| Statistics | Export Service → **`getAttendanceStatistics`** → `toStatisticsCsvPayload` |

**禁止**：Action/UI/Repository 拼 CSV；Statistics Service 内联 CSV；Export 旁路统计链。

---

## 决策 7 — `getAttendanceStatistics` 唯一事实源（RC6）

Sprint 8 所有 Statistics 展示与 Export **必须**经同一 `getAttendanceStatistics` 产出完整 `AttendanceStatisticsSummary`（含 Sprint 7 字段 + S8 扩展）。

**禁止**「导出版」独立查询路径。

---

## 决策 8 — CSV 格式与文件名（NB2 · NB3）

| 项 | 决策 |
|----|------|
| 格式 | CSV only · UTF-8 BOM · RFC 4180 · **LF** |
| Audit 文件名 | `attendance-audit-YYYYMMDD-HHmmss.csv` |
| Statistics 文件名 | `attendance-statistics-YYYYMMDD-HHmmss.csv` |
| Audit 列 | attendanceDate · studentName · status · voidedAt · lastEventType · lastEventAt |

---

## 决策 9 — Sprint 8 不引入 Teacher/Class（不变）

Prisma 无 Teacher/Class · 无 `teacherId`/`classId` 列 → 顺延 Sprint 9+。

---

## Required Review Topics（Rev 2）

| # | 决策 | Rev 2 |
|---|------|-------|
| 1 | 范围裁剪 | ✅ |
| 2 | Export Payload RC1 | ✅ |
| 3 | monthlyTrend RC2 | ✅ |
| 4 | remainingLessonRank RC3 | ✅ |
| 5 | CSV 3 Section RC4 | ✅ |
| 6 | Serializer RC5 | ✅ |
| 7 | 唯一事实源 RC6 | ✅ |
| 8 | CSV 格式 NB | ✅ |

---

## 相关文档

- `specs/attendance-export-trend.md` Rev 2
- `specs/attendance-export-trend.plan.md` Rev 2
- `.agent/SPRINT8_DESIGN_REVIEW.md` Rev 2

---

**Rev 2 — 2026-07-02 — 待 Tech Lead FINAL APPROVAL**
