# 变更日志

## 2026-07-02 — Sprint 8 CLOSED

### Final Close-out

- Tech Lead Final Review → **APPROVED**
- Sprint 8（Export + Trend + Remaining Lesson Rank）正式封板
- ADR-014 已采纳
- **Frozen Analytics Core (v1)** 生效

### 交付摘要

- Audit / Statistics CSV Export
- `monthlyTrend` · `remainingLessonRank`
- Read Model 架构：Repository → Service → Mapper → Serializer → UI

### 验证

- `test:m4-attendance-export-trend` + Sprint 8 回归矩阵 ✅
- Evidence：`.agent/SPRINT8_REVIEW_EVIDENCE.md`

### 状态

- Sprint 7 → **CLOSED**
- Sprint 8 → **CLOSED**
- `current_sprint = null`（无活跃 Sprint）

### Sprint 9+ 约束（Tech Lead）

- Teacher/Class · Heatmap · Forecast 等扩展须单独 ADR
- 不可污染当前 Statistics pipeline
- 须基于新 Read Model Layer

---

## 2026-07-02 — Sprint 8 M4（Acceptance + Evidence Pack）

### 新增

- `scripts/m4-attendance-export-trend-acceptance.test.mts` — §9 EX/TR/RR/R + NF-UI 验收
- `npm run test:m4-attendance-export-trend`
- `.agent/SPRINT8_REVIEW_EVIDENCE.md` · `.agent/SPRINT8_PROGRESS_M4.md`
- Trend / Rank UI contract 注释（NF-UI-2 · NF-UI-3）

### 验证

- `test:m4-attendance-export-trend` ✅
- Sprint 8 回归矩阵（M4 + M2 + M1 + Sprint 7 签到链）✅
- `npm run build` ✅

### 状态

- Sprint 8 M3 → **APPROVED**（Tech Lead Review）
- Sprint 8 M4 → `awaiting_final_review`
- **M4 编码已停止**，待 Tech Lead Final Close-out Review

---

## 2026-07-02 — Sprint 8 M3 APPROVED

### Review

- Tech Lead M3 Review → **APPROVED**
- UI Read Model 完整成立；Export / Trend / Rank 架构合规

### 状态

- Sprint 8 M3 → `approved`
- M4 解锁

---

## 2026-07-02 — Sprint 8 M3（UI / Export Integration）

### 新增

- `attendance-export-download-button.tsx` · `attendance-monthly-trend.tsx` · `attendance-remaining-rank.tsx`
- Audit / Statistics 页「导出 CSV」按钮
- Statistics 页 Trend / Rank / `voidEventCount` 展示
- `.agent/SPRINT8_PROGRESS_M3.md`

### 验证

- `npm run build` ✅

### 状态

- Sprint 8 M3 → `m3_awaiting_review`
- **M3 编码已停止**，待 Tech Lead Review

---

## 2026-07-02 — Sprint 8 M2 APPROVED

### 新增

- `attendance-export.service.ts` · `attendance-export.serializer.ts`
- `exportAttendanceAuditAction` · `exportAttendanceStatisticsAction`
- `getAttendanceStatistics` 扩展：`monthlyTrend` · `remainingLessonRank` · `voidEventCount`
- `groupAllValidAttendanceByStudent` · `AttendanceMonthlyTrendPoint` · `AttendanceExportPayload`
- `npm run test:m2-attendance-export-trend`
- `.agent/SPRINT8_PROGRESS_M2.md`

### 验证

- `test:m2-attendance-export-trend` · `test:m2-attendance-statistics` · `test:m1-attendance-statistics` · `test:m2-attendance-audit` ✅

### 状态

- Sprint 8 M2 → `m2_awaiting_review`
- **M2 编码已停止**，待 Tech Lead Review

---

## 2026-07-02 — Sprint 8 M1 APPROVED

### 新增

- `groupValidAttendanceByMonth` — `attendance-statistics.repository.ts`
- `monthly-attendance-aggregate-row.type.ts`
- `.agent/SPRINT8_PROGRESS_M1.md`

### 验证

- `npm run test:m1-attendance-statistics` ✅

### 状态

- Tech Lead M1 Review → **APPROVED（WITH CONDITIONS）**
- M2 已完成 → `m2_awaiting_review`

---

## 2026-07-02 — Sprint 8 Design FINAL APPROVED

### Final Review

- Design Rev 2：**FINAL APPROVED**
- 编码闸门解除 → 允许 M1

### 状态

- `design_final_approval_date = 2026-07-02`

---

## 2026-07-02 — Sprint 8 Design Rev 2（RC1～RC6）

### 修订

- Export Payload 契约冻结（`AttendanceExportPayload`）
- `monthlyTrend` → `AttendanceMonthlyTrendPoint` + 补零规则
- `remainingLessonRank` → 范围内 VALID 学员 + 顺序名次
- Statistics CSV 改为 **3 Section**
- Serializer 边界 + `getAttendanceStatistics` 唯一事实源

### 文档

- `specs/attendance-export-trend.md` Rev 2
- `specs/attendance-export-trend.plan.md` Rev 2
- `.agent/adr/014-attendance-export-trend.md` Rev 2
- `.agent/SPRINT8_DESIGN_REVIEW.md` Rev 2

### 状态

- Tech Lead Rev 1 → **CHANGES REQUIRED**
- Rev 2 已重提交 → `design_awaiting_review`
- **禁止编码**，待 FINAL APPROVAL

---

## 2026-07-02 — Sprint 8 Design Rev 1（Export + Trend + Remaining Rank）

### 新增

