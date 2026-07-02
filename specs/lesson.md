# Lesson Module Spec — Sprint 3

> **状态：待 Tech Lead Review（Rev 1）**
>
> 本文档定义 Sprint 3 课时购课模块范围，不含源码，不绑定 UI 组件实现。
>
> 依据：`docs/FLOW.md` §2 · `docs/ACCEPTANCE.md` §2 · ADR-004 · ADR-007

---

## 1. 功能目标

### 1.1 Sprint 3 目标

为书法工作室老师提供**购课录入能力**，并使学生列表与详情展示**真实课时余额**，为后续签到扣课 Sprint 奠定数据基础：

| 能力 | 说明 |
|------|------|
| **Create Lesson Purchase** | 为指定在读学员录入一批购课课时 |
| **Lesson Balance Display** | 学生列表与详情展示计算后的 `lessonBalance` |
| **Balance Formula Ready** | 余额按「购课总数 − 已签到总数」计算；Sprint 3 签到数为 0 |

### 1.2 业务价值

- 完成 MVP Phase1 第二步「为学生录入课时」（`TASKS.md`）
- 替代纸质账本中的「充值记录」，每笔购课形成可追溯条目
- 学员购课后，名单与详情即时反映剩余课时，支撑后续「快速签到」Sprint
- 与 `FLOW.md` §2「购买课时」流程对齐

### 1.3 明确禁止（Sprint 3 不做）

| 禁止项 | 说明 |
|--------|------|
| 签到 / 扣课 | 不创建签到记录，不扣减课时 |
| 撤销签到 | Phase2 范畴 |
| Edit / Delete 购课记录 | 不提供修改或删除已录入购课 |
| 支付建模 | 不记录金额、支付方式、流水号 |
| 课时包有效期 | 不建模过期 |
| 购课记录列表 UI | Sprint 3 不在详情页展示历史购课明细（仅展示余额） |
| Search / Pagination | 购课无独立列表页 |
| Import / Export | 无 |
| 登录 / 权限 | 单人工作室假设 |
| Student CRUD 扩展 | 不修改 Sprint 2 学生建档规则 |

---

## 2. 页面结构

### 2.1 路由

| 路由 | 变更 | 说明 |
|------|------|------|
| `/students` | **增强** | 列表 `lessonBalance` 由计算值驱动（非恒 0） |
| `/` | 无变更 | 仍 redirect → `/students` |

> Sprint 3 **不新增**独立路由。购课入口嵌入现有学生管理页（ADR-002 薄路由）。

### 2.2 页面信息架构（`/students` 增强）

```
┌─────────────────────────────────────────────────────────┐
│  学生管理                              [+ 新增学生]      │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │ 姓名 │ 联系人 │ 电话 │ 课时余额 │ 状态          │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ 小明 │ 明妈   │ 138… │   10     │ 在读   ← 点击 │   │
│  │ 小红 │ 红爸   │  —   │    2     │ 在读          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

         ┌─────────────────────────────────────┐
         │  View Student Detail（只读 + 购课入口）│
         │  姓名 / 联系人 / 电话 / 备注 / 状态     │
         │  课时余额：10                         │
         │  登记时间                             │
         │                    [录入课时]  ← 新增  │
         └─────────────────────────────────────┘

         ┌─────────────────────────────────────┐
         │  Create Lesson Purchase（Dialog）    │
         │  课时数 *  [    ]                    │
         │  备注      [    ]（可选）            │
         │              [取消]  [保存]           │
         └─────────────────────────────────────┘
```

### 2.3 交互区域

| 区域 | 触发 | 行为 |
|------|------|------|
| **Lesson Balance（列表）** | 进入 `/students` | 展示每位 ACTIVE 学员的计算余额 |
| **Lesson Balance（详情）** | 点击列表行 | 详情区展示该学员当前余额 |
| **Create Lesson Purchase** | 详情内点击「录入课时」 | 打开购课表单；成功后关闭表单、刷新列表与详情余额 |

### 2.4 Dialog / Sheet 互斥

与 Sprint 2 一致：

- 打开购课 Dialog 时，不与详情 Sheet 产生状态冲突
- 购课成功后：关闭 Dialog → 刷新列表 → 更新详情中的 `lessonBalance`

### 2.5 本 Sprint 不提供的交互

- 无签到按钮、无今日名单
- 无购课记录历史列表
- 无编辑 / 删除购课
- 无学生信息编辑

---

## 3. 用户流程

### 3.1 首次购课

