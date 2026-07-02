# Attendance Restore & History Filter Spec — Sprint 6

> **状态：Rev 2 — Tech Lead FINAL APPROVAL**
>
> 本文档定义 Sprint 6「恢复签到 + 历史日期筛选」范围，不含源码。
>
> 依据：ADR-007 · ADR-009 · ADR-011 · ADR-012 · Sprint 5 已交付能力

---

## 1. Business Goal

### 1.1 Sprint 6 目标

在 Sprint 5 History + Undo 基础上，补齐误撤销后的恢复能力，并增强历史查询筛选。

| 能力 | 说明 |
|------|------|
| **Restore Attendance** | `VOIDED → VALID`；余额经 `COUNT(VALID)` 自动重新扣减 |
| **History Date Filter** | `findHistory` 扩展 `dateFrom` / `dateTo`（向后兼容） |
| **History ViewModel** | 最终字段一次定型（RC4）；UI 可不展示预留列 |

### 1.2 业务价值

- 解决 Sprint 5 边界：撤销后无法同日再签（唯一约束保留单行）
- 老师可恢复误撤销记录，Today 名单与余额同步
- 历史可按日期范围查询，为 Sprint 8 Statistics 铺垫
- **无 Schema 变更**；Student / Lesson Module 零侵入

---

## 2. Business Rules

### 2.1 Restore（VOIDED → VALID）

| 规则 | 说明 |
|------|------|
| R1 | 仅 `status === VOIDED` 的记录可恢复 |
| R2 | 恢复后 `status = VALID` |
| R3 | **Restore 消耗 1 个剩余课时**；前置条件 `currentBalance >= 1`（RC1） |
| R4 | 恢复 **不修改** `createdAt`（保留原签到时间） |
| R5 | 恢复 **不** 新建 Attendance 行（同一 `id` UPDATE） |
| R6 | 余额变化由 `COUNT(VALID)` 派生，**不写** LessonPackage |
| R7 | 同日唯一约束不变；Restore 复用原行 |

#### 2.1.1 Restore 余额数学（RC1 — 冻结）

```text
balance = purchased − COUNT(VALID)

Restore 前：balance_before = purchased − n
Restore 后：balance_after  = purchased − (n + 1) = balance_before − 1
```

**前置条件（Service）**

```text
currentBalance >= 1
⟺ balance_after >= 0
⟺ Restore 不会使余额变为负数
```

语义：**Restore 与 Check-in 对称，均消耗 1 课时。** 不满足时返回 `INSUFFICIENT_BALANCE`，**不执行** `restore()`。

### 2.2 History Date Filter

| 规则 | 说明 |
|------|------|
| F1 | `dateFrom` / `dateTo` 可选；不传 = Sprint 5 行为 |
| F2 | 归一化 `toAttendanceDate`（服务器本地自然日边界） |
| F3 | 闭区间：`dateFrom` 含当日 · `dateTo` 含当日 |
| F4 | `dateFrom > dateTo` → `VALIDATION_ERROR` |
| F5 | `status` / `teacherId` / `classId` / `cursor` — **Reserved**，Sprint 6 不实现 |

### 2.3 ViewModel — AttendanceHistoryRow（RC4 — 最终冻结）

| 字段 | Sprint 6 UI | 说明 |
|------|-------------|------|
| `id` | — | 记录 ID |
| `studentId` | 否 | 学员 ID |
| `studentName` | ✅ | 姓名 |
| `attendanceDate` | ✅ | `YYYY-MM-DD` |
| `status` | ✅ | `VALID` \| `VOIDED` |
| `quantityConsumed` | 否 | VALID 恒 1；VOIDED 恒 0 |
| `checkedInAt` | 可选 | 来自 `createdAt` |
| `voidedAt` | 否 | Sprint 6 恒 `null`；Sprint 7+ 见 ADR-012 RC2 |
| `canVoid` | ✅ | `status === VALID` |
| `canRestore` | ✅ | `status === VOIDED` |
| `note?` | 否 | **Reserved** |
| `teacherName?` | 否 | **Reserved** |
| `className?` | 否 | **Reserved** |

---

## 3. Scope

### 3.1 In Scope

| 项 | 说明 |
|----|------|
| `attendanceRepository.restore(id): AttendanceEntity` | RC2 冻结 |
| `FindHistoryInput` 完整 Evolution 类型 | RC3 |
| `restoreAttendance` 冻结调用链 | RC5 |
| History UI | Restore + 日期筛选 |
| `ALREADY_VALID` errorType | 新增 |

### 3.2 Non Scope

Schema · `teacherId`/`classId`/`status`/`cursor` 实现 · Audit 列 · Statistics · Student/Lesson 改动 · DELETE

---

## 4. Required Review Topics

| # | 问题 | Rev 2 决策 |
|---|------|-----------|
| 1 | 余额不足能否 Restore？ | **否**；`currentBalance >= 1`（§2.1.1） |
| 2 | Restore 后 Today 已签？ | **是**（全量刷新） |
| 3 | 恢复原 checkedInAt？ | **是**（不改 `createdAt`） |
| 4 | Filter 向后兼容？ | **是**（可选字段） |
| 5 | Sprint 7 不改 Sprint 6 API？ | **是** |

---

## 5. Acceptance（Given / When / Then）

### 5.1 Restore

| # | Given | When | Then |
|---|-------|------|------|
| RS1 | 余额 8，VOIDED 记录 | `restoreAttendanceAction` | VALID；余额 7 |
| RS2 | 已 VALID | 再次 Restore | `ALREADY_VALID` |
| RS3 | 不存在 id | Restore | `ATTENDANCE_NOT_FOUND` |
| RS4 | 余额 0，VOIDED | Restore | `INSUFFICIENT_BALANCE` |
| RS5 | Restore 成功 | `listTodayAttendanceAction` | 当日 `CHECKED_IN` |
| RS6 | Restore 成功 | History | `canVoid=true` · `canRestore=false` |

### 5.2 History Filter

| # | Given | When | Then |
|---|-------|------|------|
| HF1 | 6/1、6/3、6/5 | `dateFrom=6/3, dateTo=6/5` | 2 条 |
| HF2 | 组合 studentId + 日期 | 筛选 | 正确 |
| HF3 | 无参数 | `listAttendanceHistoryAction()` | Sprint 5 行为 |
| HF4 | `dateFrom > dateTo` | 筛选 | `VALIDATION_ERROR` |

### 5.3 回归

| # | 场景 | Then |
|---|------|------|
| R1 | `voidAttendanceAction` | 不变 |
| R2 | `checkInStudentAction` | 不变 |
| R3 | `listStudentsAction` | 余额公式一致 |
| R4 | UI import 审计 | Action Only |

---

## 6. 页面结构（概要）

`/attendance/history` — +Restore 按钮 · +日期筛选 · 全量刷新策略不变。

---

## 7. Future Scope

Sprint 7 Audit · Sprint 8 Statistics · `teacherId`/`classId`/`status`/`cursor` 筛选实现

---

**Rev 2 — 2026-07-01 — RC1～RC5 响应，待 Tech Lead Final Approval**
