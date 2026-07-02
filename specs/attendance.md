# Attendance Module Spec — Sprint 4

> **状态：待 Tech Lead Review（Rev 1）**
>
> 本文档定义 Sprint 4 快速签到模块范围，不含源码，不绑定 UI 组件实现。
>
> 依据：`docs/FLOW.md` §3–§4 · `docs/ACCEPTANCE.md` §3–§4 · ADR-007 · ADR-009

---

## 1. 功能目标

### 1.1 Sprint 4 目标

为书法工作室老师提供**今日快速签到**能力，签到成功即产生有效到课记录并**自动扣减 1 节课时**（通过余额公式体现，不落库扣减字段）：


| 能力                        | 说明                          |
| ------------------------- | --------------------------- |
| **Today Attendance List** | 一屏展示全部在读学员、课时余额、今日签到状态      |
| **Check In Student**      | 为到课学员办理签到；成功扣 1 节           |
| **Post Check-in Balance** | 签到后名单即时反映最新 `lessonBalance` |


### 1.2 业务价值

- 完成 MVP Phase1 第三步「快速签到」（`TASKS.md`）
- 支撑「自动扣课时」业务后果（`FLOW.md` §4），无需老师手工记账
- 30 秒内连续为多名到课学员完成点名（ACCEPTANCE §3.1）
- 与 Sprint 3 购课数据衔接：余额 = 购课总数 − 有效签到数（ADR-007）

### 1.3 明确禁止（Sprint 4 不做）


| 禁止项                         | 说明                   |
| --------------------------- | -------------------- |
| 撤销签到                        | Phase2（`FLOW.md` §6） |
| Edit / Delete 签到记录          | 不提供                  |
| 独立「扣课时」人工操作                 | 扣课仅随有效签到发生           |
| 修改 `LessonPackage.quantity` | 扣课不落库在课时包（ADR-007）   |
| ClassSession / Teacher 建模   | MVP 单人工作室；无班次、无老师档案  |
| 一日多次签到                      | 同一学员同一自然日仅 1 次有效签到   |
| 购课 / 学生建档                   | 不修改 Sprint 2/3 规则    |
| Search / Pagination         | 今日名单一次加载全部 ACTIVE    |
| 签到历史列表 UI                   | Sprint 4 不展示历史签到明细页  |
| 登录 / 权限                     | 单人工作室假设              |


### 1.4 与「查看剩余课时」的关系

- MVP 任务「查看剩余课时」主要由 **既有** `/students` 列表与详情承担（Sprint 2/3）
- Sprint 4 在 **今日签到页** 同步展示 `lessonBalance`，并在签到成功后即时刷新
- Sprint 4 **不**新建独立的「剩余课时查询」功能页；验收时确认签到后余额与 `/students` 一致即可

---

## 2. 页面结构

### 2.1 路由


| 路由            | 说明                                                            |
| ------------- | ------------------------------------------------------------- |
| `/attendance` | **新增** — Sprint 4 今日签到主页面                                     |
| `/students`   | 无行为变更；列表/详情余额随 ADR-007 公式自动反映签到                               |
| `/`           | 建议保持 redirect → `/students`（或 Tech Lead 确认是否改为 `/attendance`） |


> 路由层仅负责入口组合（ADR-002）。业务逻辑不在路由层实现。

### 2.2 页面信息架构（`/attendance`）

```
┌─────────────────────────────────────────────────────────┐
│  今日签到                              2026-06-29       │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │ 姓名 │ 课时余额 │ 今日状态 │ 操作              │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ 小明 │    8     │ 未签到   │ [签到]            │   │
│  │ 小红 │    0     │ 未签到   │ （课时不足）      │   │
│  │ 小刚 │    3     │ 已签到   │ 已签到            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  （空状态：暂无在读学员）                                │
└─────────────────────────────────────────────────────────┘
```

### 2.3 交互区域


| 区域             | 触发               | 行为                                   |
| -------------- | ---------------- | ------------------------------------ |
| **Today List** | 进入 `/attendance` | 加载 ACTIVE 学员 + 余额 + 今日签到状态           |
| **Check In**   | 点击「签到」           | 校验 → 创建签到 → 刷新该行状态与余额                |
| **已签到行**       | —                | 不显示可点「签到」；展示「已签到」                    |
| **课时不足行**      | —                | 「签到」不可用或点击后提示 `INSUFFICIENT_BALANCE` |


### 2.4 与 `/students` 的关系

- `/attendance`：操作入口（签到）
- `/students`：档案与购课；余额只读展示
- 两页均消费同一 `lessonBalance` 计算结果（`lesson-balance.repository`）
- **禁止**在 Attendance UI 自行计算余额

---

## 3. 用户流程

### 3.1 今日签到（成功）

