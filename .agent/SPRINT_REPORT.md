# Sprint Report

> 生成日期：2026-07-02  
> 用途：Sprint Review 基准文档（不含源码）

---

# Sprint 8 — Attendance Export + Trend + Remaining Lesson Rank


| 项    | 内容                                                            |
| ---- | ------------------------------------------------------------- |
| 周期   | 2026-07-02                                                    |
| 目标   | CSV 导出 · 月度趋势 · 剩余课时排行                                        |
| 范围   | Repository · Service · Serializer · Action · UI · Acceptance  |
| 明确不做 | Teacher/Class · Heatmap · Excel · Timeline Export · Schema 变更 |
| 状态   | ✅ **CLOSED**（Tech Lead Final Review 2026-07-02）               |


**Spec / Plan / ADR**：`specs/attendance-export-trend.md` Rev 2 · `specs/attendance-export-trend.plan.md` Rev 2 · ADR-014

**封板**：Frozen Analytics Core (v1)

---

## 完成内容

### M1 — Repository ✅ APPROVED

- `groupValidAttendanceByMonth` · `MonthlyAttendanceAggregateRow`
- `npm run test:m1-attendance-statistics`

### M2 — Service / Serializer ✅ APPROVED

- `getAttendanceStatistics` 扩展：`monthlyTrend` · `remainingLessonRank` · `voidEventCount`
- `attendance-export.service.ts` · `attendance-export.serializer.ts`
- `exportAttendanceAuditAction` · `exportAttendanceStatisticsAction`
- `npm run test:m2-attendance-export-trend` · `test:m2-attendance-statistics`

### M3 — UI ✅ APPROVED

- Export 按钮（Audit / Statistics · Query 同源）
- `attendance-monthly-trend.tsx` · `attendance-remaining-rank.tsx`
- UI Read Model Contract（无 aggregation / sort / CSV 拼装）
- `npm run build`

### M4 — Acceptance ✅ APPROVED

- `specs/attendance-export-trend.md` §9 全部场景通过
- Sprint 7+ 全量回归通过
- Tech Lead Final Review APPROVED
- ADR-014 已采纳

---

## Acceptance 结果（§9）


| 分组                     | 场景数 | 结果  |
| ---------------------- | --- | --- |
| Export EX1–EX6         | 6   | ✅   |
| Trend TR1–TR4          | 4   | ✅   |
| Remaining Rank RR1–RR4 | 4   | ✅   |
| 回归 R4–R6               | 3   | ✅   |


---

## 里程碑状态


| 里程碑                     | Review   | 报告                              |
| ----------------------- | -------- | ------------------------------- |
| M1 Repository           | APPROVED | `.agent/SPRINT8_PROGRESS_M1.md` |
| M2 Service / Serializer | APPROVED | `.agent/SPRINT8_PROGRESS_M2.md` |
| M3 UI / Export          | APPROVED | `.agent/SPRINT8_PROGRESS_M3.md` |
| M4 Acceptance           | APPROVED | `.agent/SPRINT8_PROGRESS_M4.md` |


---

## 全量回归（M4）

7 条 Sprint 8 核心 `test:`* + `npm run build` — 2026-07-02 All Passed

证据：`.agent/SPRINT8_REVIEW_EVIDENCE.md`

---

**Sprint 8：CLOSED。** Export + Trend + Remaining Rank 交付完成。

**Next**：Sprint 9+ Planning（须单独 ADR；不可污染 Frozen Analytics Core v1）

---

# Sprint 7 — Attendance Audit + Statistics


| 项   | 内容                                              |
| --- | ----------------------------------------------- |
| 周期  | 2026-07-01 — 2026-07-02                         |
| 目标  | 签到审计 Timeline + 只读运营统计                          |
| 范围  | Repository · Service · Action · UI · Acceptance |
| 状态  | ✅ **CLOSED**（Tech Lead Final Review 2026-07-02） |


**Spec / Plan / ADR**：`specs/attendance-audit.md` Rev 2 · `specs/attendance-audit.plan.md` Rev 2 · ADR-013

---

## 完成内容

### M1 — Repository ✅ APPROVED

- `attendance_lifecycle_events` · `voided_at` · backfill migration
- `attendance-lifecycle.repository.ts` · `attendance-statistics.repository.ts`
- `npm run test:m1-attendance-audit` · `test:m1-attendance-statistics`