- `specs/attendance-export-trend.md` Rev 1
- `specs/attendance-export-trend.plan.md` Rev 1
- `.agent/adr/014-attendance-export-trend.md` Rev 1
- `.agent/SPRINT8_DESIGN_REVIEW.md` Rev 1

### 范围

- In：Audit CSV · Statistics CSV · `monthlyTrend` · `remainingLessonRank`
- Out：Teacher/Class · Heatmap · Excel · Timeline metadata

### 状态

- Sprint 8 → `design_awaiting_review`
- **禁止编码**，待 Tech Lead Design FINAL APPROVAL → M1

---

## 2026-07-02 — Sprint 7 CLOSED

### Final Review

- Tech Lead Final Review：**APPROVED**
- Acceptance §6 全部通过（AL1–AL5 · AT1–AT5 · ST1–ST4 · R1–R6）
- Sprint 2～6 全量回归通过
- Audit UI Action-only · Timeline Mapper 排序 · Statistics 无客户端聚合

### 交付

- Attendance Audit（Audit List · Audit Timeline · Lifecycle Events）
- Attendance Statistics（聚合统计 · 学员排行 · Summary ViewModel）
- ADR-013 已采纳

### 状态

- `sprint_7.status = closed`
- `current_sprint = Sprint 8`（Planning）
- 证据：`.agent/SPRINT7_REVIEW_EVIDENCE.md`

---

## 2026-07-01 — Sprint 7 M4（Acceptance + Integration）

### 新增

- `scripts/m4-attendance-audit-acceptance.test.mts` — §6 全量验收 + 回归 + UI 审计
- `npm run test:m4-attendance-audit`
- `.agent/SPRINT7_REVIEW_EVIDENCE.md` — Evidence 包
- `.agent/SPRINT7_PROGRESS_M4.md`

### 验证

- M4 + M1/M2 全量回归（20 条 test + build）✅

### 状态

- Sprint 7 → `awaiting_final_review`
- **M4 编码已停止**，待 Tech Lead Close-out Review

---

## 2026-07-01 — Sprint 7 M3 APPROVED

### 新增

- `/attendance/audit` — 审计列表 + Timeline Sheet + 筛选
- `/attendance/statistics` — 统计概览 + 学员排行
- `attendance-nav-links.tsx` · `attendance-audit-`* · `attendance-statistics-`* 组件
- `attendance-audit-query.ts` · `attendance-statistics-query.ts`
- `.agent/SPRINT7_PROGRESS_M3.md`

### 扩展

- 今日签到 / 历史页导航 → Audit · Statistics
- 学员详情 →「查看签到审计」链接

### 验证

- `npm run build` ✅（含 `/attendance/audit` · `/attendance/statistics` 路由）

### 状态

- Sprint 7 → `m3_awaiting_review`
- **M3 编码已停止**，待 Tech Lead Review → M4

---

## 2026-07-01 — Sprint 7 M2 APPROVED

### 新增

- `attendance-statistics.service.ts` · `attendanceAuditService`（audit 方法挂载 `attendance.service`）
- `attendance-audit.mapper.ts` · `attendance-statistics.mapper.ts`
- Validators：`list-attendance-audit` · `get-attendance-audit-timeline` · `get-attendance-statistics`
- Actions：`listAttendanceAuditAction` · `getAttendanceAuditTimelineAction` · `getAttendanceStatisticsAction`
- ViewModel Types：Audit List / Timeline / Statistics Summary
- `scripts/m2-attendance-audit-service.test.mts` · `scripts/m2-attendance-statistics-service.test.mts`
- `.agent/SPRINT7_PROGRESS_M2.md`

### 扩展

- `attendance-history.mapper.ts` — 真实 `voidedAt` 映射（MC-1）

### 验证

- M2 + 全量 M1 / Sprint 2～6 Service 回归 ✅

### 状态

- Sprint 7 M2 → **APPROVED**（S7-M2-REVIEW-001）
- M3 已完成 → `m3_awaiting_review`

---

## 2026-07-01 — Sprint 7 M1 APPROVED

### 新增

- `prisma/migrations/20260701120000_sprint7_attendance_audit/` — `voided_at` + `attendance_lifecycle_events` + backfill
- `attendance-lifecycle.repository.ts` — RC1 契约冻结
- `attendance-statistics.repository.ts` — RC2 Aggregate-only
- `scripts/m1-attendance-audit-repository.test.mts` · `scripts/m1-attendance-statistics-repository.test.mts`
- `npm run test:m1-attendance-audit` · `npm run test:m1-attendance-statistics`
- `.agent/SPRINT7_PROGRESS_M1.md`

### 扩展

- `attendance.repository.ts` — `findAuditList` · `create`/`void`/`restore` 事务内 Lifecycle（RC5）
- `AttendanceEntity` — `voidedAt`
- Types：`FindAuditInput` · `FindStatisticsInput` · `AppendLifecycleEventInput` · `AttendanceLifecycleEventEntity` · `StudentAggregateRow`

### 验证

- 全量 M1 回归（Sprint 2～6 + Sprint 7 audit/statistics）✅

### 状态

- Sprint 7 M1 → **APPROVED**（S7-M1-REVIEW-001）
- M2 已完成 → `m2_awaiting_review`

---

## 2026-07-01 — Sprint 7 Design Rev 2 FINAL APPROVAL

### 更新

- `specs/attendance-audit.md` Rev 2 — RC3 Timeline Reserved · RC4 Statistics Summary Evolution
- `specs/attendance-audit.plan.md` Rev 2 — RC1 `appendLifecycleEvent` · RC2 `AttendanceStatisticsRepository` · RC5 Transaction Sequence
- `.agent/adr/013-attendance-audit.md` Rev 2 — 生命周期图 · Statistics 分层 · Timeline Mermaid
- `.agent/SPRINT7_DESIGN_REVIEW.md` Rev 2

