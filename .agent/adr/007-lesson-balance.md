# ADR-007：课时余额计算规则（lessonBalance）


| 项   | 内容                                                         |
| --- | ---------------------------------------------------------- |
| 状态  | 已采纳（Sprint 3 Design Rev 2 APPROVED）                          |
| 日期  | 2026-06-29                                                 |
| 决策者 | Tech Lead Review                                            |
| 关联  | ADR-004 · `specs/lesson.md` · `specs/lesson.plan.md` Rev 2 |


---

## 背景

Sprint 2 完成学生建档后，`StudentSummary` / `StudentDetail` 中的 `lessonBalance` 恒为 `0`。

Sprint 3 引入购课（`LessonPackage`），需要：

1. 在学生列表与详情展示**真实余额**
2. 为 Sprint 4「签到扣课」预留统一公式与稳定 API
3. 继续遵守 ADR-004：**不在 Student 或任何余额缓存列持久化剩余课时**

Tech Lead Design Review 要求：Repository 职责硬拆分、批量余额接口作为正式契约、Student Feature 仅依赖余额读模型。

---

## 决策

### 1. 余额公式（权威定义）

```
lessonBalance(student) = purchasedTotal(student) − validAttendanceTotal(student)
```


| 项                      | 定义                                                         | Sprint 3  | Sprint 4+ |
| ---------------------- | ---------------------------------------------------------- | --------- | --------- |
| `purchasedTotal`       | `SUM(LessonPackage.quantity)` WHERE `studentId`            | ✅         | ✅         |
| `validAttendanceTotal` | `COUNT(Attendance)` WHERE `studentId` AND `status = VALID` | **0**（无表） | ✅         |


### 2. lessonBalance 为 ViewModel 计算字段


| 层面                | 要求                                                           |
| ----------------- | ------------------------------------------------------------ |
| `Student` 表       | **禁止**余额列（ADR-004）                                           |
| `LessonPackage` 表 | 仅存 `quantity`；**禁止** `remaining` / `consumed`                |
| ViewModel         | `StudentSummary.lessonBalance`、`StudentDetail.lessonBalance` |


### 3. Repository 职责拆分（Required Change 1）

**两个 Repository，禁止合并或交叉职责。**

#### lessonPackageRepository — 仅 CRUD


| 允许                       | 禁止              |
| ------------------------ | --------------- |
| `create()`               | 余额聚合            |
| `findByStudentId()`      | `SUM(quantity)` |
| 返回 `LessonPackageEntity` | 感知 Attendance   |


#### lessonBalanceRepository — 仅余额聚合


| 允许                           | 禁止                           |
| ---------------------------- | ---------------------------- |
| 实现余额公式                       | INSERT / UPDATE / DELETE     |
| 读取 `lesson_packages` 聚合      | 被 Student 以外的写路径滥用           |
| Sprint 4 读取 `attendances` 聚合 | 调用 `lessonPackageRepository` |


**Student Feature 跨 Feature 依赖规则**

- ✅ `studentService` → `lessonBalanceRepository`（只读）
- ❌ `studentService` → `lessonPackageRepository`
- ❌ `studentService` → `lessonService`

**Sprint 4 禁止出现的依赖链**

```
Student → LessonPackageRepository → AttendanceRepository   ✗
```

正确路径：

```
Student Service → Lesson Balance Repository（内部聚合 Package + Attendance）
```

### 4. 正式 API 契约（Required Change 2）

`lesson-balance.repository.ts` 在 **Sprint 3 即定义并实现**，Sprint 4 仅改内部实现，**签名不变**。


| 方法            | 签名                                             | 用途                      |
| ------------- | ---------------------------------------------- | ----------------------- |
| `getBalances` | `(studentIds: string[]) → Map<string, number>` | Student List；**禁止 N+1** |
| `getBalance`  | `(studentId: string) → number`                 | Student Detail；购课成功后    |


**列表调用链（固定）**

```
studentRepository.findAllActive()
    → lessonBalanceRepository.getBalances(ids)
    → studentMapper.toSummaryList(entities, balanceMap)
```

**详情调用链（固定）**

```
studentRepository.findById(id)
    → lessonBalanceRepository.getBalance(id)
    → studentMapper.toDetail(entity, balance)
```

