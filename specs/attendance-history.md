# Attendance History & Undo Spec — Sprint 5

> **状态：Rev 3 — Tech Lead RC1～RC5 已响应，待最终批准**
>
> 本文档定义 Sprint 5「签到历史 + 撤销签到」范围，不含源码，不绑定 UI 实现。
>
> 依据：`docs/FLOW.md` §6 · `docs/ACCEPTANCE.md` · ADR-007 · ADR-009 · ADR-011 · Sprint 4 已交付能力

---

## 1. Business Goal

### 1.1 Sprint 5 目标

为书法工作室老师提供**签到历史查询**与**撤销签到**能力，在 Phase2 扩展到课运营能力。


| 能力                          | 说明                          |
| --------------------------- | --------------------------- |
| **Attendance History List** | 按签到日期倒序展示历史记录（含已撤销）         |
| **Student History Filter**  | 支持查看指定学员签到历史                |
| **Undo Attendance**         | 将有效签到标记为 `VOIDED`，余额经公式自动恢复 |
| **History ViewModel**       | 完整 ViewModel；UI 不拼装业务字段     |


### 1.2 业务价值

- 完成 Phase2 任务「查看签到记录」「撤销签到」（`TASKS.md`）
- 老师可核对历史到课，并纠正误操作
- 复用 Sprint 4 `Attendance` 模型与 `VOIDED` 状态预留，**无 Schema 变更**
- 为 Restore / Edit / Audit / Statistics 预留数据基础（Future Scope）

### 1.3 与既有闭环的关系

```
Student → Lesson Package → Attendance (VALID / VOIDED) → Lesson Balance
                              ↑
              Sprint 5：History 只读 + Undo 写 status
```

Sprint 5 **不修改** `student.service`、`lesson-balance.repository` 契约、Sprint 4 Check-in API 行为。

---

## 2. User Story

### 2.1 查看全部签到历史

```
作为书法工作室老师，
我希望在「签到历史」页面看到所有学员的历史签到（按日期从新到旧），
以便核对近期到课情况。
```

### 2.2 查看指定学员签到历史

```
作为书法工作室老师，
我希望从学员详情进入后只看到该学员的签到历史，
以便快速了解其到课记录。
```

### 2.3 撤销误操作签到

```
作为书法工作室老师，
我希望在历史列表中撤销一条错误的有效签到，
以便课时余额自动恢复且记录仍可追溯。
```

### 2.4 空历史

```
作为书法工作室老师，
当尚无签到记录时，我希望看到明确空状态，
而不是空白页或报错。
```

---

## 3. Scope（Sprint 5 做）


| 项              | 说明                                         |
| -------------- | ------------------------------------------ |
| **History 页面** | `/attendance/history`                      |
| **历史列表**       | 签到日期、学员姓名、状态（有效 / 已撤销）                     |
| **排序**         | `attendanceDate DESC`，同日内 `createdAt DESC` |
| **学员筛选**       | 可选 `studentId`（query 参数）                   |
| **撤销签到**       | History 行内「撤销」；`VALID → VOIDED`            |
| **ViewModel**  | `AttendanceHistoryRow`（含 `canVoid`）        |
| **入口**         | `/attendance` 导航；Student 详情跳转带 `studentId` |
| **Acceptance** | §7 Given / When / Then                     |


---

## 4. Business Rules

### 4.1 历史查询


| 规则   | 说明                                           |
| ---- | -------------------------------------------- |
| 只读查询 | `listAttendanceHistory` 仅 SELECT             |
| 状态展示 | 展示 `VALID` 与 `VOIDED`                        |
| 排序   | 按 `attendanceDate` 倒序                        |
| 全量加载 | 无分页（MVP 单人工作室）                               |
| 归档学员 | 历史记录仍展示                                      |
| 学员姓名 | Service 层 `studentRepository.findByIds` 批量装配 |


### 4.2 撤销签到（Undo）


| 规则                            | 处理位置                                              |
| ----------------------------- | ------------------------------------------------- |
| 仅 `VALID` 可撤销                 | Service                                           |
| 撤销 = `UPDATE status → VOIDED` | Repository `voidById`                             |
| **禁止**物理 DELETE               | ADR-011                                           |
| 撤销后余额                         | `lessonBalanceRepository` 公式自动 +1（VALID COUNT −1） |
| 撤销后今日状态                       | `existsToday` 仅查 VALID → 当日显示「未签到」                |
| 已 `VOIDED` 再撤销                | `ALREADY_VOIDED`                                  |
| 记录不存在                         | `ATTENDANCE_NOT_FOUND`                            |
| 单笔操作                          | 每次撤销一条 `attendanceId`                             |


### 4.3 撤销与今日签到交互（重要）


| 场景          | 行为                                                                       |
| ----------- | ------------------------------------------------------------------------ |
| 撤销今日有效签到    | 余额恢复；今日名单显示未签到                                                           |
| 撤销后再次签到（同日） | **Sprint 5 不保证**（DB `unique(studentId, attendanceDate)` 阻止 `create` 第二条） |
| 同日再签到       | 归入 **Future Scope — Restore**（`VOIDED → VALID`）                          |


