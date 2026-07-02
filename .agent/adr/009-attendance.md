# ADR-009：Attendance Schema 与签到扣课规则

| 项 | 内容 |
|----|------|
| 状态 | 已采纳（Sprint 4 Design APPROVED） |
| 日期 | 2026-06-29 |
| 决策者 | Tech Lead Review |
| 关联 | ADR-007 · `specs/attendance.md` |

---

## 背景

Sprint 3 完成后，余额公式中「有效签到数」恒为 0。Sprint 4 引入快速签到，需要：

1. 持久化到课事实（`Attendance`）
2. 签到成功使 `lessonBalance` 自动 −1（经公式，非写库扣减）
3. 不破坏 ADR-007 已批准的余额 API 与 `student.service` 稳定性

`docs/FLOW.md` §3–§4 与 `docs/ACCEPTANCE.md` §3–§4 定义了签到与自动扣课业务规则。

---

## 决策

### 1. Attendance 持久化模型

新增 `attendances` 表：

| 列 | 说明 |
|----|------|
| `id` | cuid 主键 |
| `student_id` | FK → students |
| `attendance_date` | 业务日（Date，自然日） |
| `status` | `VALID` / `VOIDED` |
| `created_at` | 创建时间 |

**唯一约束**：`@@unique([studentId, attendanceDate])` — 同一学员同一自然日仅一条记录。

**Sprint 4**：仅写入 `status = VALID`。`VOIDED` 预留给 Phase2 撤销签到。

### 2. 扣课方式：公式驱动，非包级写库

| 做法 | Sprint 4 |
|------|----------|
| 创建 `Attendance`（VALID） | ✅ |
| 修改 `LessonPackage.quantity` | ❌ |
| 在 Student 上缓存余额 | ❌ |
| 在 Attendance 上存 `deducted: 1` | ❌ |

**余额公式（ADR-007 启用签到项）**

```
lessonBalance = SUM(LessonPackage.quantity) − COUNT(Attendance WHERE status = VALID)
```

1 条有效签到 ≡ 余额 −1（由 COUNT 体现）。

> MVP **不**实现「从最早课时包扣减」的包级 `consumed` 字段；总余额为权威。未来若需包级审计，另立 Spec / ADR。

### 3. 「今日」定义

- `attendanceDate` 使用 **Date** 类型（无时分秒业务语义）
- Sprint 4 默认：**服务器本地日历日** `YYYY-MM-DD` 作为「今日」
- `listTodayAttendance` 与 `checkIn` 默认使用当日；可选入参 `attendanceDate` 供测试

### 4. 签到前置条件（Service 层）

| 条件 | 失败 errorType |
|------|----------------|
| 学员存在 | `STUDENT_NOT_FOUND` |
| 学员 `ACTIVE` | `STUDENT_ARCHIVED` |
| 今日无有效签到 | `ALREADY_CHECKED_IN` |
| `lessonBalance ≥ 1` | `INSUFFICIENT_BALANCE` |

校验失败 **禁止** 创建 Attendance。

### 5. 余额 Repository 唯一变更点

Sprint 4 **仅允许**修改：

```
features/lessons/repositories/lesson-balance.repository.ts
    └── computeBalances() 内部实现
```

**禁止修改**

- `getBalances` / `getBalance` 方法签名
- `student.service.ts` 业务逻辑
- `student.mapper.ts`
- UI 层余额计算

### 6. Feature 边界

| 模块 | 职责 |
|------|------|
| `features/attendance/` | 签到写入、今日名单 ViewModel |
| `features/lessons/` | 余额聚合（含签到 COUNT） |
| `features/students/` | 档案与展示；**不**感知签到业务 |

跨 Feature 只读：

- `attendanceService` → `studentRepository`、`lessonBalanceRepository`

**禁止** Service 互调。

### 7. Action 契约

扩展 `shared/types/action-result.type.ts` 的 `ActionErrorType`：

- `ALREADY_CHECKED_IN`
- `INSUFFICIENT_BALANCE`

不新建 Attendance 专属 `ActionResult` 类型。

---

## 原因

| 原因 | 说明 |
|------|------|
| 单一事实来源 | 签到记录为扣课依据；余额为派生值 |
| ADR-007 衔接 | 公式已在 Rev 2 预留；Sprint 4 启用 |
| student.service 稳定 | 避免签到能力耦合学生业务 |
| 简化 MVP | 无 ClassSession / Teacher / 包级 consumed |
| 可审计 | 签到记录永久保留（撤销仅改 status，Phase2） |

---

## 影响

| 模块 | 变更 |
|------|------|
| `prisma/schema.prisma` | 新增 `Attendance` |
| `lesson-balance.repository` | `computeBalances` 含签到 COUNT |
| `features/attendance/` | 新 Feature 全栈 |
| `student.service` | **无变更** |
| `/attendance` | 新路由 |

---

## 禁止

- 签到时 `UPDATE lesson_packages SET quantity = quantity - 1`
- 在 `Student` 表维护 `remainingLesson`
- `studentService` 调用 `attendanceService`
- 列表/详情在 UI 自行 `balance - 1`
- 同一学员同日两条 `VALID` 记录（DB unique + Service 双检）

---

## 替代方案（已否决）

| 方案 | 否决原因 |
|------|----------|
| 签到直接改 LessonPackage | 与 ADR-007 冲突；多包难维护 |
| 在 Student 上 `-1` 缓存 | ADR-004 |
| 签到页嵌入 `/students` 无独立 Feature | 违反 Feature First |
| DateTime 代替 Date 判「今日」 | 业务日为自然日；简化重复签到规则 |

---

## 验收断言（供 Sprint 4 M4）

| 场景 | 期望 |
|------|------|
| 签到前余额 8 | 成功后 7 |
| 重复签到 | 余额不变；`ALREADY_CHECKED_IN` |
| 余额 0 签到 | 无记录；`INSUFFICIENT_BALANCE` |
| `/students` 列表余额 | 与 `lesson-balance.repository` 一致 |

---

## 相关文档

- ADR-007 — lessonBalance 计算规则
- `specs/attendance.md` §4、§6
- `specs/attendance.plan.md` §3、§4、§6
- `docs/FLOW.md` §3、§4
- `docs/ACCEPTANCE.md` §3、§4