### Tech Lead Review

- Rev 1：`CHANGES_REQUIRED`（RC1～RC5）
- Rev 2：**FINAL APPROVED**（S7-DESIGN-001 · 2026-07-01）
- 允许进入 M1（Repository）

### 冻结要点

- `appendLifecycleEvent({ attendanceId, eventType, occurredAt, operatorId?, metadata? })`
- `AttendanceStatisticsRepository` — aggregate only
- `AttendanceStatisticsSummary` — `totalAttendance` · `validAttendance` · `studentRank[]` + Reserved
- 事务序：Attendance UPDATE/INSERT → Lifecycle INSERT

### 状态

- Sprint 7 Design → **FINAL APPROVED**
- M1 已启动并完成 → `m1_awaiting_review`

---

## 2026-07-01 — Sprint 7 Design Rev 1（Audit / Statistics）

### 新增

- `specs/attendance-audit.md` Rev 1 — Audit Timeline + Statistics Spec
- `specs/attendance-audit.plan.md` Rev 1 — Repository / Service / UI / M1～M4
- `.agent/adr/013-attendance-audit.md` — Audit Timeline vs Operation Log · Statistics 禁 studentService
- `.agent/SPRINT7_DESIGN_REVIEW.md` — Design Review 提交包

### 范围

- **做（设计）**：`/attendance/audit` Timeline · `/attendance/statistics` 聚合 · `voidedAt` + Lifecycle Events Schema 设计
- **不做**：编码 · Migration · Repository · Service · UI
- **冻结**：Sprint 2～6 全部 API

### 状态

- Sprint 7 → `design_awaiting_review`
- **禁止编码**，待 Tech Lead Design FINAL APPROVAL → M1

---

## 2026-07-01 — Sprint 6 CLOSED

### Final Review

- Tech Lead Final Review：**APPROVED**
- Acceptance §5 全部通过 · 全量回归通过
- Student / Lesson / Attendance Today / History Undo 零回归

### 交付

- Attendance Restore（VOIDED → VALID）
- History Date Filter（`dateFrom` / `dateTo` URL Query）
- ADR-012 已采纳

### 状态

- `sprint_6.status = closed`
- `current_sprint = Sprint 7`（Planning）
- 证据：`.agent/SPRINT6_REVIEW_EVIDENCE.md`

---

## 2026-07-01 — Sprint 6 M4（Acceptance + Integration）

### 新增

- `scripts/m4-attendance-restore-acceptance.test.mts`
- `npm run test:m4-attendance-restore`
- `.agent/SPRINT6_REVIEW_EVIDENCE.md`

### 验收

- `specs/attendance-restore.md` §5 全部场景（RS1–RS6 · HF1–HF4 · R1–R4）
- Restore Regression Checklist · Query Matrix · UI Flow Evidence
- Sprint 2～5 全量回归（16 test + build）全部通过

### 状态

- Sprint 6 M4 APPROVED → Sprint 6 CLOSED（2026-07-01 Final Review）

---

## 2026-07-01 — Sprint 6 M3（History UI）

### 新增

- `restore-attendance-dialog.tsx` · `attendance-history-filter.tsx`
- `attendance-history-query.ts` — URL Query 构建
- History 页「恢复」按钮 + 日期筛选（`?dateFrom=&dateTo=`）

### 验证

- `npm run build` · `test:m2-attendance-restore` · `test:m2-attendance-history` · `test:m2-attendance` 全部通过

### 不变

- Service / Repository / Actions 无 M3 业务层 diff

---

## 2026-07-01 — Sprint 6 M2（Service / Actions）

### 新增

- `restoreAttendance` Service + `restoreAttendanceAction`
- `restore-attendance.validator.ts` · `toRestoreAttendanceResult`
- `AttendanceHistoryRow` +`canRestore` · `RestoreAttendanceResult`
- `list-attendance-history.validator` 扩展 `dateFrom`/`dateTo`
- ActionResult：`ALREADY_VALID`
- `npm run test:m2-attendance-restore`

### 验证

- `test:m2-attendance-restore` · `test:m2-attendance-history` · `test:m2-attendance` · `test:m2` · `test:m2-lesson` 全部通过

### 不变

- Prisma Schema · `lesson-balance.repository` · `student.service` · Sprint 4 Check-in · Sprint 5 Void

---

## 2026-07-01 — Sprint 6 M1（Repository）

### 新增

- `attendanceRepository.restore()`
- `findHistory` 扩展 `dateFrom` / `dateTo`
- `FindHistoryInput` RC3 Evolution 类型
- `npm run test:m1-attendance-restore`

### 验证

- `test:m1-attendance-restore` · `test:m1-attendance-history` · `test:m1-attendance` · `test:m1-lesson` · `test:m1` 全部通过

### 不变

- Prisma Schema · `lesson-balance.repository` · `student.service`

---

## 2026-07-01 — Sprint 6 Design Rev 2 APPROVED

### 更新

- `specs/attendance-restore.md` — Rev 2：Restore 余额数学 · ViewModel 最终字段
- `specs/attendance-restore.plan.md` — Rev 2：restore 字段表 · FindHistory Evolution · 链 Freeze
- `.agent/adr/012-attendance-restore.md` — Rev 2：RC1～RC5 完整响应

### Tech Lead Review

- Rev 1：`CHANGES_REQUIRED`
- Rev 2：响应 RC1～RC5，待最终批准 → M1

### 冻结要点

- Restore 前置：`currentBalance >= 1`（消耗 1 课时）
- `restore(id): AttendanceEntity` 字段变更表 · Sprint 7 `voidedAt → NULL`
- `FindHistoryInput` 完整 Evolution 类型
- `AttendanceHistoryRow` 最终接口（含 Reserved）
- `restoreAttendance` 调用链 Architecture Freeze