> Sprint 4 `checkInStudent` API **不修改**；误签当日撤销后，再签到需后续 Restore 能力。

### 4.4 架构规则


| 规则                 | 说明                                                |
| ------------------ | ------------------------------------------------- |
| Feature First      | 扩展 `features/attendance/`                         |
| Action First       | UI 仅调用 Action                                     |
| Student Service    | **禁止修改**                                          |
| Balance Repository | **禁止修改**契约（`getBalance` / `getBalances` 签名不变）     |
| Check-in API       | `checkInStudent` / `listTodayAttendance` **行为不变** |
| Service 互调         | **禁止**                                            |


---

## 5. Error Rules

沿用 `shared/types/action-result.type.ts`；**扩展** `ActionErrorType`（不新建协议）。

### 5.1 History 查询


| errorType           | 场景               | 默认 message        |
| ------------------- | ---------------- | ----------------- |
| `VALIDATION_ERROR`  | `studentId` 格式非法 | 字段级 `fieldErrors` |
| `STUDENT_NOT_FOUND` | 筛选学员不存在          | 找不到该学员            |
| `INTERNAL_ERROR`    | 未预期异常            | 操作失败，请稍后重试        |


### 5.2 撤销签到


| errorType              | 场景                | 默认 message        |
| ---------------------- | ----------------- | ----------------- |
| `VALIDATION_ERROR`     | `attendanceId` 非法 | 字段级 `fieldErrors` |
| `ATTENDANCE_NOT_FOUND` | 记录不存在             | 找不到该签到记录          |
| `ALREADY_VOIDED`       | 已是 VOIDED         | 该签到已撤销            |
| `INTERNAL_ERROR`       | 未预期异常             | 操作失败，请稍后重试        |


### 5.3 Sprint 4 错误码

`ALREADY_CHECKED_IN`、`INSUFFICIENT_BALANCE` 等 **不变**。

---

## 6. Out of Scope（Sprint 5 不做）


| 禁止项                               | 说明             |
| --------------------------------- | -------------- |
| 物理 DELETE                         | 仅 `VOIDED` 软撤销 |
| Restore（VOIDED → VALID）           | Future Scope   |
| Edit 签到日期 / 学员                    | Future Scope   |
| 搜索 / 分页 / 导出                      | 不做             |
| 数据统计 / 报表                         | 不做             |
| 班级 / 教师                           | MVP 单人工作室      |
| Schema 变更                         | 不修改 Prisma     |
| History 展示 `lessonBalance`        | 非本 Sprint 目标   |
| 修改 `student.service`              | 零侵入            |
| 修改 `lesson-balance.repository` 契约 | ADR-007        |
| 修改 Sprint 4 Check-in 流程顺序         | 冻结             |


---

## 7. Acceptance（Given / When / Then）

> 验收：真实 PostgreSQL + Action 层；锚点 `// §5.x #N`（M4 脚本）。

### 7.1 History


| #   | Given                     | When                                                  | Then                               |
| --- | ------------------------- | ----------------------------------------------------- | ---------------------------------- |
| H1  | 小明 3 条 VALID（6/1、6/3、6/5） | `listAttendanceHistoryAction()`                       | 3 条；倒序 6/5→6/3→6/1；含 `studentName` |
| H2  | 同上                        | `listAttendanceHistoryAction({ studentId })`          | 仅小明 3 条                            |
| H3  | 小明 2 条、小红 1 条             | `listAttendanceHistoryAction()`                       | 3 条；姓名正确                           |
| H4  | 无签到                       | `listAttendanceHistoryAction()`                       | `success: true`，`data: []`         |
| H5  | 无效 `studentId`            | `listAttendanceHistoryAction({ studentId: invalid })` | `STUDENT_NOT_FOUND`                |
| H6  | 归档学员有 2 条历史               | `listAttendanceHistoryAction({ studentId })`          | 仍返回 2 条                            |


### 7.2 Undo


| #   | Given                  | When                                     | Then                                          |
| --- | ---------------------- | ---------------------------------------- | --------------------------------------------- |
| U1  | 小明余额 7（今日已签 1 条 VALID） | `voidAttendanceAction({ attendanceId })` | `success`；`status → VOIDED`；余额 8              |
| U2  | 同上记录已 VOIDED           | 再次 `voidAttendanceAction`                | `ALREADY_VOIDED`；余额不变                         |
| U3  | 不存在 `attendanceId`     | `voidAttendanceAction`                   | `ATTENDANCE_NOT_FOUND`                        |
| U4  | 撤销后                    | `listAttendanceHistoryAction()`          | 该行 `status=VOIDED`，`canVoid=false`            |
| U5  | 撤销今日签到                 | `listTodayAttendanceAction()`            | 小明 `NOT_CHECKED_IN`（若仍有余额则 `canCheckIn=true`） |


### 7.3 回归


