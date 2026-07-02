# Sprint 6 Progress Report — M2（Validator / Mapper / Service / Actions）

> **里程碑**：M2 — Validator / Mapper / Service / Actions  
> **日期**：2026-07-01  
> **状态**：✅ 完成，待 Tech Lead Review  
> **前置**：Sprint 6 M1 APPROVED

---

## 1. 交付内容

| 项 | 说明 |
|----|------|
| Types | `RestoreAttendanceInput` · `RestoreAttendanceResult` · `AttendanceHistoryRow` +`canRestore`（Reserved 字段声明） |
| Validators | `restore-attendance.validator.ts` · `list-attendance-history.validator.ts` 扩展 `dateFrom`/`dateTo` |
| Mapper | `toRestoreAttendanceResult` · `canRestore` 装配 |
| Service | `restoreAttendance` · `listAttendanceHistory` 透传日期筛选 |
| Actions | `restore-attendance.action.ts` |
| ActionResult | +`ALREADY_VALID` |
| Errors | +`ALREADY_VALID` · +`HISTORY_DATE_RANGE_INVALID` |
| 自测 | `npm run test:m2-attendance-restore` |

---

## 2. Service Call Chain Audit

### 2.1 `restoreAttendance`（写 — 冻结链）

```
restoreAttendanceAction
  → attendanceService.restoreAttendance
  → validateRestoreAttendanceInput
  → attendanceRepository.findById
  → ATTENDANCE_NOT_FOUND
  → ALREADY_VALID
  → lessonBalanceRepository.getBalance
  → INSUFFICIENT_BALANCE
  → attendanceRepository.restore
  → lessonBalanceRepository.getBalance
  → toRestoreAttendanceResult
  → ActionResult
```

### 2.2 `listAttendanceHistory`（读 — 链不变）

```
listAttendanceHistoryAction
  → attendanceService.listAttendanceHistory
  → validateListAttendanceHistoryInput（+dateFrom/dateTo）
  → studentRepository.findById (仅 studentId 有值)
  → attendanceRepository.findHistory（+dateFrom/dateTo）
  → studentRepository.findByIds
  → toAttendanceHistoryRowList
  → ActionResult
```

Sprint 4 `listTodayAttendance` / `checkInStudent` · Sprint 5 `voidAttendance` — **无 diff**。

---

## 3. Validator Contract Summary

### `restore-attendance.validator.ts`

| ✔ 负责 | ✘ 禁止 |
|--------|--------|
| `attendanceId` 非空校验 | 判断记录是否存在 |
| trim normalize | 判断是否 VALID |
| | 判断余额是否不足 |

### `list-attendance-history.validator.ts`（扩展）

| ✔ 负责 | ✘ 禁止 |
|--------|--------|
| 可选 `studentId` / `limit` | 判断学员是否存在 |
| 可选 `dateFrom` / `dateTo` 解析与归一化 | Repository 调用 |
| `dateFrom > dateTo` → `VALIDATION_ERROR` | |

存在性 / 余额 / 状态判断均在 Service。

---

## 4. Mapper Purity Audit

`attendance-history.mapper.ts` 源码审计：

| ✔ 负责 | ✘ 禁止（未出现） |
|--------|------------------|
| `canRestore` = `status === VOIDED` | `attendanceRepository` |
| `toRestoreAttendanceResult` 纯映射 | `lessonBalanceRepository` |
| Reserved 字段未装配 | Service 调用 |

`lessonBalance` 由 Service 查询后传入 Mapper，Mapper 不计算余额。

---

## 5. Action Import Audit

| Action | 导入 | 合规 |
|--------|------|------|
| `restore-attendance.action.ts` | `attendanceService` only | ✅ |

无 Repository 直连 · 无跨 Feature Service 互调。

---

## 6. ActionResult 扩展

```typescript
ActionErrorType +=
  | "ALREADY_VALID"
```

沿用统一 `{ success, data?, errorType?, fieldErrors?, message? }` 协议；既有错误码未修改。

---

## 7. 验收场景覆盖

| 场景 | 结果 |
|------|------|
| RS1 Restore 成功（余额 8→7） | ✅ |
| RS2 ALREADY_VALID | ✅ |
| RS3 ATTENDANCE_NOT_FOUND | ✅ |
| RS4 INSUFFICIENT_BALANCE | ✅ |
| RS5 Restore 后 Today CHECKED_IN | ✅ |
| RS6 History `canVoid` / `canRestore` | ✅ |
| HF1–HF2 日期筛选 | ✅ |
| HF3 无参数向后兼容 | ✅ |
| HF4 `dateFrom > dateTo` | ✅ |

---

## 8. 验证

| 命令 | 结果 |
|------|------|
| `npm run test:m2-attendance-restore` | ✅ |
| `npm run test:m2-attendance-history` | ✅ |
| `npm run test:m2-attendance` | ✅ |
| `npm run test:m2` | ✅ |
| `npm run test:m2-lesson` | ✅ |

---

## 9. 不变项

| 模块 | 状态 |
|------|------|
| `student.service` | 零改动 |
| `lesson.service` | 零改动 |
| `lesson-balance.repository` | 零改动 |
| `attendance.repository`（M1 已交付） | 无 M2 diff |
| Prisma Schema | 无变更 |
| Sprint 4 Check-in · Sprint 5 Void | 行为不变 |

---

## 10. 未做（M3）

- History 页「恢复」按钮与确认 Dialog
- `dateFrom` / `dateTo` 日期筛选 UI
- `npm run build` UI 验证

---

## 11. 下一步

提交本报告 → Tech Lead Review M2 → 通过后 **M3（UI）**

---

**M2 编码已停止，等待 Tech Lead Review。**