```
老师进入 /attendance
        ↓
系统加载今日名单（含 lessonBalance、今日状态）
        ↓
老师点击某学员「签到」
        ↓
系统校验：
  ① 学员存在且 ACTIVE
  ② 今日尚未有效签到
  ③ lessonBalance ≥ 1
        ├─ 失败 → 行内/Toast 提示，不创建记录
        └─ 通过 → 创建 Attendance（status = VALID）
        ↓
余额公式自动 −1（有效签到数 +1）
        ↓
该行变为「已签到」，余额更新
```

### 3.2 重复签到

```
学员今日已签到
        ↓
老师再次点击签到
        ↓
提示 ALREADY_CHECKED_IN
        ↓
不创建第二条有效记录，余额不变
```

### 3.3 课时不足

```
学员 lessonBalance = 0
        ↓
老师尝试签到
        ↓
提示 INSUFFICIENT_BALANCE
        ↓
不产生 Attendance 记录
```

### 3.4 未到课学员

```
老师未对某学员操作
        ↓
无 Attendance 记录
        ↓
余额不变；状态保持「未签到」
```

### 3.5 流程关系

```
Today Attendance List
      │
      └─→ Check In ──→ 刷新名单（状态 + lessonBalance）

/students 列表/详情（只读余额，随公式自动更新）
```

---

## 4. 数据字段

### 4.1 持久化 — Attendance（签到记录）


| 字段               | 必填  | 说明                                       |
| ---------------- | --- | ---------------------------------------- |
| `id`             | 自动  | 主键                                       |
| `studentId`      | ✅   | FK → Student                             |
| `attendanceDate` | ✅   | 签到业务日（自然日，工作室本地日）                        |
| `status`         | ✅   | `VALID` / `VOIDED`（Sprint 4 仅写入 `VALID`） |
| `createdAt`      | 自动  | 记录创建时间                                   |


**约束**

- **业务唯一性**：`studentId + attendanceDate` 组合不可重复（同一学员同一天仅 1 条记录）
- Sprint 4 **仅创建** `VALID`；`VOIDED` 为 Schema 预留（撤销签到 Phase2）
- **禁止**在 Attendance 上存储 `lessonDeducted` 等扣课数字段
- **禁止**签到时修改 `LessonPackage.quantity`

### 4.2 余额与扣课（非持久化）


| 项       | 说明                                                      |
| ------- | ------------------------------------------------------- |
| 公式      | `lessonBalance = 购课总数 − 有效签到总数`（ADR-007，Sprint 4 启用签到项） |
| 有效签到    | `COUNT(Attendance)` WHERE `status = VALID`              |
| 1 次有效签到 | 余额 −1（由公式体现，非写库）                                        |
| 签到失败    | 不创建 `VALID` 记录 → 余额不变                                   |


### 4.3 ViewModel — AttendanceTodayRow（今日名单行）

今日名单**必须**一次查询返回完整列表，含余额与今日状态。


| 字段              | 来源            | 说明                                 |
| --------------- | ------------- | ---------------------------------- |
| `studentId`     | Student       | 主键                                 |
| `name`          | Student       | 姓名                                 |
| `lessonBalance` | 查询结果字段        | 当前余额                               |
| `todayStatus`   | Attendance 查询 | `NOT_CHECKED_IN` / `CHECKED_IN`    |
| `canCheckIn`    | 派生            | `ACTIVE` 且未签到且 `lessonBalance ≥ 1` |


**规则**

- `lessonBalance` 由 `lesson-balance.repository` 批量提供；**禁止 N+1**
- `todayStatus` 由 `attendance.repository` 批量提供（按今日 `attendanceDate`）
- **禁止**在 UI 层拼装余额

### 4.4 ViewModel — CheckInResult（签到成功返回）


| 字段               | 说明           |
| ---------------- | ------------ |
| `attendanceId`   | 新建签到 id      |
| `studentId`      | 学员 id        |
| `attendanceDate` | 签到日          |
| `lessonBalance`  | 签到后最新余额      |
| `todayStatus`    | `CHECKED_IN` |


---

## 5. Acceptance 对应关系

> 来源：`docs/ACCEPTANCE.md` §3 快速签到 · §4 自动扣课时

### 5.1 本 Sprint 覆盖