---

## 2026-07-01 — Sprint 6 Design Rev 1

### 新增

- `specs/attendance-restore.md` Rev 1
- `specs/attendance-restore.plan.md` Rev 1
- `.agent/adr/012-attendance-restore.md`

### 范围

- Restore：`VOIDED → VALID` · `attendanceRepository.restore()`
- History Filter：`dateFrom` / `dateTo`（向后兼容）
- 冻结：`restoreAttendance` Service 调用链 · Student/Lesson 零改动

### 状态

- Sprint 6 → `design_awaiting_review`
- **禁止编码**，待 Tech Lead Design Approval

---

## 2026-07-01 — Sprint 5 CLOSED

### Final Review

- Tech Lead Final Review：**APPROVED**
- Acceptance §7 全部通过 · 全量回归通过
- Student / Lesson / Attendance Today 零回归

### 交付

- Attendance History（`/attendance/history`）
- Undo Attendance（VALID → VOIDED）
- ADR-011 已采纳

### 状态

- `sprint_5.status = closed`
- `current_sprint = Sprint 6`（Planning）

---

## 2026-07-01 — Sprint 5 M4（Acceptance + Integration）

### 新增

- `scripts/m4-attendance-history-acceptance.test.mts`
- `npm run test:m4-attendance-history`
- `.agent/SPRINT5_REVIEW_EVIDENCE.md`

### 验收

- `specs/attendance-history.md` §7 全部场景通过
- 13 条回归 + `npm run build` 全部通过

### 状态

- Sprint 5 → `awaiting_review`（待 Tech Lead Final Review，未 CLOSED）

---

## 2026-07-01 — Sprint 5 M3（History UI）

### 新增

- `/attendance/history` 页面（支持 `?studentId=` 筛选）
- `attendance-history-page` · `attendance-history-list` · `attendance-history-row`
- `void-attendance-dialog` 撤销确认
- `/attendance` 增加「签到历史」入口
- 学生详情「查看签到历史」链接

### 验证

- `npm run build` · `test:m2-attendance-history` · `test:m2-attendance` 通过

---

## 2026-07-01 — Sprint 5 M2（Service / Actions）

### 新增

- `listAttendanceHistory` · `voidAttendance` Service
- `list-attendance-history.action` · `void-attendance.action`
- `attendance-history.mapper` · Validators
- `AttendanceHistoryRow` · `VoidAttendanceResult` ViewModel
- ActionResult：`ATTENDANCE_NOT_FOUND` · `ALREADY_VOIDED`
- `npm run test:m2-attendance-history`

### 验证

- M2 + M4 全量回归通过

### 不变

- `student.service` · `lesson-balance.repository` · Sprint 4 Check-in

---

## 2026-07-01 — Sprint 5 M1（Repository）

### 新增

- `attendanceRepository`：`findById` · `findHistory` · `void`
- `studentRepository`：`findByIds`
- `FindHistoryInput` 类型
- `npm run test:m1-attendance-history`

### 验证

- `test:m1-attendance-history` · `test:m1` · `test:m1-lesson` · `test:m1-attendance` 全部通过

### 不变

- Prisma Schema · `lesson-balance.repository` · `student.service`

---

## 2026-07-01 — Sprint 5 Design Rev 3（RC1～RC5）

### 更新

- `specs/attendance-history.md` — Rev 3：`AttendanceHistoryRow` 扩展字段（RC4）
- `specs/attendance-history.plan.md` — Rev 3：Repository 完整契约（RC1）、`findHistory` 冻结（RC2）、`void` 调用链（RC3）
- `.agent/adr/011-attendance-history.md` — Evolution 图（RC5）、Undo 链、Repository 边界

### Tech Lead Review

- Rev 2：`APPROVED_WITH_REQUIRED_CHANGES`
- Rev 3：响应 RC1～RC5，待最终批准 → M1

### 冻结契约

- `attendanceRepository`：`create` · `findById` · `findHistory` · `void` · `existsToday` · `getTodayStatuses`
- `FindHistoryInput`：`{ studentId?, limit? }`（Sprint 6+ 仅扩展字段）
- `voidAttendance` Service 调用链（§4.2 Plan）

---

## 2026-07-01 — Sprint 5 Design Rev 2（History + Undo）

### 新增 / 更新

- `specs/attendance-history.md` — Rev 2：History + Undo、Error Rules、Future Scope
- `specs/attendance-history.plan.md` — Rev 2：Repository/Service/Action/UI、Transaction、M1–M4
- `.agent/adr/011-attendance-history.md` — VALID→VOIDED、余额零侵入、Sprint 4 升级路径

### 修改

- `.agent/DECISIONS.md` — ADR-011 摘要
- `.agent/STATE.json` — `design_awaiting_review`；scope 含 Undo

### 范围

- **做**：History 查询、撤销签到（VOIDED）、ViewModel、Acceptance
- **不做**：Restore、DELETE、搜索/分页/导出、Schema 变更、Check-in API 变更

### 原因

Tech Lead Work Order — Sprint 5 Planning Phase；仅设计，禁止编码。

### 下一步

提交 **Sprint 5 Design Review** → 批准后 M1

---

## 2026-07-01 — Sprint 5 Design Rev 1（History only）

### 新增

- `specs/attendance-history.md` — 签到历史业务规格 Rev 1
- `specs/attendance-history.plan.md` — 实现计划 Rev 1
- `.agent/adr/011-attendance-history.md` — History 查询与 Feature 边界

### 修改