### M2 — 业务层 ✅ APPROVED

- `attendanceAuditService` · `attendanceStatisticsService`
- Audit / Statistics Mappers · Actions · ViewModel Types
- History `voidedAt` 真实映射
- `npm run test:m2-attendance-audit` · `test:m2-attendance-statistics`

### M3 — UI ✅ APPROVED

- `/attendance/audit` · `/attendance/statistics`
- Timeline 纯展示 · Statistics Summary 纯展示
- Navigation Graph 四页闭环
- `npm run build`

### M4 — Acceptance ✅ APPROVED

- `specs/attendance-audit.md` §6 全部场景通过
- Sprint 2～6 全量回归通过
- Tech Lead Final Review APPROVED
- ADR-013 已采纳

---

## Acceptance 结果（§6）


| 分组                     | 场景数 | 结果  |
| ---------------------- | --- | --- |
| Audit List AL1–AL5     | 5   | ✅   |
| Audit Timeline AT1–AT5 | 5   | ✅   |
| Statistics ST1–ST4     | 4   | ✅   |
| 回归 R1–R6               | 6   | ✅   |


---

## 里程碑状态


| 里程碑                      | Review   | 报告                              |
| ------------------------ | -------- | ------------------------------- |
| M1 Repository            | APPROVED | `.agent/SPRINT7_PROGRESS_M1.md` |
| M2 Service / Actions     | APPROVED | `.agent/SPRINT7_PROGRESS_M2.md` |
| M3 Audit / Statistics UI | APPROVED | `.agent/SPRINT7_PROGRESS_M3.md` |
| M4 Acceptance            | APPROVED | `.agent/SPRINT7_PROGRESS_M4.md` |


---

## 全量回归（M4）

20 条 `test:`* 命令 + `npm run build` — 2026-07-01 All Passed

证据：`.agent/SPRINT7_REVIEW_EVIDENCE.md`

---

**Sprint 7：CLOSED。** Attendance Audit + Statistics 交付完成。证据：`.agent/SPRINT7_REVIEW_EVIDENCE.md`

---

# Sprint 6 — Attendance Restore + History Date Filter


| 项    | 内容                                              |
| ---- | ----------------------------------------------- |
| 周期   | 2026-07-01                                      |
| 目标   | 恢复误撤销签到 + 历史日期筛选                                |
| 范围   | Repository · Service · Action · UI · Acceptance |
| 明确不做 | Audit Schema · Statistics · Reserved Filter 实现  |
| 状态   | ✅ **CLOSED**（Tech Lead Final Review 2026-07-01） |


**Spec / Plan**：`specs/attendance-restore.md` Rev 2 · `specs/attendance-restore.plan.md` Rev 2 · ADR-012

---

## 完成内容

### M1 — Repository ✅ APPROVED

- `restore()` · `findHistory` 日期扩展 · `FindHistoryInput` RC3
- `npm run test:m1-attendance-restore`

### M2 — 业务层 ✅ APPROVED

- `restoreAttendance` 冻结调用链 · `ALREADY_VALID`
- History Validator 日期 · `canRestore` ViewModel
- `npm run test:m2-attendance-restore`

### M3 — UI ✅ APPROVED

- Restore Dialog · URL 日期筛选 · 全量刷新
- `npm run build`

### M4 — Acceptance ✅ APPROVED

- `specs/attendance-restore.md` §5 全部场景通过
- Sprint 2～5 全量回归通过
- Tech Lead Final Review APPROVED
- 无新增 ADR

---

## Acceptance 结果（§5）


| 分组                     | 场景数 | 结果  |
| ---------------------- | --- | --- |
| Restore RS1–RS6        | 6   | ✅   |
| History Filter HF1–HF4 | 4   | ✅   |
| 回归 R1–R4               | 4   | ✅   |


---

## 里程碑状态


| 里程碑                  | Review   | 报告                              |
| -------------------- | -------- | ------------------------------- |
| M1 Repository        | APPROVED | `.agent/SPRINT6_PROGRESS_M1.md` |
| M2 Service / Actions | APPROVED | `.agent/SPRINT6_PROGRESS_M2.md` |
| M3 History UI        | APPROVED | `.agent/SPRINT6_PROGRESS_M3.md` |
| M4 Acceptance        | APPROVED | `.agent/SPRINT6_PROGRESS_M4.md` |


---