| Acceptance 场景   | Sprint 4 功能           | 验证方式                   |
| --------------- | --------------------- | ---------------------- |
| 3.1 到课学员单次签到    | Check In              | 成功 → 已签到               |
| 3.1 多位学员连续签到    | Today List + Check In | 5 人依次成功                |
| 3.1 未到课保持未签到    | —                     | 无操作无记录                 |
| 3.2 余额 0 拒绝签到   | Check In              | `INSUFFICIENT_BALANCE` |
| 3.2 重复签到        | Check In              | `ALREADY_CHECKED_IN`   |
| 3.2 未登记学员       | Check In              | `STUDENT_NOT_FOUND`    |
| 3.3 余额 1 最后一签   | Check In              | 成功 → 余额 0              |
| 3.3 签到后名单即时更新   | Today List 刷新         | 状态与余额更新                |
| 3.3 仅部分学员签到     | Today List            | 3 已签 / 7 未签            |
| 4.1 签到成功自动扣 1 节 | 余额公式                  | 8 → 7                  |
| 4.1 扣课与签到一一对应   | DB + 余额               | 1 记录 −1 余额             |
| 4.2 签到失败不扣      | 拒绝场景                  | 余额不变                   |
| 4.2 重复签到不重复扣    | 重复场景                  | 余额不变                   |
| 4.3 扣至 0        | 边界                    | 1 → 0                  |
| 4.3 多学员独立扣减     | 两人签到                  | 互不影响                   |
| 5.1 签到后立即可查     | `/students` 或今日名单     | 余额一致                   |


### 5.2 本 Sprint 不覆盖


| Acceptance 场景      | 原因                    |
| ------------------ | --------------------- |
| 撤销签到（§6 / FLOW §6） | Phase2                |
| 课时包逐包耗尽状态          | 无 `consumed` 字段；总余额驱动 |
| 签到历史列表             | Sprint 4 不做           |
| ClassSession / 多班次 | MVP 不做                |


### 5.3 Given / When / Then 抽检清单（Sprint 4 结束时）

1. **Given** 小明在读、余额 8、今日未签 **When** 签到 **Then** 已签到，余额 7
2. **Given** 小明今日已签 **When** 再签 **Then** `ALREADY_CHECKED_IN`，余额不变
3. **Given** 小红余额 0 **When** 签到 **Then** `INSUFFICIENT_BALANCE`，无记录
4. **Given** 5 名学员均可签 **When** 依次签到 **Then** 5 人均已签到
5. **Given** 小刚未到课 **When** 不操作 **Then** 未签到，余额不变
6. **Given** 小明余额 1 **When** 签到 **Then** 成功，余额 0，不可再签
7. **Given** 小明刚签到 **When** 打开 `/students` 列表 **Then** 余额与今日名单一致
8. **Given** 已归档学员 **When** 尝试签到 **Then** `STUDENT_ARCHIVED`，无记录

---

## 6. Implementation Notes

### 6.1 架构约束

- Feature First：`features/attendance/`（ADR-002）
- Server Actions 为 UI 边界
- 余额**不落库**（ADR-004、ADR-007）
- Sprint 4 **仅修改** `lesson-balance.repository` 内部聚合以计入有效签到
- `**student.service` 不因 Sprint 4 修改业务逻辑**（Tech Lead 要求）

### 6.2 分层规则（强制）

```
UI → Action → Service → Validator → Repository → Database
```


| 层              | Attendance 模块职责                                    | 其他模块                             |
| -------------- | -------------------------------------------------- | -------------------------------- |
| **Repository** | Attendance CRUD；今日状态批量查询                           | `lesson-balance.repository` 扩展公式 |
| **Service**    | 签到编排、业务规则                                          | `student.service` **不变**         |
| **Action**     | `listTodayAttendanceAction`、`checkInStudentAction` | —                                |
| **UI**         | 今日名单、签到按钮                                          | 仅调 Action                        |


### 6.3 今日名单策略

- 一次加载全部 ACTIVE 学员
- 批量 `getBalances(studentIds)`
- 批量查询今日 `VALID` 签到状态
- **禁止**逐学员单独查余额或签到状态（N+1）

### 6.4 签到业务规则


| 规则                   | 处理位置                                            |
| -------------------- | ----------------------------------------------- |
| 仅 ACTIVE 可签          | Service                                         |
| 今日未重复签               | Service + DB unique                             |
| 余额 ≥ 1               | Service（读 `lessonBalanceRepository.getBalance`） |
| 1 次 VALID 签到 = 余额 −1 | `lesson-balance.repository` 公式                  |
| 签到失败不写入              | Service 校验前置                                    |


### 6.5 待 Tech Lead 确认


| #   | 问题                                  |
| --- | ----------------------------------- |
| 1   | 今日签到主路由是否为 `/attendance`？           |
| 2   | 「今日」是否按服务器本地自然日（`YYYY-MM-DD`）？      |
| 3   | 是否在导航中增加「今日签到」入口？                   |
| 4   | 课时不足行：禁用按钮 vs 可点并提示？（当前 Spec：可点后提示） |
| 5   | `VOIDED` 仅 Schema 预留，Sprint 4 是否同意？ |


---

**状态：Rev 1 — 等待 Tech Lead Review。Review 通过后再更新 Implementation Plan。**