Sprint 4 引入 Attendance 后，`studentService` **一行不改**。

### 5. 计算职责归属


| 层                           | 职责                                            |
| --------------------------- | --------------------------------------------- |
| `lesson-balance.repository` | **唯一**公式实现点                                   |
| `lesson-package.repository` | 购课 CRUD；**不算余额**                              |
| `student.service`           | 调用 `getBalances` / `getBalance`；传给 Mapper     |
| `student.mapper`            | 装配 `lessonBalance`；不计算公式                      |
| `lesson.service`            | 购课写 `lessonPackageRepository`；读后 `getBalance` |
| UI / Action                 | **禁止**计算余额                                    |


### 6. 事务边界（Required Change 3）

- Sprint 3 购课：单表 INSERT，**无需** Transaction
- 未来多表写入（Payment / Coupon / Invoice / Audit Log）：**Service 层** `prisma.$transaction`；Repository 接收 `tx`，**禁止** Repository 内开事务
- 余额读取在事务提交**之后**执行

### 7. Action 返回契约（Required Change 5）

Lesson Module **复用** Student Module 同一 `ActionResult` 结构（提取至 `shared/types/action-result.type.ts`）：

```
success | data | errorType | fieldErrors | message
```

Lesson 购课 errorType：`VALIDATION_ERROR` · `STUDENT_NOT_FOUND` · `STUDENT_ARCHIVED` · `INTERNAL_ERROR`

**禁止**新建 Lesson 专属 ActionResult 协议。

### 8. 与签到 Sprint 的衔接

Sprint 4 引入 `Attendance` 后：

- **仅修改** `lesson-balance.repository` 内部 SQL
- `getBalances` / `getBalance` 签名不变
- 签到不直接修改 `LessonPackage.quantity`

---

## 原因


| 原因            | 说明                                  |
| ------------- | ----------------------------------- |
| 单一事实来源        | 购课 + 签到明细为账本；余额为派生值                 |
| 与 ADR-004 一致  | 不缓存余额                               |
| Repository 拆分 | 避免 Sprint 4 职责链腐化                   |
| 稳定 API        | Student Service 不因 Attendance 上线而改动 |
| Feature First | 余额读模型归属 `lessons`；`students` 只消费    |


---

## 影响


| 模块                                   | 变更                                 |
| ------------------------------------ | ---------------------------------- |
| `features/lessons/repositories/`     | 两个独立 Repository                    |
| `features/students/services/`        | 依赖 `lessonBalanceRepository` only  |
| `shared/types/action-result.type.ts` | 两 Feature 共用                       |
| Sprint 4                             | 仅扩展 `lesson-balance.repository` 内部 |


---

## 禁止

- `lessonPackageRepository` 计算或暴露余额聚合
- `studentService` 依赖 `lessonPackageRepository` 或 `lessonService`
- Feature 之间 Service 互调
- 列表场景逐学员 `getBalance`（N+1）
- Student / LessonPackage 持久化余额字段
- Lesson 自建第二套 ActionResult

---

## 替代方案（已否决）


| 方案                          | 否决原因                          |
| --------------------------- | ----------------------------- |
| 单一 Repository 负责购课 + 余额     | Sprint 4 引入 Attendance 后职责链混乱 |
| Student 存 `remainingLesson` | ADR-004                       |
| UI 累加显示余额                   | 违反分层                          |


---

## 验收断言（Sprint 3 M4）


| 场景               | 期望 lessonBalance     |
| ---------------- | -------------------- |
| 无购课              | 0                    |
| 购课 10            | 10                   |
| 10 + 5 两笔        | 15                   |
| `getBalances` 批量 | 与逐学员 `getBalance` 一致 |


---

## 修订记录


| 版本    | 日期         | 变更                                           |
| ----- | ---------- | -------------------------------------------- |
| Rev 1 | 2026-06-29 | 初版                                           |
| Rev 2 | 2026-06-29 | Repository 拆分；正式 API 契约；事务边界；ActionResult 统一 |


---

## 相关文档

- ADR-004 — Student 禁止存储 remainingLesson
- `specs/lesson.md`
- `specs/lesson.plan.md` Rev 2 §3、§6、§7、§9
- `docs/FLOW.md` §2、§5