- `.agent/DECISIONS.md` — ADR-011 索引
- `.agent/STATE.json` — Sprint 5 design_awaiting_review

### 范围

- **做**：History 页面、倒序列表、学员筛选、ViewModel、Acceptance
- **不做**：撤销/编辑/删除、搜索/分页/导出、统计、Schema 变更

### 原因

Sprint 4 CLOSED 后进入 Sprint 5 设计阶段；仅文档，无业务代码。

### 下一步

Tech Lead Review Spec / Plan / ADR → 通过后 M1 编码

---

## 2026-07-01 — Sprint 4 CLOSED

### Review

- Tech Lead Evidence Review：**APPROVED**
- Sprint 4 四个里程碑全部 Approved，Attendance Module 交付完成

### 交付摘要

- 今日签到 `/attendance`、Check In、余额自动 −1
- ADR-009/010；`student.service` 零业务改动
- Review Evidence：`.agent/SPRINT4_REVIEW_EVIDENCE.md`

### 修改

- `.agent/STATE.json` — sprint_4 closed，`current_sprint` → Sprint 5
- `.agent/SPRINT_REPORT.md` — Sprint 4 CLOSED
- `.agent/SPRINT4_PROGRESS_M4.md` — Final Review 结论
- `.agent/SPRINT4_REVIEW_EVIDENCE.md` — 纳入 Tech Lead Minor Comments

### 下一步

- Sprint 5 规划：签到历史 / 撤销签到 / 剩余课时增强
- 流程：Spec → Plan → ADR → Code → Evidence → Review

---

## 2026-07-01 — Sprint 4 Review Evidence（REQUEST_CHANGES 响应）

### 新增

- `.agent/SPRINT4_REVIEW_EVIDENCE.md` — 五项可复核证据（Acceptance 逐条 / Student 零改动 / ADR-007 / UI 审计 / 全量回归）

### 修改

- `.agent/SPRINT4_PROGRESS_M4.md` — 引用 Review Evidence
- `.agent/SPRINT_REPORT.md` — 状态改为 awaiting final review
- `.agent/STATE.json` — `awaiting_final_review`

### 验证（2026-07-01 11:42:32）

- 全量回归 10 项命令 — **All Passed, No Regression**

### 原因

Tech Lead REQUEST_CHANGES：补齐证据，无需修改业务代码。

---

## 2026-06-30 — Sprint 4 M4（Acceptance + Integration）

### 新增

- `scripts/m4-attendance-acceptance.test.mts` — `npm run test:m4-attendance`
- `.agent/SPRINT4_PROGRESS_M4.md`

### 修改

- `package.json` — `test:m4-attendance`
- `.agent/TASKS.md` — 快速签到 → Done

### 验证

- `npm run test:m4-attendance` ✅（§5.3 八条 + 附加）
- 全量回归 ✅

---

## 2026-06-30 — Sprint 4 M3（Attendance UI）

### 新增

- `src/app/attendance/page.tsx` — `/attendance` 路由
- `src/features/attendance/components/attendance-page.tsx`
- `src/features/attendance/components/attendance-today-list.tsx`
- `src/features/attendance/components/attendance-today-row.tsx`
- `.agent/SPRINT4_PROGRESS_M3.md`

### 修改

- `src/features/students/components/students-page.tsx` — 添加「今日签到」导航链接
- `.agent/STATE.json` — M2 approved，M3 awaiting_review
- `.agent/SPRINT4_PROGRESS_M2.md` — Review 结论

### 验证

- `npm run build` ✅（含 `/attendance` 路由）
- `npm run test:m2-attendance` / `test:m1-attendance` ✅ 回归

### 原因

M2 APPROVED 后按 Tech Lead M3 约束实现 UI；Action First、ViewModel 驱动、签到成功后全量刷新。

---

## 2026-06-30 — Sprint 4 M2（Validator / Mapper / Service / Actions）

### 新增

- `src/features/attendance/errors/attendance.errors.ts`
- `src/features/attendance/validators/check-in.validator.ts`
- `src/features/attendance/mappers/attendance.mapper.ts`
- `src/features/attendance/services/attendance.service.ts`
- `src/features/attendance/actions/check-in-student.action.ts`
- `src/features/attendance/actions/list-today-attendance.action.ts`
- `src/features/attendance/types/attendance-today-row.type.ts` 等 ViewModel 类型
- `scripts/m2-attendance-service.test.mts` — `npm run test:m2-attendance`
- `.agent/SPRINT4_PROGRESS_M2.md`

### 修改

- `src/shared/types/action-result.type.ts` — `ALREADY_CHECKED_IN`、`INSUFFICIENT_BALANCE`、`AttendanceActionResult`
- `package.json` — `test:m2-attendance`
- `.agent/STATE.json` — M1 approved，M2 awaiting_review
- `.agent/SPRINT4_PROGRESS_M1.md` — Review 结论

### 验证

- `npm run test:m2-attendance` ✅
- `npm run test:m1-attendance` / `test:m2-lesson` / `test:m4` / `test:m4-lesson` ✅ 回归
- `student.service.ts` 未修改 ✅

### 原因

M1 APPROVED 后按 Tech Lead M2 约束实施业务层；Check In 固定流程、Repository 无业务判断。

---

## 2026-06-29 — Sprint 4 M1（Schema / Repository）

### 新增

- `prisma/migrations/20260629160000_init_attendance/`
- `src/features/attendance/` — types、lib、attendance.repository
- `scripts/m1-attendance-repository.test.mts` — `npm run test:m1-attendance`
- `.agent/adr/010-attendance-prisma-schema.md`
- `.agent/SPRINT4_PROGRESS_M1.md`

### 修改

