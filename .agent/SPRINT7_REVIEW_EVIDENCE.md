# Sprint 7 Review Evidence

> **日期**：2026-07-01  
> **用途**：M4 Final Review 证据包  
> **状态**：✅ APPROVED（2026-07-02 Tech Lead Final Review）→ Sprint 7 CLOSED

---

## Evidence 1 — Acceptance Matrix（specs/attendance-audit.md §6）

### 6.1 Audit List


| 锚点  | 场景                 | 脚本输出       | 源码                                        |
| --- | ------------------ | ---------- | ----------------------------------------- |
| AL1 | 3 VALID + 1 VOIDED | `§6.1 AL1` | `m4-attendance-audit-acceptance.test.mts` |
| AL2 | status=VALID       | `§6.1 AL2` | 同上                                        |
| AL3 | dateFrom/dateTo    | `§6.1 AL3` | 同上                                        |
| AL4 | studentId          | `§6.1 AL4` | 同上                                        |
| AL5 | 空列表 success        | `§6.1 AL5` | 同上                                        |


### 6.2 Audit Timeline


| 锚点  | 场景                        | 脚本输出           | 源码  |
| --- | ------------------------- | -------------- | --- |
| AT1 | 仅 CHECK_IN                | `§6.2 AT1`     | 同上  |
| AT2 | CHECK_IN → VOID 升序        | `§6.2 AT2`     | 同上  |
| AT3 | CHECK_IN → VOID → RESTORE | `§6.2 AT3/AT5` | 同上  |
| AT4 | NOT_FOUND                 | `§6.2 AT4`     | 同上  |
| AT5 | Restore 后 VOID 保留         | `§6.2 AT3/AT5` | 同上  |


### 6.3 Statistics


| 锚点  | 场景             | 脚本输出       | 源码  |
| --- | -------------- | ---------- | --- |
| ST1 | 口径 §3.3        | `§6.3 ST1` | 同上  |
| ST2 | 日期范围           | `§6.3 ST2` | 同上  |
| ST3 | studentRank 降序 | `§6.3 ST3` | 同上  |
| ST4 | 无数据全 0         | `§6.3 ST4` | 同上  |


### 6.4 回归


| 锚点  | 场景                          | 脚本输出      | 源码  |
| --- | --------------------------- | --------- | --- |
| R1  | void/restore Action         | `§6.4 R1` | 同上  |
| R2  | listAttendanceHistory       | `§6.4 R2` | 同上  |
| R3  | checkInStudent              | `§6.4 R3` | 同上  |
| R4  | listStudents 余额             | `§6.4 R4` | 同上  |
| R5  | Statistics 无 studentService | `§6.4 R5` | 同上  |
| R6  | Audit UI Action Only        | `§6.4 R6` | 同上  |


---

## Evidence 2 — Audit Integration Checklist

```
voidAttendanceAction
        ↓
listAttendanceAuditAction → lastEventType=VOID
        ↓
getAttendanceAuditTimelineAction → events 升序 + label
        ↓
AttendanceAuditTimelinePanel（UI 只读渲染 event.label）
```

脚本输出：`Audit Integration（voidAttendanceAction → lifecycle）`

---

## Evidence 3 — Timeline Snapshot

```
CHECK_IN  → label: 签到
VOID      → label: 撤销
RESTORE   → label: 恢复

Mapper 升序 → UI 直接 map(events) → 无 sort / 无 eventType 分支
```

静态审计：`attendance-audit-timeline-panel.tsx` — 无 `.sort(` · 无 `eventType ===`

---

## Evidence 4 — Statistics Flow

```
getAttendanceStatisticsAction
        ↓
attendanceStatisticsService
        ↓
attendanceStatisticsRepository（aggregate）
        ↓
studentRepository.findByIds
        ↓
attendance-statistics.mapper（ranking + summary）
        ↓
AttendanceStatisticsSummaryView（纯展示）
```

静态审计：`attendance-statistics-summary.tsx` — 无 `.reduce(` · 无 `studentRank.sort`

---

## Evidence 5 — Navigation Graph

```
Today (/attendance)
    ↔ History (/attendance/history)
    ↔ Audit (/attendance/audit)
    ↔ Statistics (/attendance/statistics)
    ↔ Students (/students)

Student Detail → /attendance/audit?studentId={id}
Student Detail → /attendance/history?studentId={id}
```

组件：`attendance-nav-links.tsx` · `student-detail-view.tsx`

---

## Evidence 6 — Full Regression Log


| 命令                                      | 结果  |
| --------------------------------------- | --- |
| `npm run test:m4-attendance-audit`      | ✅   |
| `npm run test:m4-attendance-restore`    | ✅   |
| `npm run test:m4-attendance-history`    | ✅   |
| `npm run test:m4-attendance`            | ✅   |
| `npm run test:m4`                       | ✅   |
| `npm run test:m4-lesson`                | ✅   |
| `npm run test:m2-attendance-audit`      | ✅   |
| `npm run test:m2-attendance-statistics` | ✅   |
| `npm run test:m2-attendance-restore`    | ✅   |
| `npm run test:m2-attendance-history`    | ✅   |
| `npm run test:m2-attendance`            | ✅   |
| `npm run test:m2`                       | ✅   |
| `npm run test:m2-lesson`                | ✅   |
| `npm run test:m1-attendance-audit`      | ✅   |
| `npm run test:m1-attendance-statistics` | ✅   |
| `npm run test:m1-attendance-restore`    | ✅   |
| `npm run test:m1-attendance-history`    | ✅   |
| `npm run test:m1-attendance`            | ✅   |
| `npm run test:m1`                       | ✅   |
| `npm run test:m1-lesson`                | ✅   |
| `npm run build`                         | ✅   |


**合计：20 条 test 命令 + build — All Passed**

---

## Evidence 7 — Build Routes

```
ƒ /attendance/audit
ƒ /attendance/history
ƒ /attendance/statistics
○ /attendance
○ /students
```

---

**Tech Lead Final Review APPROVED — Sprint 7 CLOSED（2026-07-02）**