```
老师打开学生详情（小明，余额 0）
        ↓
点击「录入课时」
        ↓
填写课时数（如 10），可选备注
        ↓
点击「保存」
        ↓
系统校验（学员存在、在读、课时数 > 0）
        ├─ 失败 → 表单内提示，停留
        └─ 成功 → 写入购课记录
        ↓
余额更新：0 → 10
        ↓
列表与详情同步显示 10
```

### 3.2 续费充值

```
老师打开学生详情（小红，余额 2）
        ↓
录入 20 节课时
        ↓
系统追加一条购课记录（不覆盖历史）
        ↓
余额更新：2 → 22
```

### 3.3 连续两次录入

```
学员余额 0
        ↓
先录入 10 节 → 余额 10
        ↓
再录入 5 节 → 余额 15
        ↓
数据库保留两条购课记录；余额为两次之和
```

### 3.4 购课后查看余额

```
老师完成购课录入
        ↓
关闭购课 Dialog
        ↓
详情区「课时余额」与列表同行数字一致
        ↓
无需跳转其他页面
```

### 3.5 流程关系

```
Student List（含 lessonBalance）
      │
      └─→ View Student Detail
                │
                └─→ Create Lesson Purchase ──→ 刷新 List + Detail
```

---

## 4. 数据字段

### 4.1 持久化 — LessonPackage（购课记录）

每笔购课对应一条 `LessonPackage` 记录（名称沿用 `DOMAIN.md`，表示一批可用课时来源）。

| 字段 | 必填 | 说明 |
|------|------|------|
| `id` | 自动 | 主键 |
| `studentId` | ✅ | 关联学员；FK → Student |
| `quantity` | ✅ | 本次购课课时数；正整数 |
| `note` | ❌ | 备注（如「暑期班续费」） |
| `purchasedAt` | 自动 | 购课时间；默认 `now()` |
| `createdAt` | 自动 | 记录创建时间 |

**约束**

- `quantity` > 0（业务层校验；数据库层可加 CHECK）
- 每笔购课**追加**写入，不修改历史记录
- **禁止**在 `LessonPackage` 上存储 `remainingQuantity` / `consumed` 等余额字段
- **禁止**在 `Student` 上存储 `lessonBalance` / `remainingLesson`（ADR-004）

### 4.2 非持久化 — lessonBalance（ViewModel 计算字段）

| 项 | 说明 |
|----|------|
| 公式 | `lessonBalance = 购课总数 − 已签到总数`（ADR-007） |
| Sprint 3 | 已签到总数恒为 `0`（无 Attendance 数据） |
| 展示位置 | `StudentSummary.lessonBalance`、`StudentDetail.lessonBalance` |
| 计算时机 | 列表 / 详情查询时**批量**计算，禁止 N+1 |

**购课总数**

```
SUM(LessonPackage.quantity) WHERE studentId = ?
```

**已签到总数（Sprint 4 启用）**

```
COUNT(Attendance) WHERE studentId = ? AND status = VALID
```

Sprint 3 不建 `Attendance` 表；公式中该项为 0。

### 4.3 ViewModel — LessonPurchaseResult（购课成功返回）

购课 Action 成功后可返回简要结果，供 UI 刷新：

| 字段 | 说明 |
|------|------|
| `id` | 购课记录 id |
| `studentId` | 学员 id |
| `quantity` | 本次录入课时数 |
| `lessonBalance` | 购课后该学员最新余额 |
| `purchasedAt` | 购课时间 |

> UI 主要依赖刷新后的 `StudentDetail` / 列表，本 ViewModel 为 Action 成功载荷。

### 4.4 Create Lesson Purchase 表单字段

| 字段 | 必填 | 校验 |
|------|------|------|
| 学员 | ✅（上下文） | 由详情传入 `studentId`；须存在且 `ACTIVE` |
| 课时数 | ✅ | 正整数；≥ 1；建议上限 9999 |
| 备注 | ❌ | 可选；最大 500 字 |

---

## 5. Acceptance 对应关系

> 来源：`docs/ACCEPTANCE.md` §2 为学生录入课时

### 5.1 本 Sprint 覆盖