- `prisma/schema.prisma` — Attendance + AttendanceStatus
- `src/features/lessons/repositories/lesson-balance.repository.ts` — 签到扣课公式
- `package.json` — `test:m1-attendance`
- `.agent/DECISIONS.md` — ADR-009/010 已采纳
- `.agent/STATE.json` — M1 awaiting_review

### 验证

- `npx prisma migrate deploy` ✅
- `npm run test:m1-attendance` ✅
- `npm run test:m1-lesson` / `test:m1` ✅

### 原因

Sprint 4 Design APPROVED 后按 Plan §12 实施 M1。

---

## 2026-06-29 — Sprint 4 Design（Attendance Module）

### 新增

- `specs/attendance.md` — 快速签到业务规格 Rev 1
- `specs/attendance.plan.md` — 实现计划 Rev 1
- `.agent/adr/009-attendance.md` — Attendance Schema 与扣课规则

### 修改

- `.agent/DECISIONS.md` — ADR-009 索引
- `.agent/STATE.json` — `sprint_4.design_awaiting_review`

### 原因

Sprint 3 CLOSED 后进入 Sprint 4 设计阶段；Spec → Plan → ADR，待 Review 后编码。

---

## 2026-06-29 — Sprint 3 CLOSED

### Review

- Tech Lead M4 Review：**APPROVED**
- Sprint 3 四个里程碑全部 Approved，Lesson Module 交付完成

### 交付摘要

- 购课录入（`LessonPackage`）+ 真实 `lessonBalance` 展示
- ADR-007 余额公式；ADR-008 LessonPackage Schema
- `npm run test:m4-lesson` 及全量回归通过

### 修改

- `.agent/STATE.json` — Sprint 3 closed，`current_sprint` → Sprint 4
- `.agent/SPRINT_REPORT.md` — 状态 CLOSED
- `.agent/SPRINT3_PROGRESS_M4.md` — Review 结论

### 下一步

- Sprint 4：快速签到 / Attendance Module（Spec → Plan → ADR → Code）

---

## 2026-06-29 — Sprint 3 M4（Acceptance + Integration）

### 新增

- `scripts/m4-lesson-acceptance.test.mts` — §5.3 全量验收
- `.agent/SPRINT3_PROGRESS_M4.md`

### 修改

- `package.json` — `test:m4-lesson`
- `.agent/TASKS.md` — 为学生录入课时 → Done
- `.agent/SPRINT_REPORT.md` — Sprint 3 完整报告
- `.agent/STATE.json` — M3 approved，M4 awaiting_review

### 验证

- `npm run test:m4-lesson` ✅
- Student + Lesson 全量回归 ✅
- `npm run build` ✅

### 原因

M3 APPROVED 后完成真实 DB 联调与 Acceptance 验收，Sprint 3 功能交付就绪。

---

## 2026-06-29 — Sprint 3 M3（UI）

### 新增

- `src/features/lessons/components/create-lesson-purchase-form.tsx`
- `.agent/SPRINT3_PROGRESS_M3.md`

### 修改

- `src/features/students/components/student-detail-view.tsx` —「录入课时」入口
- `src/features/students/components/students-page.tsx` — 购课 Dialog 编排与刷新
- `.agent/STATE.json` — M2 approved，M3 awaiting_review

### 验证

- `npm run build` ✅

### 原因

M2 APPROVED 后按 Plan 实施 M3 UI。

---

## 2026-06-29 — Sprint 3 M2（业务层）

### 新增

- `src/shared/types/action-result.type.ts` — 统一 ActionResult
- `src/features/lessons/` — validators、mappers、service、action
- `scripts/m2-lesson-service.test.mts` — `npm run test:m2-lesson`
- `.agent/SPRINT3_PROGRESS_M2.md`

### 修改

- `src/features/students/services/student.service.ts` — `getBalances` / `getBalance` 真实余额
- `src/features/students/mappers/student.mapper.ts` — 移除 `buildZeroLessonBalanceMap`
- `src/features/lessons/repositories/lesson-balance.repository.ts` — `computeBalances` 单一聚合入口
- `package.json` — `test:m2-lesson`
- `.agent/STATE.json` — M1 approved，M2 awaiting_review

### 验证

- `npm run test:m2-lesson` ✅
- `npm run test:m2` / `test:m4` / `test:m1-lesson` ✅
- `npm run build` ✅

### 原因

M1 APPROVED 后按 Plan §13 实施 M2 业务层与 Student 余额接入。

---

## 2026-06-29 — Sprint 3 M1（数据层）

### 新增

- `prisma/migrations/20260629140000_init_lesson_package/`
- `src/features/lessons/types/lesson-package-entity.type.ts`
- `src/features/lessons/repositories/lesson-package.repository.ts`
- `src/features/lessons/repositories/lesson-balance.repository.ts`
- `scripts/m1-lesson-repository.test.mts` — `npm run test:m1-lesson`
- `.agent/adr/008-lesson-package-schema.md`
- `.agent/SPRINT3_PROGRESS_M1.md`

### 修改

- `prisma/schema.prisma` — LessonPackage + Student relation
- `package.json` — `test:m1-lesson`
- `.agent/DECISIONS.md` — ADR-007 已采纳、ADR-008
- `.agent/STATE.json` — M1 awaiting_review

### 验证

- `npx prisma migrate deploy` ✅
- `npm run test:m1-lesson` ✅
- `npm run test:m1` ✅（Student 回归）

### 原因

Sprint 3 Design APPROVED 后按 Plan §13 实施 M1。

---

## 2026-06-29 — Sprint 3 Design Rev 2（REQUEST_CHANGES 响应）

### 修改

