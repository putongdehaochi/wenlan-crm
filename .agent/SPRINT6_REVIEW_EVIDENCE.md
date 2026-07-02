# Sprint 6 Review Evidence

> **日期**：2026-07-01  
> **用途**：M4 Final Review 证据包  
> **状态**：✅ APPROVED（2026-07-01 Tech Lead Final Review）→ Sprint 6 CLOSED

---

## Evidence 1 — Acceptance Matrix（specs/attendance-restore.md §5）

### 5.1 Restore


| 锚点  | 场景                           | 脚本输出                                  | 源码                                                |
| --- | ---------------------------- | ------------------------------------- | ------------------------------------------------- |
| RS1 | 余额 8→7，VOIDED→VALID          | `§5.1 RS1 Restore 成功`                 | `m4-attendance-restore-acceptance.test.mts` L186+ |
| RS2 | 再次 Restore → ALREADY_VALID   | `§5.1 RS2 ALREADY_VALID`              | 同上 L196+                                          |
| RS3 | 不存在 id → NOT_FOUND           | `§5.1 RS3 ATTENDANCE_NOT_FOUND`       | 同上 L204+                                          |
| RS4 | 余额 0 → INSUFFICIENT_BALANCE  | `§5.1 RS4 INSUFFICIENT_BALANCE`       | 同上 L248+                                          |
| RS5 | Restore 后 Today CHECKED_IN   | `§5.1 RS5 Restore 后 Today CHECKED_IN` | 同上 L262+                                          |
| RS6 | History canVoid / canRestore | `§5.1 RS6 History ViewModel`          | 同上 L283+                                          |


### 5.2 History Filter


| 锚点  | 场景                  | 脚本输出                      | 源码       |
| --- | ------------------- | ------------------------- | -------- |
| HF1 | dateFrom/dateTo 2 条 | `§5.2 HF1 日期筛选 2 条`       | 同上 L212+ |
| HF2 | studentId + 日期      | `§5.2 HF2 studentId + 日期` | 同上 L220+ |
| HF3 | 无参数 Sprint 5 行为     | `§5.2 HF3 无参数向后兼容`        | 同上 L293+ |
| HF4 | dateFrom > dateTo   | `§5.2 HF4 日期范围无效`         | 同上 L228+ |


### 5.3 回归


| 锚点  | 场景                      | 脚本输出                              | 源码       |
| --- | ----------------------- | --------------------------------- | -------- |
| R1  | voidAttendanceAction 不变 | `§5.3 R1 voidAttendanceAction 回归` | 同上 L330+ |
| R2  | checkInStudentAction 不变 | `§5.3 R2 checkInStudentAction 回归` | 同上 L335+ |
| R3  | listStudents 余额一致       | `§5.3 R3 listStudentsAction 余额一致` | 同上 L346+ |
| R4  | UI Import 审计            | `§5.3 R4 UI Import 审计`            | 同上 L354+ |


---

## Evidence 2 — Restore Regression Checklist

```
restoreAttendanceAction（成功）
        ↓
RestoreAttendanceResult.lessonBalance
        ↓
listAttendanceHistoryAction → status=VALID · canVoid=true
        ↓
listTodayAttendanceAction → CHECKED_IN · lessonBalance 一致
        ↓
listStudentsAction / getStudentAction → lessonBalance 一致
```

脚本输出：`Restore Regression Checklist（History / Today / Students / Balance）`

附加：`checkedInAt` 与原始 `createdAt` 一致（RS5 决策 #3）

---

## Evidence 3 — UI Flow Diagram

```
/attendance/history[?studentId=&dateFrom=&dateTo=]
        ↓
AttendanceHistoryFilter（URL Query 导航）
        ↓
listAttendanceHistoryAction
        ↓
attendanceService.listAttendanceHistory
        ↓
attendanceRepository.findHistory
        ↓
AttendanceHistoryList（ViewModel 渲染）

Restore Button（canRestore）
        ↓
RestoreAttendanceDialog
        ↓
restoreAttendanceAction
        ↓
成功 → listAttendanceHistoryAction 全量刷新
```

---

## Evidence 4 — Query Matrix


| studentId | dateFrom   | dateTo     | Expected（测试数据）        | 结果  |
| --------- | ---------- | ---------- | --------------------- | --- |
| —         | 2026-06-01 | 2026-06-01 | 1 条（全学员）              | ✅   |
| 小明        | 2026-06-01 | 2026-06-01 | 1 条                   | ✅   |
| 小明        | —          | —          | 3 条                   | ✅   |
| —         | 2026-06-03 | 2026-06-05 | 2 条（HF1）              | ✅   |
| 小明        | 2026-06-03 | 2026-06-05 | 2 条（HF2）              | ✅   |
| —         | 2026-06-05 | 2026-06-03 | VALIDATION_ERROR（HF4） | ✅   |


---

## Evidence 5 — Architecture Regression Audit


| 检查项                                              | 结果  |
| ------------------------------------------------ | --- |
| `student.service` 无 attendance 引用                | ✅   |
| `lesson-balance.repository` 契约保留（无 restore/void） | ✅   |
| Restore 链：Service 前置余额校验 → Repository 纯 UPDATE   | ✅   |
| Sprint 4 Check-in（`test:m4-attendance`）          | ✅   |
| Sprint 5 Void（`test:m4-attendance-history`）      | ✅   |
| 无新增 Schema / ADR                                 | ✅   |


---

## Evidence 6 — UI Import Audit


| 文件                              | Action Only | 无 Service/Repo |
| ------------------------------- | ----------- | -------------- |
| `attendance-history-page.tsx`   | ✅           | ✅              |
| `attendance-history-row.tsx`    | ✅（无 Action） | ✅              |
| `restore-attendance-dialog.tsx` | ✅           | ✅              |
| `attendance-history-filter.tsx` | ✅（URL 导航）   | ✅              |
| `void-attendance-dialog.tsx`    | ✅           | ✅              |


UI 读取 `canVoid` / `canRestore`，未出现 `status === VOIDED` 等业务规则。

---

## Evidence 7 — Test Coverage Summary


| 层级              | 命令                           | 结果  |
| --------------- | ---------------------------- | --- |
| M1 Repository   | `test:m1-attendance-restore` | ✅   |
| M2 Service      | `test:m2-attendance-restore` | ✅   |
| M4 Acceptance   | `test:m4-attendance-restore` | ✅   |
| Sprint 2～5 全量回归 | 15 条 `test:*` + `build`      | ✅   |


详见 `.agent/SPRINT6_PROGRESS_M4.md` §4

---

## Evidence 8 — 无新增 ADR

Sprint 6 实现完全落在 ADR-012 设计范围内；M4 未发现需新 ADR 的架构变更。

---

**Tech Lead Final Review APPROVED — Sprint 6 CLOSED（2026-07-01）**