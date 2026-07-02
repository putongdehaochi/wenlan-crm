# Sprint 4 Progress Report — M1（Schema / Repository）

> **里程碑**：M1 — Schema / Repository  
> **日期**：2026-06-29  
> **状态**：✅ APPROVED（2026-06-29 Tech Lead Review）  
> **前置**：Sprint 4 Design APPROVED

---

## 1. 交付内容

| 项 | 说明 |
|----|------|
| Prisma Schema | `Attendance` + `AttendanceStatus`（VALID / VOIDED） |
| Migration | `20260629160000_init_attendance` |
| ADR-009 | 已采纳 |
| ADR-010 | Attendance Prisma Schema（M1） |
| Entity | `attendance-entity.type.ts` |
| Repository | `attendance.repository.ts` |
| 余额公式 | `lesson-balance.repository.ts` — `computeBalances` 含签到 COUNT |
| 自测 | `scripts/m1-attendance-repository.test.mts` — `npm run test:m1-attendance` |

---

## 2. attendanceRepository（Tech Lead 契约）

| 方法 | 职责 |
|------|------|
| `create` | 插入 VALID 签到 |
| `existsToday` | 单学员今日是否已签 |
| `getTodayStatuses` | 批量返回已签 studentId 集合 |

**无** `getBalance` / `getBalances` / LessonPackage 写入

---

## 3. lesson-balance.repository（唯一余额变更）

```
balance = SUM(LessonPackage.quantity) − COUNT(Attendance WHERE status = VALID)
```

- `getBalances` / `getBalance` **签名不变**
- `student.service` **未修改**

---

## 4. 验证

| 命令 | 结果 |
|------|------|
| `npx prisma migrate deploy` | ✅ |
| `npm run test:m1-attendance` | ✅ |
| `npm run test:m1-lesson` | ✅ 回归 |
| `npm run test:m1` | ✅ 回归 |

---

## 5. 未做（M2）

- Validator / Mapper / Service / Actions
- `shared/action-result` 扩展 errorType
- `/attendance` UI

---

## 6. 下一步

Tech Lead Review M1 → 通过后 **M2（Validator / Service / Actions）**

---

**M1 已批准，M2 开发已完成。**