- `specs/lesson.plan.md` — Rev 2：Repository 职责拆分、`getBalances`/`getBalance` 正式契约、事务边界、Cross Feature Dependency、统一 ActionResult
- `.agent/adr/007-lesson-balance.md` — Rev 2：对齐 Plan 五项 Required Changes
- `.agent/STATE.json` — design_resubmitted

### 原因

Tech Lead Sprint 3 Design Review REQUEST_CHANGES；仅修订 Plan + ADR，Spec 业务范围不变。

---

## 2026-06-29 — Sprint 2 CLOSED

### Review

- Tech Lead M4 Review：**APPROVED**
- Sprint 2 四个里程碑全部 Approved，Student Module 交付完成

### 修改

- `.agent/STATE.json` — Sprint 2 closed，current_sprint → Sprint 3
- `.agent/SPRINT_REPORT.md` — 状态 CLOSED
- `.agent/SPRINT_PROGRESS_M3.md` / `M4.md` — Review 结论

### 下一步

- Sprint 3：课时录入 / Lesson Module（Spec → Plan → ADR → Code）

---

## 2026-06-29 — Sprint 2 M4（Acceptance + Integration）

### 新增

- `scripts/m4-student-acceptance.test.mts` — §5.4 全量验收 + 归档重复 / 不存在 / 空列表
- `.agent/SPRINT_PROGRESS_M4.md` — M4 进度报告

### 修改

- `package.json` — `test:m4`
- `.env` — DATABASE_URL 指向 Prisma Dev 本地 PostgreSQL
- `.agent/TASKS.md` — 录入学生 → Done
- `.agent/STATE.json` — M3 approved_conditional，M4 awaiting_review
- `.agent/SPRINT_REPORT.md` — Sprint 2 完整报告

### 验证

- `npx prisma migrate deploy` ✅
- `npm run test:m1` / `test:m2` / `test:m4` ✅
- `npm run build` ✅

### 原因

M3 APPROVED（Conditional）后完成真实 DB 联调与 Acceptance 验收，Sprint 2 功能交付就绪。

---

## 2026-06-29 — Sprint 2 M3（UI）

### 新增

- `src/features/students/components/` — student-list、create-student-form、student-detail-view、students-page
- `src/app/students/page.tsx` — 学生管理路由
- shadcn：table、dialog、sheet、input、label、textarea

### 修改

- `src/app/page.tsx` — redirect `/students`
- `src/app/layout.tsx` — 文岚书法管理系统
- `.agent/SPRINT_PROGRESS_M3.md`、`.agent/STATE.json`

### 原因

M2 APPROVED 后按 Plan Rev 2 完成 M3 UI；`npm run build` 通过。

---

## 2026-06-29 — Sprint 2 M2 APPROVED

### 修改

- `.agent/SPRINT_PROGRESS_M2.md` — 补充 Required Change 1–4：调用链证据、Validator 契约、Mapper 纯函数、normalize 时机

### 修改

- `.agent/STATE.json` — M2 resubmitted_review

### 原因

M2 Review REQUEST_CHANGES；无需返工业务代码，补充可验证事实依据后重新提交。

---

## 2026-06-29 — 优先级调整 + Sprint 2 M2

### 决策

- Agent Prompt Framework **延期**（MVP 优先，YAGNI）
- 不新增 Prompt / Workflow / Checklist 基础设施

### 新增（M2 业务层）

- `src/features/students/` — types、errors、validators、mapper、service、actions
- `scripts/m2-student-service.test.mts` — M2 自测
- `.agent/SPRINT_PROGRESS_M2.md`

### 修改

- `package.json` — `test:m2`
- `.agent/STATE.json` — M1 approved，M2 awaiting_review

---

## 2026-06-29 — Sprint 2 M1（数据层）

### 新增

- `.agent/adr/006-student-schema.md` — Student Schema 决策
- `.agent/SPRINT_PROGRESS_M1.md` — M1 进度报告
- `prisma/migrations/20260629120000_init_student/` — init_student 迁移
- `src/shared/lib/db.ts` — Prisma 单例
- `src/features/students/types/student-entity.type.ts` — StudentEntity
- `src/features/students/repositories/student.repository.ts` — 四方法 Repository
- `scripts/m1-student-repository.test.mts` — M1 自测脚本

### 修改

- `prisma/schema.prisma` — Student + StudentStatus
- `package.json` — pg、@prisma/adapter-pg、tsx、test:m1
- `.env.example` — Docker PG 连接示例
- `.agent/DECISIONS.md` — ADR-006 索引
- `.agent/STATE.json` — M1 awaiting_review

### 原因

Sprint 2 M1 按 Implementation Order Step 1–4、9 完成数据层；自测因本机无 PostgreSQL 待 Tech Lead 验证。

---

## 2026-06-29 — Sprint 2 Plan Rev 2（Tech Lead Review）

### 修改

- `specs/student/student.plan.md` — Rev 2
  - **Comment 1（Required）**：Repository 仅返回 `StudentEntity`；Service + Mapper 负责 Entity → ViewModel
  - **Comment 2（Recommended）**：Validator 下沉至 Service；调用链 Action → Service → Validator → Repository

### 修改

- `.agent/STATE.json` — sprint_2_plan: Plan Rev 2 Review

### 原因

Sprint 2 Implementation Plan 首次 Review 反馈；暂停编码，待 Plan Approval。

---

## 2026-06-29 — Sprint 2 Spec Rev 2（Tech Lead Review）

### 修改

- `specs/student.md` — Rev 2：UI 中立化、StudentSummary ViewModel、contactName 必填 / phone 可选、ACTIVE+ARCHIVED、分层规则

### 新增

- `.agent/adr/005-student-household-evolution.md` — Student 未来演进为 Household（当前不实现）