| #   | Given         | When                   | Then                      |
| --- | ------------- | ---------------------- | ------------------------- |
| R1  | Sprint 4 签到流程 | `checkInStudentAction` | 仍成功；行为不变                  |
| R2  | 撤销后           | `listStudentsAction`   | `lessonBalance` 与公式一致     |
| R3  | UI 分层         | import 审计              | 无 Service / Repository 直连 |


---

## 8. ViewModel

### 8.1 AttendanceHistoryRow（冻结 — RC4）

| 字段 | 类型 | Sprint 5 UI 展示 | 说明 |
|------|------|------------------|------|
| `id` | `string` | — | 签到记录 ID |
| `studentId` | `string` | 否（预留） | 学员 ID |
| `studentName` | `string` | ✅ | 姓名（Mapper 装配） |
| `attendanceDate` | `string` | ✅ | 签到业务日 `YYYY-MM-DD` |
| `quantityConsumed` | `number` | 否（预留） | 消耗课时数；Sprint 5 恒为 `1`（VALID 记录） |
| `status` | `VALID` \| `VOIDED` | ✅ | 签到状态 |
| `checkedInAt` | `string` | 可选 | 签到创建时间 ISO（来自 `createdAt`） |
| `voidedAt` | `string \| null` | 否（预留） | Sprint 5 恒 `null`；Audit Sprint 后填入 |
| `canVoid` | `boolean` | ✅ | 是否可撤销（`status === VALID`） |

**规则**

- ViewModel 一次设计完整；Restore / Export / Audit 无需改接口
- `quantityConsumed` / `voidedAt` 由 Mapper 装配，UI Sprint 5 可不展示
- UI **禁止**自行计算 `canVoid` 或 `quantityConsumed`


### 8.2 VoidAttendanceResult（撤销成功）


| 字段               | 说明                 |
| ---------------- | ------------------ |
| `attendanceId`   | 记录 ID              |
| `studentId`      | 学员 ID              |
| `attendanceDate` | 签到日                |
| `status`         | `VOIDED`           |
| `lessonBalance`  | 撤销后余额（可选，便于 UI 提示） |


---

## 9. 页面结构（概要）

### 9.1 路由


| 路由                                   | 说明                      |
| ------------------------------------ | ----------------------- |
| `/attendance/history`                | 签到历史                    |
| `/attendance/history?studentId={id}` | 指定学员                    |
| `/attendance`                        | 增加「签到历史」入口（Check-in 不变） |


### 9.2 线框

```
┌─────────────────────────────────────────────────────────┐
│  签到历史                    [← 今日签到]  [← 学生管理]  │
├─────────────────────────────────────────────────────────┤
│  签到日期   │ 学员姓名 │ 状态     │ 操作                │
│  2026-06-29 │ 小明     │ 有效     │ [撤销]              │
│  2026-06-28 │ 小红     │ 已撤销   │ —                   │
└─────────────────────────────────────────────────────────┘
```

撤销成功后：**全量刷新** `listAttendanceHistoryAction()`（与 Sprint 4 刷新策略一致）。

---

## 10. Future Scope


| 能力             | 说明                       | 依赖                                 |
| -------------- | ------------------------ | ---------------------------------- |
| **Restore**    | `VOIDED → VALID`；支持同日再签到 | `attendanceRepository.restoreById` |
| **Edit**       | 修正签到日（极少用）               | 新 ADR                              |
| **Audit**      | 撤销人、撤销时间                 | Schema 扩展                          |
| **Statistics** | 月签到率、课消汇总                | 只读聚合                               |
| **分页 / 筛选**    | 日期范围、状态筛选                | `findHistory` 扩展入参                 |
| **搜索**         | 按姓名搜索                    | Service 层组合                        |
| **导出**         | CSV                      | 独立 Action                          |


---

## 11. Open Questions（待 Tech Lead 确认）


| #   | 问题                                                      | 建议默认                        |
| --- | ------------------------------------------------------- | --------------------------- |
| 1   | 历史路由 `/attendance/history`？                             | 是                           |
| 2   | 撤销是否需二次确认 Dialog？                                       | 是（UI）                       |
| 3   | `VoidAttendanceResult` 是否含 `lessonBalance`？             | 是（便于提示）                     |
| 4   | 同日撤销后再签到                                                | Sprint 5 不实现；Future Restore |
| 5   | 新错误码命名 `ALREADY_VOIDED` vs `ATTENDANCE_ALREADY_VOIDED`？ | `ALREADY_VOIDED`（简短）        |


---

## 12. Implementation Notes

- Feature：`features/attendance/` 扩展
- **无 Schema 变更**
- 扩展 `attendanceRepository`：`findById`、`findHistory`、`void`（Sprint 4 方法不变）
- 可能扩展 `studentRepository.findByIds`（Attendance Service 消费；**非** student.service）
- Sprint 2～4 已通过 Review 的设计 **不得修改**

---

**状态：Rev 3 — 待 Tech Lead 最终批准。批准后进入 M1。**