## 全量回归（M4）

16 条 `test:`* 命令 + `npm run build` — 2026-07-01 All Passed

证据：`.agent/SPRINT6_REVIEW_EVIDENCE.md`

---

**Sprint 6：CLOSED。** Attendance Restore + History Filter 交付完成。证据：`.agent/SPRINT6_REVIEW_EVIDENCE.md`

# Sprint 5 — Attendance History + Undo


| 项    | 内容                                              |
| ---- | ----------------------------------------------- |
| 周期   | 2026-07-01                                      |
| 目标   | 签到历史查询 + 撤销签到（VALID → VOIDED）                   |
| 范围   | Repository · Service · Action · UI · Acceptance |
| 明确不做 | Restore · Audit Schema · Statistics · 分页筛选      |
| 状态   | ✅ **CLOSED**（Tech Lead Final Review 2026-07-01） |


**Spec / Plan**：`specs/attendance-history.md` Rev 3 · `specs/attendance-history.plan.md` Rev 3 · ADR-011

---

## 完成内容

### M1 — Repository ✅ APPROVED

- `findById` · `findHistory` · `void` · `studentRepository.findByIds`
- 零 Schema 变更
- `npm run test:m1-attendance-history`

### M2 — 业务层 ✅ APPROVED

- `listAttendanceHistory` · `voidAttendance`
- `AttendanceHistoryRow` · `VoidAttendanceResult`
- `ATTENDANCE_NOT_FOUND` · `ALREADY_VOIDED`
- `npm run test:m2-attendance-history`

### M3 — UI ✅ APPROVED

- `/attendance/history` · Void Dialog · Student Filter
- Action Only UI · 全量刷新
- `npm run build`

### M4 — Acceptance ✅ APPROVED

- `specs/attendance-history.md` §7 全部场景通过
- Sprint 2～4 全量回归通过
- 无新增 ADR
- Tech Lead Final Review APPROVED

---

## Acceptance 结果（§7）


| 分组            | 场景数 | 结果  |
| ------------- | --- | --- |
| History H1–H6 | 6   | ✅   |
| Undo U1–U5    | 5   | ✅   |
| 回归 R1–R3      | 3   | ✅   |


---

## 里程碑状态


| 里程碑                  | Review   | 报告                              |
| -------------------- | -------- | ------------------------------- |
| M1 Repository        | APPROVED | `.agent/SPRINT5_PROGRESS_M1.md` |
| M2 Service / Actions | APPROVED | `.agent/SPRINT5_PROGRESS_M2.md` |
| M3 History UI        | APPROVED | `.agent/SPRINT5_PROGRESS_M3.md` |
| M4 Acceptance        | APPROVED | `.agent/SPRINT5_PROGRESS_M4.md` |


---

## 任务看板影响

- **Done**：查看签到记录（Sprint 5 — Attendance History + Undo）
- **Next**：Sprint 6 Planning（Restore / 筛选扩展）

---

## 架构决策（Sprint 5 相关）


| ADR     | 摘要                                          |
| ------- | ------------------------------------------- |
| ADR-011 | History + Undo；VALID→VOIDED；Repository 契约冻结 |


---

## 全量回归（M4）

13 条 `test:`* 命令 + `npm run build` — 2026-07-01 All Passed

证据：`.agent/SPRINT5_REVIEW_EVIDENCE.md`

---

**Sprint 5：CLOSED。** 允许进入 **Sprint 6 Planning**。证据：`.agent/SPRINT5_REVIEW_EVIDENCE.md`

---

# 历史：Sprint 4 — Attendance Module


| 项   | 内容                                  |
| --- | ----------------------------------- |
| 状态  | ✅ **CLOSED**（2026-07-01）            |
| 交付  | 今日签到 + Check In                     |
| 证据  | `.agent/SPRINT4_REVIEW_EVIDENCE.md` |


---

# 历史：Sprint 3 — Lesson Module


| 项   | 内容                         |
| --- | -------------------------- |
| 状态  | ✅ **CLOSED**（2026-06-29）   |
| 交付  | 购课录入 + 真实 lessonBalance 展示 |


---

# 历史：Sprint 2 — Student Module


| 项   | 内容                       |
| --- | ------------------------ |
| 状态  | ✅ **CLOSED**（2026-06-29） |
| 交付  | 录入学生：列表 · 创建 · 只读详情      |


