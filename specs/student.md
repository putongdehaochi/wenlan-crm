# Student Module Spec — Sprint 2

> **状态：待 Tech Lead Review（Rev 2）**
>
> 本文档定义 Sprint 2 学生模块范围，不含源码，不绑定 UI 组件实现。

---

## 1. 功能目标

### 1.1 Sprint 2 目标

为书法工作室老师提供**最小学员档案能力**，支撑后续课时与签到 Sprint：

| 能力 | 说明 |
|------|------|
| **Student List** | 一屏查看全部在读学员及课时余额 |
| **Create Student** | 登记新学员，写入名册 |
| **View Student Detail** | 查看学员档案详情（只读，不可编辑） |

### 1.2 业务价值

- 替代纸质名册，完成 MVP 闭环第一步「录入学生」（`TASKS.md` Phase1）
- 新建学员默认课时余额 **0**，与 `FLOW.md` 新增学生流程一致
- **View Student Detail** 满足「登记完成后可查看基本信息与课时余额」

### 1.3 明确禁止（Sprint 2 不做）

| 禁止项 | 说明 |
|--------|------|
| Edit | 不提供编辑入口与接口 |
| Delete | 不提供删除入口与接口 |
| Search | 无搜索、无筛选 |
| Pagination | 无分页，一次加载全部 |
| Import / Export | 无导入导出 |
| Batch | 无批量操作 |
| 登录 / 权限 | 单人工作室假设，无 Auth |
| Lesson 相关 | 无课时包、签到、扣课时、续费 |

---

## 2. 页面结构

### 2.1 路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/students` | 学生管理页 | Sprint 2 主页面 |

> 路由层仅负责入口组合，业务逻辑不在路由层实现（ADR-002）。

### 2.2 页面信息架构（`/students`）

```
┌─────────────────────────────────────────────────────────┐
│  学生管理                              [+ 新增学生]      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 姓名 │ 联系人 │ 电话 │ 课时余额 │ 状态          │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ 小明 │ 明妈   │ 138… │    0     │ 在读   ← 点击 │   │
│  │ 小红 │ 红爸   │  —   │    0     │ 在读          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  （空状态：暂无学员，点击「新增学生」开始登记）           │
│                                                         │
└─────────────────────────────────────────────────────────┘

         ┌─────────────────────────────────────┐
         │  View Student Detail（只读详情区域）  │
         │  由列表行点击触发，不改变业务数据       │
         └─────────────────────────────────────┘
```

### 2.3 交互区域（不绑定具体 UI 组件）

| 区域 | 触发 | 行为 |
|------|------|------|
| **Create Student** | 点击「新增学生」 | 展示创建表单；提交成功后关闭并刷新列表 |
| **View Student Detail** | 点击列表行 | 展示只读详情；可关闭；不修改数据 |

### 2.4 本 Sprint 不提供的交互

- 无编辑、无删除、无更多操作菜单
- 无搜索栏、无分页器、无排序控件（默认按登记时间倒序）

---

## 3. 用户流程

### 3.1 查看学生列表

```
老师进入学生管理页
        ↓
系统一次查询返回 StudentSummary 列表（含 lessonBalance）
        ↓
展示：姓名、联系人、电话、课时余额、状态
        ↓
（若无学员）展示空状态引导
```

### 3.2 新增学生

```
老师点击「新增学生」
        ↓
进入 Create Student 表单
        ↓
老师填写并点击「保存」
        ↓
系统校验必填项（姓名、联系人）
        ├─ 失败 → 提示错误，停留在表单
        └─ 成功 → 检查 name + contactName 是否重复
                    ├─ 重复 → 提示「该学员可能已存在」
                    └─ 通过 → 创建记录，status = 在读
        ↓
返回列表，新学员出现在顶部
```

**说明**

- 电话为可选；留空允许保存
- 多个学员可共用同一电话（现实：兄弟姐妹同一家长手机）

### 3.3 View Student Detail（只读）

```
老师在列表中点击某一行
        ↓
进入 View Student Detail
        ↓
展示：姓名、联系人、电话、备注、状态、课时余额、登记时间
        ↓
老师阅读后关闭详情
        ↓
列表无变化
```

### 3.4 流程关系

```
Student List ←──────────────────┐
      │                         │
      ├─→ Create Student ───────┘（成功后刷新列表）
      │
      └─→ View Student Detail（只读，不修改数据）
```

---

## 4. 数据字段