| Acceptance 场景 | Sprint 3 功能 | 验证方式 |
|-----------------|---------------|----------|
| 2.1 新学员首次购课 | Create Lesson Purchase | 0 → 录入 10 → 余额 10 |
| 2.1 老学员续费充值 | Create Lesson Purchase | 2 → 再录 20 → 余额 22 |
| 2.1 录入后可立即查看 | Lesson Balance Display | 详情与列表数字一致 |
| 2.2 学员不存在 | Create Lesson Purchase | `STUDENT_NOT_FOUND` |
| 2.2 录入 0 节课时 | 校验 | `VALIDATION_ERROR` |
| 2.2 录入负数 | 校验 | 拒绝，余额不变 |
| 2.3 最小值 1 节 | Create Lesson Purchase | 余额 0 → 1 |
| 2.3 大量课时 100 节 | Create Lesson Purchase | 余额准确为 100 |
| 2.3 连续两次录入 | Create Lesson Purchase | 10 + 5 = 15；两条记录 |

### 5.2 本 Sprint 不覆盖

| Acceptance 场景 | 原因 |
|-----------------|------|
| §3 快速签到 | Sprint 4 |
| §4 自动扣课时 | Sprint 4 |
| §5 查看剩余课时（独立功能） | 已并入列表/详情展示 |
| §6 撤销签到 | Phase2 |

### 5.3 Given / When / Then 抽检清单（Sprint 3 结束时）

1. **Given** 学员小明在读、余额 0 **When** 录入 10 节课时 **Then** 列表与详情余额均为 10
2. **Given** 学员小红余额 2 **When** 再录入 20 节 **Then** 余额变为 22
3. **Given** 学员小明余额 0 **When** 先录 10 再录 5 **Then** 余额 15，库内两条购课记录
4. **Given** 不存在的 studentId **When** 尝试购课 **Then** `STUDENT_NOT_FOUND`
5. **Given** 购课表单 **When** 课时数填 0 **Then** 校验失败，余额不变
6. **Given** 购课表单 **When** 课时数填 −5 **Then** 校验失败，余额不变
7. **Given** 学员已归档（ARCHIVED） **When** 尝试购课 **Then** 拒绝（`STUDENT_NOT_ACTIVE`）
8. **Given** 多名学员各有购课 **When** 打开列表 **Then** 各行余额正确，单次查询无 N+1

---

## 6. Implementation Notes

### 6.1 架构约束

- Feature First：`features/lessons/` 承载购课；`features/students/` 承载展示（ADR-002）
- Server Actions 作为 UI 边界
- 余额**不落库**（ADR-004、ADR-007）
- 购课写入 `LessonPackage`；余额由聚合查询计算
- Student 模块**读取**余额；Lesson 模块**写入**购课；跨 Feature 读依赖在 Plan 中显式定义

### 6.2 分层规则（强制）

```
UI → Action → Service → Validator → Repository → Database
```

| 层 | Lesson 模块职责 | Student 模块变更 |
|----|----------------|------------------|
| **Repository** | `LessonPackage` 写入；余额批量聚合查询 | 无购课写入 |
| **Service** | 购课业务编排 | 列表/详情调用余额查询，Mapper 装配 |
| **Action** | `createLessonPurchaseAction` | 既有 Action 行为不变，返回真实余额 |
| **UI** | 购课表单 | 详情增加「录入课时」入口 |

### 6.3 余额计算策略

- 列表：一次查询所有 ACTIVE 学员 id → 一次批量聚合购课总量 →（Sprint 3 签到量 = 0）→ `Map<studentId, balance>`
- 详情：单次聚合该学员购课总量
- **禁止**：UI / Action 层自行计算余额
- **禁止**：对列表逐学员单独查余额（N+1）

### 6.4 与后续签到 Sprint 的衔接

| 项 | Sprint 3 | Sprint 4（预期） |
|----|----------|------------------|
| `LessonPackage` | ✅ 写入 | 只读聚合 |
| `Attendance` | ❌ 不建表 | 写入有效签到 |
| 余额公式 | `购课总和 − 0` | `购课总和 − 有效签到数` |
| 扣课来源 | — | 签到时创建 Attendance，不直接改 Package |

### 6.5 待 Tech Lead 确认

| # | 问题 |
|---|------|
| 1 | 购课入口是否仅放在学生详情 Sheet？（当前 Spec：是） |
| 2 | 已归档学员是否禁止购课？（当前 Spec：是，`STUDENT_NOT_ACTIVE`） |
| 3 | `quantity` 上限是否 9999？ |
| 4 | Sprint 3 是否预建 `Attendance` 空表？（当前 Spec：否，Sprint 4 再建） |
| 5 | 购课成功是否必须刷新整个列表？（当前 Spec：是，保证余额一致） |

---

**状态：Rev 1 — 等待 Tech Lead Review。Review 通过后再更新 Implementation Plan。**
