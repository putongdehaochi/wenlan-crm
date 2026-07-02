# Sprint 5 Progress Report — M2（Validator / Mapper / Service / Actions）

> **里程碑**：M2 — Validator / Mapper / Service / Actions  
> **日期**：2026-07-01  
> **状态**：✅ 完成，待 Tech Lead Review  
> **前置**：Sprint 5 M1 APPROVED

---

## 1. 交付内容

| 项 | 说明 |
|----|------|
| Types | `AttendanceHistoryRow` · `VoidAttendanceInput` · `VoidAttendanceResult` |
| Validators | `void-attendance.validator.ts` · `list-attendance-history.validator.ts` |
| Mapper | `attendance-history.mapper.ts` |
| Service | `listAttendanceHistory` · `voidAttendance` |
| Actions | `list-attendance-history.action.ts` · `void-attendance.action.ts` |
| ActionResult | +`ATTENDANCE_NOT_FOUND` · +`ALREADY_VOIDED` |
| 自测 | `npm run test:m2-attendance-history` |

---

## 2. Service Call Chain Audit

### 2.1 `listAttendanceHistory`（读）

```
listAttendanceHistoryAction
  → attendanceService.listAttendanceHistory
  → validateListAttendanceHistoryInput
  → studentRepository.findById (仅 studentId 有值)
  → attendanceRepository.findHistory
  → studentRepository.findByIds
  → toAttendanceHistoryRowList
  → ActionResult
```

### 2.2 `voidAttendance`（写 — 冻结链）

```
voidAttendanceAction
  → attendanceService.voidAttendance
  → validateVoidAttendanceInput
  → attendanceRepository.findById
  → ATTENDANCE_NOT_FOUND
  → ALREADY_VOIDED
  → attendanceRepository.void
  → lessonBalanceRepository.getBalance
  → toVoidAttendanceResult
  → ActionResult
```

Sprint 4 方法 `listTodayAttendance` / `checkInStudent` — **无 diff**。

---

## 3. Validator Contract Summary

### `void-attendance.validator.ts`

| ✔ 负责 | ✘ 禁止 |
|--------|--------|
| `attendanceId` 非空校验 | 判断记录是否存在 |
| trim normalize | 判断是否 VOIDED |

### `list-attendance-history.validator.ts`

| ✔ 负责 | ✘ 禁止 |
|--------|--------|
| 可选 `studentId` 格式 | 判断学员是否存在 |
| 可选 `limit` 正整数 | Repository 调用 |

存在性判断在 Service：`studentRepository.findById` → `STUDENT_NOT_FOUND`。

---

## 4. Mapper Purity Audit

`attendance-history.mapper.ts` 源码审计：

| ✔ 负责 | ✘ 禁止（未出现） |
|--------|------------------|
| Entity → ViewModel 字段映射 | `attendanceRepository` |
| `formatAttendanceDate` | `studentRepository` |
| `canVoid` / `quantityConsumed` 装配 | `lessonBalanceRepository` |
| | `getBalance` 调用 |

`lessonBalance` 仅在 `VoidAttendanceResult` 中由 Service 传入 Mapper，Mapper 不计算余额。

---

## 5. Action Import Audit

| Action | 导入 | 合规 |
|--------|------|------|
| `list-attendance-history.action.ts` | `attendanceService` only | ✅ |
| `void-attendance.action.ts` | `attendanceService` only | ✅ |

无 Repository 直连 · 无跨 Feature Service 互调。

---

## 6. ActionResult 扩展

```typescript
ActionErrorType +=
  | "ATTENDANCE_NOT_FOUND"
  | "ALREADY_VOIDED"
```

沿用统一 `{ success, data?, errorType?, fieldErrors?, message? }` 协议。

---

## 7. 验证

| 命令 | 结果 |
|------|------|
| `npm run test:m2-attendance-history` | ✅ |
| `npm run test:m2` | ✅ |
| `npm run test:m2-lesson` | ✅ |
| `npm run test:m2-attendance` | ✅ |
| `npm run test:m4` | ✅ |
| `npm run test:m4-lesson` | ✅ |
| `npm run test:m4-attendance` | ✅ |

---

## 8. 不变项

| 模块 | 状态 |
|------|------|
| `student.service` | 零改动 |
| `lesson.service` | 零改动 |
| `lesson-balance.repository` | 契约未变 |
| Prisma Schema | 无变更 |
| Sprint 4 Check-in Actions | 行为不变 |

---

## 9. 未做（M3）

- `/attendance/history` 页面
- History 列表 UI · Undo 确认 Dialog
- `npm run build` UI 验证

---

## 10. 下一步

提交本报告 → Tech Lead Review M2 → 通过后 **M3（UI）**

---

**M2 编码已停止，等待 Tech Lead Review。**