### 4.1 Student 持久化字段

| 字段 | 必填 | 说明 |
|------|------|------|
| `id` | 自动 | 主键 |
| `name` | ✅ | 学员姓名 |
| `contactName` | ✅ | 联系人（家长姓名）；**永远存在** |
| `phone` | ❌ | 联系电话；可空；可多人共用 |
| `note` | ❌ | 备注 |
| `status` | ✅ | 默认 `ACTIVE`（在读） |
| `createdAt` | 自动 | 登记时间 |
| `updatedAt` | 自动 | 更新时间 |

**约束**

- 业务唯一性：`name + contactName` 组合不可重复（同一联系人下同名学员视为重复）
- `phone` **不设唯一约束**（允许多学员共用或留空）
- **禁止** `remainingLesson` / `lessonBalance` 等余额字段落库（ADR-004）

**Status 枚举**

| 值 | Sprint 2 | 显示 | 说明 |
|----|----------|------|------|
| `ACTIVE` | ✅ 使用 | 在读 | 新建默认值；列表仅展示 ACTIVE |
| `ARCHIVED` | 预留 | — | Schema 预留；Sprint 2 无切换 UI、不展示 |

> Sprint 2 不使用、不描述 `GRADUATED` 等其他状态。

### 4.2 ViewModel — StudentSummary（列表）

Student List **必须**使用 `StudentSummary` ViewModel，**一次查询**返回完整列表。

| 字段 | 来源 | 说明 |
|------|------|------|
| `id` | Student | 主键 |
| `name` | Student | 学员姓名 |
| `contactName` | Student | 联系人 |
| `phone` | Student | 电话，可 null |
| `status` | Student | 状态 |
| `lessonBalance` | **查询结果字段** | 课时余额；Sprint 2 查询结果为 `0` |

**规则**

- `lessonBalance` 由列表查询一并返回，**禁止**对列表逐条单独查询余额（避免 N+1）
- `lessonBalance` 不持久化在 Student 表（ADR-004）
- Sprint 2 无课时包 / 签到数据，列表查询返回的 `lessonBalance` 均为 `0`

### 4.3 ViewModel — StudentDetail（详情）

View Student Detail 使用 `StudentDetail` ViewModel。

| 字段 | 来源 | 说明 |
|------|------|------|
| `id` | Student | 主键 |
| `name` | Student | 学员姓名 |
| `contactName` | Student | 联系人 |
| `phone` | Student | 电话，可 null；展示为空时显示「—」 |
| `note` | Student | 备注，可 null |
| `status` | Student | 状态 |
| `lessonBalance` | **查询结果字段** | 课时余额；Sprint 2 为 `0` |
| `createdAt` | Student | 登记时间 |

**规则**

- 详情查询**单次请求**返回完整 `StudentDetail`（含 `lessonBalance`）
- 只读展示，不提供编辑控件

### 4.4 Create Student 表单字段

| 字段 | 必填 | 校验 |
|------|------|------|
| 姓名 | ✅ | 非空，trim 后长度 ≥ 1 |
| 联系人 | ✅ | 非空，trim 后长度 ≥ 1 |
| 电话 | ❌ | 若填写：基础格式校验（数字 7–15 位，允许 `-`） |
| 备注 | ❌ | 可选，最大 500 字 |

---

## 5. Acceptance 对应关系

> 来源：`docs/ACCEPTANCE.md` §1 录入学生  
> 下列「Sprint 2 解读」反映 Tech Lead 对字段与唯一性规则的修订。

### 5.1 本 Sprint 覆盖

| Acceptance 场景 | Sprint 2 功能 | Sprint 2 解读 | 验证方式 |
|-----------------|---------------|---------------|----------|
| 1.1 新学员首次报名登记 | Create Student | 必填：姓名 + 联系人；电话可选 | 保存后在列表，状态在读，`lessonBalance` 为 0 |
| 1.1 登记完成后可继续后续操作 | View Student Detail | — | 详情可见基本信息，`lessonBalance` 为 0 |
| 1.2 必填信息缺失 | Create Student | 姓名或联系人为空 → 拒绝 | 表单错误，不提交 |
| 1.2 重复登记同一学员 | Create Student | 相同 `name + contactName` → 拒绝 | 提示已存在 |
| 1.2 已归档学员重新入学 | Create Student | 相同 `name + contactName` 已存在（含 ARCHIVED）→ 拒绝；MVP 简化 | 提示已存在 |
| 1.3 工作室第一位学员 | Student List | — | 空 → 创建 → 列表 1 条 |
| 1.3 仅填必填项，备注留空 | Create Student | 姓名 + 联系人必填；电话、备注可空 | 创建成功 |
| 1.3 同名不同人 | Create Student | 同名但联系人不同 → 允许 | 列表 2 条 |
| 1.3 共用电话 | Create Student | 不同学员相同电话 → 允许 | 均创建成功 |

