# Sprint 7 Progress Report — M2（Service / Mapper / Actions）

> **里程碑**：M2 — Service / Mapper / Actions  
> **日期**：2026-07-01  
> **状态**：✅ 完成，待 Tech Lead Review  
> **前置**：Sprint 7 M1 APPROVED（S7-M1-REVIEW-001）

---

## 1. 交付内容

| 项 | 说明 |
|----|------|
| Types | `AttendanceAuditListRow` · `AttendanceAuditTimeline` · `AttendanceAuditTimelineEvent` · `AttendanceStatisticsSummary` + Reserved Row Types |
| Validators | `list-attendance-audit` · `get-attendance-audit-timeline` · `get-attendance-statistics` |
| Mappers | `attendance-audit.mapper` · `attendance-statistics.mapper` |
| Service | `attendanceAuditService`（`listAttendanceAudit` · `getAttendanceAuditTimeline`）· `attendanceStatisticsService` |
| Actions | `listAttendanceAuditAction` · `getAttendanceAuditTimelineAction` · `getAttendanceStatisticsAction` |
| History Mapper | `voidedAt` 真实映射（MC-1） |
| 自测 | `test:m2-attendance-audit` · `test:m2-attendance-statistics` |

---

## 2. Service Call Chain Audit

### 2.1 `listAttendanceAudit`（读）

```
listAttendanceAuditAction
  → attendanceService.listAttendanceAudit
  → validateListAttendanceAuditInput
  → studentRepository.findById（仅 studentId 有值）
  → attendanceRepository.findAuditList
  → attendanceLifecycleRepository.findByAttendanceIds
  → studentRepository.findByIds
  → toAttendanceAuditListRowList
  → ActionResult
```

### 2.2 `getAttendanceAuditTimeline`（读）

```
getAttendanceAuditTimelineAction
  → attendanceService.getAttendanceAuditTimeline
  → validateGetAttendanceAuditTimelineInput
  → attendanceRepository.findById
  → ATTENDANCE_NOT_FOUND
  → attendanceLifecycleRepository.findByAttendanceId
  → studentRepository.findById
  → toAttendanceAuditTimeline（升序 + label）
  → ActionResult
```

### 2.3 `getAttendanceStatistics`（读 — RC2 冻结）

```
getAttendanceStatisticsAction
  → attendanceStatisticsService.getAttendanceStatistics
  → validateGetAttendanceStatisticsInput
  → attendanceStatisticsRepository（并行 count / groupBy）
  → studentRepository.findByIds
  → toAttendanceStatisticsSummary（ranking + summary）
  → ActionResult
```

**禁止**：`attendanceStatisticsService → studentService` ✓ 静态审计通过

---

## 3. Mapper Purity Audit

| Mapper | ✔ 负责 | ✘ 禁止（未出现） |
|--------|--------|------------------|
| `attendance-audit.mapper` | Timeline 升序 · label · lastEvent* 派生 | Repository · Service |
| `attendance-statistics.mapper` | studentRank 1-based · consumedLessons · Reserved undefined | Repository · studentService |
| `attendance-history.mapper` | 真实 `voidedAt` ISO 映射 | Repository · 余额计算 |

---

## 4. 验证

| 命令 | 结果 |
|------|------|
| `npm run test:m2-attendance-audit` | ✅ |
| `npm run test:m2-attendance-statistics` | ✅ |
| `npm run test:m1-attendance-audit` | ✅ |
| `npm run test:m1-attendance-statistics` | ✅ |
| `npm run test:m1-attendance-restore` | ✅ |
| `npm run test:m1-attendance-history` | ✅ |
| `npm run test:m1-attendance` | ✅ |
| `npm run test:m2-attendance-history` | ✅ |
| `npm run test:m2-attendance-restore` | ✅ |
| `npm run test:m1` | ✅ |
| `npm run test:m1-lesson` | ✅ |

---

## 5. 不变项

| 模块 | 状态 |
|------|------|
| `checkInStudent` / `voidAttendance` / `restoreAttendance` | 签名与调用链 **无 diff** |
| `listAttendanceHistory` | Sprint 6 行为不变（+voidedAt 真实值） |
| Repository 层 | 零改动 |

---

## 6. 未做（M3）

- `/attendance/audit` · `/attendance/statistics` UI
- 导航链接扩展
- `npm run build` 验收

---

## 7. 下一步

提交本报告 → Tech Lead Review M2 → 通过后 **M3（UI）**

---

**M2 编码已停止，等待 Tech Lead Review。**
