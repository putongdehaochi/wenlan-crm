# Sprint 4 Progress Report — M2（Validator / Mapper / Service / Actions）

> **里程碑**：M2 — Validator / Mapper / Service / Actions  
> **日期**：2026-06-30  
> **状态**：✅ APPROVED（2026-06-30 Tech Lead Review）  
> **前置**：M1 APPROVED

---

## 1. 交付内容

| 项 | 说明 |
|----|------|
| Errors | `attendance.errors.ts` |
| Types | `attendance-today-row.type.ts`、`check-in-input.type.ts`、`check-in-result.type.ts` |
| Validator | `check-in.validator.ts` |
| Mapper | `attendance.mapper.ts` — `toTodayRow` / `toTodayRowList` / `toCheckInResult` |
| Service | `attendance.service.ts` — `listTodayAttendance`、`checkInStudent` |
| Actions | `list-today-attendance.action.ts`、`check-in-student.action.ts` |
| ActionResult | `ALREADY_CHECKED_IN`、`INSUFFICIENT_BALANCE`、`AttendanceActionResult` |
| 自测 | `scripts/m2-attendance-service.test.mts` — `npm run test:m2-attendance` |

---

## 2. Check In 固定流程（Tech Lead 契约）

```
Validator
    ↓
studentRepository.findById()
    ↓
attendanceRepository.existsToday()
    ↓
lessonBalanceRepository.getBalance()
    ↓
attendanceRepository.create()
    ↓
Mapper
    ↓
ActionResult
```

**未改变**调用顺序；Repository 不做业务判断。

---

## 3. listTodayAttendance 调用链

```
studentRepository.findAllActive()
    ↓
attendanceRepository.getTodayStatuses(ids, date)
    ↓
lessonBalanceRepository.getBalances(ids)
    ↓
toTodayRowList() → AttendanceTodayRow[]
```

---

## 4. AttendanceTodayRow（UI ViewModel）

| 字段 | 说明 |
|------|------|
| `id` | 学员 ID |
| `name` | 学员姓名 |
| `lessonBalance` | 当前剩余课时 |
| `todayStatus` | `NOT_CHECKED_IN` / `CHECKED_IN` |
| `canCheckIn` | 是否可签到（ACTIVE + 未签 + 余额 ≥ 1） |

业务状态由 Mapper 计算，UI 不自行判断。

---

## 5. 新增错误码

| errorType | 场景 |
|-----------|------|
| `ALREADY_CHECKED_IN` | 当日重复签到 |
| `INSUFFICIENT_BALANCE` | 余额 < 1 |

继续使用 `shared/types/action-result.type.ts`，无新返回协议。

---

## 6. Student Module 零改动

- `student.service.ts` **未修改**
- 无 Attendance Repository / Service 调用
- 签到后 `listStudentsAction` / `getStudentAction` 余额自动反映（经 `lesson-balance.repository`）

---

## 7. 验证

| 命令 | 结果 |
|------|------|
| `npm run test:m2-attendance` | ✅ |
| `npm run test:m1-attendance` | ✅ 回归 |
| `npm run test:m2-lesson` | ✅ 回归 |
| `npm run test:m4` | ✅ 回归 |
| `npm run test:m4-lesson` | ✅ 回归 |

---

## 8. 未做（M3）

- `/attendance` 页面与 UI 组件
- M4 验收脚本 `test:m4-attendance`

---

## 9. 下一步

Tech Lead Review M2 → 通过后 **M3（Attendance UI）**

---

**M2 已批准，M3 开发已完成。**