### 5.2 与原 Acceptance 的差异说明

| 原 Acceptance 表述 | Sprint 2 调整 | 原因 |
|-------------------|---------------|------|
| 必填「联系人电话」 | 必填「联系人」；电话可选 | Tech Lead：联系人永远存在，电话可空或共用 |
| 重复：同名同电话 | 重复：同名同联系人 | 电话不再作为唯一性依据 |
| 已结业学员 | 已归档（ARCHIVED） | 状态枚举调整，不用 GRADUATED |

### 5.3 本 Sprint 不覆盖

| Acceptance 场景 | 原因 |
|-----------------|------|
| §2 及以后全部 | 非 Sprint 2 范围 |
| 编辑 / 删除相关 | Sprint 2 明确禁止 |

### 5.4 Given / When / Then 抽检清单（Sprint 2 结束时）

1. **Given** 空名册 **When** 创建「小明 / 联系人：明妈」 **Then** 列表 1 条，`lessonBalance` 为 0
2. **Given** 已有「小明 + 明妈」 **When** 再创建相同姓名与联系人 **Then** 提示已存在
3. **Given** 已有「张伟 + 张妈」 **When** 创建「张伟 + 李妈」 **Then** 成功，列表 2 条
4. **Given** 已创建学员 **When** 查看详情 **Then** 只读展示，无编辑入口
5. **Given** 表单 **When** 联系人为空提交 **Then** 校验失败
6. **Given** 表单 **When** 电话留空、联系人已填 **Then** 创建成功
7. **Given** 学员 A、B **When** 两者填写相同电话 **Then** 均创建成功

---

## 6. Implementation Notes

> 本节描述分层约束，**不绑定具体 UI 组件或数据库查询语法**。

### 6.1 架构约束

- Feature First：`features/students/`（ADR-002）
- Server Actions 作为 UI 与后端的边界，不建 REST API 路由
- Prisma + PostgreSQL（ADR-001、003）
- 课时余额不落库（ADR-004）
- Student 未来可能演进为 Household（ADR-005）；Sprint 2 不实现

### 6.2 分层规则（强制）

```
Repository  →  Service  →  Server Action  →  UI
```

| 层 | 职责 |
|----|------|
| **Repository** | 数据访问；列表查询返回含 `lessonBalance` 的结果集 |
| **Service** | 业务规则（校验、重复检查、ViewModel 组装） |
| **Server Action** | 请求边界；调用 Service；**禁止直接调用 Prisma** |
| **UI** | 展示与交互；调用 Server Action |

### 6.3 列表策略

- **无分页**：一次查询返回全部 ACTIVE 学员
- **无搜索**：Sprint 2 禁止
- **排序**：登记时间倒序（最新在前）
- **StudentSummary**：列表接口返回 `StudentSummary[]`，`lessonBalance` 为查询结果字段，**禁止 N+1**

### 6.4 重复校验

- 创建前检查 `name + contactName` 是否已存在（**不限 status**）
- 命中则返回业务错误，不创建
- `phone` 不参与重复判断

### 6.5 课时余额（lessonBalance）

- 字段名：`lessonBalance`（ViewModel 层，非持久化）
- Sprint 2：列表与详情查询结果均为 `0`
- 未来 Sprint：由 Repository 层在**同一次查询**中聚合课时包与签到数据，Service 层映射为 ViewModel 字段
- **禁止**：在 UI 或 Server Action 层逐条计算余额

### 6.6 待 Tech Lead 确认

| # | 问题 |
|---|------|
| 1 | 列表是否仅展示 `ACTIVE`？（当前 Spec：是） |
| 2 | `/students` 是否作为应用默认入口？ |
| 3 | PostgreSQL 连接是否已就绪？ |
| 4 | `ARCHIVED` 仅 Schema 预留，Sprint 2 是否同意？ |

---

**状态：Rev 2 — 等待 Tech Lead Review。Review 通过后再更新 Implementation Plan。**