### 修改

- `.agent/DECISIONS.md` — 索引追加 ADR-005
- `.agent/STATE.json` — sprint_2_status: Spec Rev 2 Review

### 原因

Sprint 2 暂停编码，按 Tech Lead Review 修订 Spec；Implementation Plan 暂不更新。

---

## 2026-06-29 — Sprint 2 启动（Spec）

### 新增

- `specs/student.md` — Student Module 功能 Spec（列表、新增、只读详情 Drawer）
- `specs/student-implementation-plan.md` — Sprint 2 实施计划

### 修改

- `.agent/STATE.json` — version 0.2.0，Sprint 2 Spec Review 状态

### 原因

Sprint 2 正式开始；范围缩小为 List / Create / Read-only Drawer，禁止 Edit / Delete / Search 等，待 Tech Lead Review 后编码。

---

## 2026-06-29 — Sprint 1 Review 工程调整

### 变更

- **单一 Git 仓库** — `frontend/` 内容合并至仓库根目录，删除 `frontend/` 嵌套层
- **删除** `backend/` 废弃目录
- **DECISIONS 拆分** — `.agent/adr/001~004` 独立 ADR 文件；`DECISIONS.md` 改为索引
- **ADR-004** — `Student.remainingLesson` 正式列为禁止字段，剩余课时必须实时计算

### 修改

- `package.json` — name 改为 `wenlan-crm`
- `docs/DOMAIN.md` — remainingLesson 开放问题标记为已决策
- `.agent/STATE.json` — version 0.1.1，Sprint 1 Approved with Comments

### 原因

Tech Lead Sprint 1 Review（Approved with Comments）要求，为 Sprint 2 学生管理扫清工程障碍。

---

## 2026-06-29 — Sprint 1 Review

### 新增

- `.agent/SPRINT_REPORT.md` — Sprint 1 完成报告（Review 基准文档）

### 修改

- `.agent/RULES.md` — 第 8 条：每 Sprint 结束必须生成 SPRINT_REPORT
- `.agent/STATE.json` — completed 追加 Sprint 1，last_sprint_report 字段

### 原因

建立 Sprint Review 固定流程；Sprint 1（项目初始化）正式结案，等待 Tech Lead Review。

---

## 2026-06-29 — Sprint 1 项目初始化

### 新增

- `frontend/` — Next.js 15 + TypeScript + TailwindCSS + shadcn/ui 应用
- `frontend/prisma/schema.prisma` — Prisma 初始化（无业务表）
- `frontend/prisma.config.ts` — Prisma 配置
- `frontend/.env.example` — 数据库连接模板
- `frontend/ARCHITECTURE.md` — Feature First 目录约定
- `frontend/src/features/` — 业务功能目录（空）
- `frontend/src/shared/` — 共享组件、lib、hooks、types

### 修改

- `.agent/DECISIONS.md` — ADR-001 ~ ADR-003 技术栈与架构决策
- `.agent/STATE.json` — version 0.1.0，current_task 录入学生，completed 追加 Project Initialization

### 原因

Sprint 1 正式开始，按已确认 Architecture Decision 初始化项目骨架，尚未开发学生管理功能。

---

## 2026-06-29 — Sprint Planning

### 新增

- `docs/ACCEPTANCE.md` — MVP 五项功能验收标准（Given / When / Then，含正常 / 异常 / 边界场景）

### 修改

- `STATE.json` — version 0.0.5，completed 追加 Sprint Planning

### 原因

进入 Sprint Planning 阶段，为 Phase1 MVP 编写可验收的业务标准，供开发与 Review 对齐。

---

## 2026-06-29 — Business Flow Design

### 新增

- `docs/FLOW.md` — 六项核心业务流程（新增学生、购买课时、今日签到、自动扣课时、查看剩余课时、撤销签到）

### 修改

- `STATE.json` — version 0.0.4，completed 追加 Business Flow Design

### 原因

进入 Business Flow Design 阶段，基于 DOMAIN.md 梳理现实业务流转，留待 Tech Lead Review。

---

## 2026-06-29 — Domain Modeling

### 新增

- `docs/DOMAIN.md` — 现实世界业务对象、签到流程分解、remainingLesson 开放问题分析

### 修改

- `STATE.json` — version 0.0.3，completed 追加 Domain Modeling

### 原因

进入 Domain Modeling 阶段，从业务视角定义对象与行为，remainingLesson 存算问题留待 Tech Lead Review。

---

## 2026-06-29 — Product Planning

### 修改

- `PROJECT.md` — 重写项目目标与 MVP 边界，聚焦「课时闭环」三件事
- `TASKS.md` — 按 Phase1/2/3 重组，移除全部技术词，改为用户可感知功能
- `STATE.json` — 精简为 version / phase / current_task / completed / last_update

### 原因

进入 Product Planning 阶段，明确 MVP 范围，任务与状态对齐产品视角。

---

## 2026-06-29 — 初始化

### 新增

- `.agent/` — AI Native 工作流目录
  - `PROJECT.md` — 项目目标与 MVP 定义
  - `TASKS.md` — 任务看板（第一版）
  - `STATE.json` — 项目状态快照
  - `DECISIONS.md` — 架构决策记录
  - `CHANGELOG.md` — 变更日志
  - `REVIEW.md` — 人工 Review 与重构备忘
  - `RULES.md` — AI 工作流规则
- `frontend/` — 前端目录（空）
- `backend/` — 后端目录（空）
- `database/` — 数据库目录（空）
- `docs/` — 文档目录（空）
- `scripts/` — 脚本目录（空）

### 原因

初始化 AI Native Project Workflow，建立项目骨架与协作规范，尚未安装依赖或编写业务代码。