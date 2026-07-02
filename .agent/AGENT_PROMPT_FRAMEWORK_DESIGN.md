# Agent Prompt Framework — 设计文档

> **状态：待 Tech Lead Review**
>
> 本文档为 Agent Prompt Framework 的**设计规格**。
> Review 通过后再生成 `constitution.md`、`coding-rules.md` 及各目录下的正式文件。
>
> **不含业务代码 · 不含 Sprint 2 实现细节**

---

## 1. 背景与问题

### 1.1 现状

项目已具备：


| 层级       | 现有产物                     | 位置                             |
| -------- | ------------------------ | ------------------------------ |
| 项目原则     | 目标、MVP、Phase             | `.agent/PROJECT.md`            |
| AI 工作流规则 | 8 条操作规则                  | `.agent/RULES.md`              |
| 架构决策     | ADR-001 ~ 006            | `.agent/adr/` + `DECISIONS.md` |
| 领域 / 验收  | DOMAIN、FLOW、ACCEPTANCE   | `docs/`                        |
| 功能规格     | Feature Spec             | `specs/{feature}.md`           |
| 实施计划     | Implementation Plan      | `specs/{feature}/*.plan.md`    |
| 进度 / 结案  | Progress / Sprint Report | `.agent/SPRINT_`*              |
| 运行时状态    | STATE、TASKS、CHANGELOG    | `.agent/`                      |


### 1.2 缺口

- AI 行为仍依赖**当前对话上下文**，换工具 / 换会话后行为不一致
- 角色职责（Tech Lead vs Engineer vs Reviewer）未标准化
- 分层规则散落在 Plan / ADR，无统一**禁止依赖方向**清单
- Review 流程有 SPRINT_REPORT，但无通用 Workflow / Checklist
- 文档模板各自为政，格式 drift 风险高

### 1.3 目标

引入 **Agent Prompt Framework**，作为 AI 协作的**第一层基础设施**：

> 任何 Agent clone 仓库后，**不依赖历史聊天**，即可知道：如何工作、扮演什么角色、能做什么、不能做什麼、如何 Review、文档如何串联。

---

## 2. 文档栈（目标架构）

```
┌─────────────────────────────────────────────────────────┐
│  Layer 0 — Constitution          项目原则（不可违背）    │
├─────────────────────────────────────────────────────────┤
│  Layer 1 — Agent Prompt Framework  AI 协作基础设施       │
│            ├── constitution.md     （从 PROJECT 提炼+扩展）│
│            ├── coding-rules.md     强制编码与依赖规则     │
│            ├── prompts/            角色 Prompt            │
│            ├── workflow/           标准工作流               │
│            ├── checklists/         可复用 Review 清单      │
│            └── templates/          文档模板               │
├─────────────────────────────────────────────────────────┤
│  Layer 2 — ADR                   架构决策（追加不覆盖）   │
├─────────────────────────────────────────────────────────┤
│  Layer 3 — Spec                  功能规格（业务 WHAT）    │
├─────────────────────────────────────────────────────────┤
│  Layer 4 — Implementation Plan   技术 HOW（待 Review）   │
├─────────────────────────────────────────────────────────┤
│  Layer 5 — Implementation        代码                     │
├─────────────────────────────────────────────────────────┤
│  Layer 6 — Progress Report       里程碑进度               │
├─────────────────────────────────────────────────────────┤
│  Layer 7 — Review                Sprint / Code Review    │
└─────────────────────────────────────────────────────────┘
```

### 2.1 Agent 启动顺序（Mandatory Read Order）

```
1. .agent/constitution.md
2. .agent/coding-rules.md
3. .agent/prompts/{assigned-role}.md      ← 按任务分配角色
4. .agent/STATE.json
5. .agent/RULES.md                         ← 操作型规则（与 Framework 互补）
6. 相关 ADR → Spec → Plan（按任务）
```

### 2.2 与现有文件的关系


| 现有文件                    | Framework 实施后                                                   |
| ----------------------- | --------------------------------------------------------------- |
| `PROJECT.md`            | **保留**；`constitution.md` 引用并结构化，不重复维护业务目标长文                     |
| `RULES.md`              | **保留**；操作型 checklist（更新 STATE/TASKS/CHANGELOG）；Framework 管原则与角色 |
| `DECISIONS.md` + `adr/` | **不变**；Framework templates 提供 ADR 模板                            |
| `ARCHITECTURE.md`       | **保留**；`coding-rules.md` 引用 Feature First 细节                    |
| `docs/DOMAIN.md` 等      | **不变**；Spec 层引用                                                 |


**原则**：Framework **不删除**已有 `.agent` 文件；通过 `constitution.md` 索引串联。

---

## 3. 目录结构（待 Implement）

```
.agent/
├── AGENT_PROMPT_FRAMEWORK_DESIGN.md   ← 本文档（设计）
├── README.md                          ← [新增] Framework 入口索引
├── constitution.md                    ← [新增] Layer 0 原则
├── coding-rules.md                    ← [新增] 强制编码规则
│
├── prompts/
│   ├── README.md                      ← 角色选择与组合说明
│   ├── tech-lead.md
│   ├── backend-engineer.md
│   ├── frontend-engineer.md
│   ├── architect.md
│   ├── reviewer.md
│   ├── qa.md
│   └── release-manager.md
│
├── workflow/
│   ├── README.md
│   ├── spec-review.md
│   ├── plan-review.md
│   ├── implementation.md
│   ├── code-review.md
│   ├── progress-review.md
│   └── sprint-acceptance.md
│
├── checklists/
│   ├── README.md
│   ├── architecture.md
│   ├── layering.md
│   ├── naming.md
│   ├── repository.md
│   ├── service.md
│   ├── action.md
│   ├── ui.md
│   ├── sprint.md
│   └── acceptance.md
│
├── templates/
│   ├── README.md
│   ├── adr.md
│   ├── spec.md
│   ├── implementation-plan.md
│   ├── progress-report.md
│   ├── review-report.md
│   ├── sprint-report.md
│   ├── risk-report.md
│   └── decision-record.md
│
├── adr/                               ← 已有
├── PROJECT.md                         ← 已有
├── RULES.md                           ← 已有
├── STATE.json                         ← 已有
└── ...
```

---

## 4. 交付物设计

### 4.1 `constitution.md`

**用途**：项目宪法；所有 Agent 的第一必读文件。

**内容大纲**


| 章节     | 内容                                           |
| ------ | -------------------------------------------- |
| 项目身份   | 文岚书法管理系统；一句话目标                               |
| 优先级    | 业务价值 > 架构一致性 > 交付速度 > 代码炫技                   |
| MVP 哲学 | 只做闭环必要功能；明确 OUT OF SCOPE                     |
| 架构哲学   | Feature First · 薄路由 · 单一事实来源 · ADR 驱动        |
| 工程原则   | 小步交付 · 里程碑闸门 · Spec 先于 Code · Review 先于合并    |
| 文档栈    | 指向 Layer 0~7 图                               |
| 不可违背项  | 禁止跳过 Spec/Plan Review；禁止改 ADR 历史；禁止 Scope 蔓延 |
| 引用     | `PROJECT.md`、`RULES.md`、`coding-rules.md`    |


**与 PROJECT.md 分工**

- `PROJECT.md`：产品目标、MVP 列表、Phase 规划（**产品视角**）
- `constitution.md`：原则、优先级、哲学（**治理视角**），不含具体功能列表

---

### 4.2 `coding-rules.md`

**用途**：强制编码与依赖规则；Implement 阶段必读。

**内容大纲**

#### 4.2.1 目录约定

- Feature First：`src/features/{feature}/`
- 薄路由：`src/app/` 仅组合
- 共享：`src/shared/`

#### 4.2.2 分层与职责


| 层             | 职责                                  | 禁止                    |
| ------------- | ----------------------------------- | --------------------- |
| UI            | 展示、交互、本地 UI state                   | 业务规则、触库、直调 Repository |
| Server Action | 请求边界、错误包装                           | 业务逻辑、Validator、Prisma |
| Service       | 业务编排、调用 Validator/Repository/Mapper | UI 逻辑、Prisma 直调       |
| Validator     | 字段与入参校验                             | Repository、Mapper、UI  |
| Mapper        | Entity → ViewModel                  | Repository、校验、业务规则    |
| Repository    | 数据访问、返回 Entity                      | ViewModel、校验、业务规则     |
| Entity        | 持久化字段                               | lessonBalance 等非持久化字段 |


#### 4.2.3 依赖方向（Forbidden Directions）

```
✅ 允许：
UI → Action → Service → Validator → Repository → Database
                      ↘ Mapper

❌ 禁止（写入 coding-rules 正交矩阵）：
Action → Repository / Prisma / Validator
Action → Mapper
UI → Service / Repository
Service → UI
Validator → Repository
Repository → Service / Mapper / ViewModel types
Mapper → Repository
Prisma import 出现在 Repository 以外任何层
ViewModel 类型出现在 Repository
```

#### 4.2.4 其他强制规则

- 新文件必须含文件头注释（用途、Feature）
- 修改 Schema 必须 ADR + migration
- Spec 外功能禁止实现
- 里程碑闸门：M1→M2→M3→M4，不得跨越

---

### 4.3 `prompts/` — 角色 Prompt

每个角色文件统一结构：

```markdown
# Role: {Name}

## Identity
## Responsibilities
## Forbidden
## Input（必读文档）
## Output Format
## Working Principles
## Review Checklist（本角色专用）
## Handoff（何时移交下一角色）
```

#### 角色设计摘要


| 角色                    | 核心职责                                      | 禁止              |
| --------------------- | ----------------------------------------- | --------------- |
| **Tech Lead**         | Spec/Plan Approval；Scope 裁决；ADR 方向        | 直接写业务代码         |
| **Architect**         | 分层设计；ADR 起草；依赖规则                          | 实现 UI；绕过 Review |
| **Backend Engineer**  | Repository / Service / Validator / Action | 改 Spec；跨层依赖     |
| **Frontend Engineer** | UI / 组件 / 页面 state                        | 触库；Action 写业务   |
| **Reviewer**          | Code/Progress Review；Checklist 执行         | 擅自改 Scope       |
| **QA**                | Acceptance 对照；测试场景                        | 改架构             |
| **Release Manager**   | Sprint Report；CHANGELOG；STATE             | 功能开发            |


**跨工具复用**：每个 `prompts/*.md` 文件顶部含 **System Prompt Block**（可直接 copy 到 Claude / ChatGPT / Cursor Rules）。

---

### 4.4 `workflow/` — 标准工作流

每个 workflow 统一结构：

```markdown
# Workflow: {Name}

## Purpose
## Trigger
## Input
## Roles Involved
## Steps（编号 + 角色 + 产出）
## Output
## Completion Criteria
## Stop Conditions
```

#### 工作流清单


| Workflow              | 触发             | 产出                          |
| --------------------- | -------------- | --------------------------- |
| **spec-review**       | Spec 初稿完成      | APPROVED / REVISE Spec      |
| **plan-review**       | Plan 初稿完成      | APPROVED FOR IMPLEMENTATION |
| **implementation**    | Plan Approved  | 代码 + Progress Report        |
| **code-review**       | PR / 里程碑完成     | Review Report               |
| **progress-review**   | M1/M2/M3/M4 完成 | 进入下一里程碑或 REVISE             |
| **sprint-acceptance** | Sprint 结束      | Sprint Report + TASKS Done  |


**与现有实践对齐**

- `spec-review` ← 已用于 Student Spec Rev 2
- `plan-review` ← Plan Rev 2 APPROVED
- `implementation` ← 里程碑闸门 + STATE/CHANGELOG 逐步更新
- `progress-review` ← SPRINT_PROGRESS_M1
- `sprint-acceptance` ← SPRINT_REPORT.md

---

### 4.5 `checklists/` — Review 清单

每个 checklist 为**可勾选 Markdown**（`- [ ]`）。


| Checklist    | 检查焦点                            |
| ------------ | ------------------------------- |
| architecture | Feature First、ADR 合规、Scope      |
| layering     | 依赖方向、coding-rules 矩阵            |
| naming       | 文件、类型、Action 命名约定               |
| repository   | 仅 Entity、无 ViewModel、无 N+1      |
| service      | Validator 入口、Mapper 映射、无 Prisma |
| action       | 薄 Action、仅调 Service             |
| ui           | 无触库、Spec UI 中立                  |
| sprint       | STATE/TASKS/CHANGELOG 更新        |
| acceptance   | Spec § Acceptance 逐条            |


**使用方式**：Reviewer / Tech Lead 在 Review 时复制 checklist 到 Review Report。

---

### 4.6 `templates/` — 文档模板


| 模板                       | 对应现有范例                          |
| ------------------------ | ------------------------------- |
| `adr.md`                 | `adr/006-student-schema.md`     |
| `spec.md`                | `specs/student.md` 结构           |
| `implementation-plan.md` | `specs/student/student.plan.md` |
| `progress-report.md`     | `SPRINT_PROGRESS_M1.md`         |
| `review-report.md`       | Tech Lead Review Comment 格式     |
| `sprint-report.md`       | `SPRINT_REPORT.md` 固定章节         |
| `risk-report.md`         | Plan §11 Risk 扩展                |
| `decision-record.md`     | 开放问题 / 待决策项                     |


**模板原则**

- 占位符 `{feature}`、`{sprint}`，不含 Student 业务字段
- 中英双语标题可选；正文默认中文（与项目一致）

---

## 5. 入口与发现机制

### 5.1 `.agent/README.md`（Framework 首页）

```markdown
# Agent Prompt Framework

## Start Here（新 Agent）
1. constitution.md
2. coding-rules.md
3. prompts/README.md → 选择角色
4. STATE.json → 当前 Sprint / 里程碑

## Document Stack 图
## 目录索引
## 与 Claude / Cursor / Codex 的使用说明
```

### 5.2 根目录 `AGENTS.md` 指向 Framework

现有 `AGENTS.md`（Next.js 生成）将追加一行指向 `.agent/README.md`。

### 5.3 Cursor / IDE 集成（可选，Implement 阶段）

- `.cursor/rules/agent-framework.mdc` → 引用 `constitution.md` + `coding-rules.md`
- 不替代 Framework 源文件，仅镜像

---

## 6. 设计原则（Framework 自身）


| 原则                    | 说明                                       |
| --------------------- | ---------------------------------------- |
| **Generic**           | 无 Student / Sprint 2 硬编码                 |
| **Reusable**          | 换 Feature / Sprint 仍适用                   |
| **Deterministic**     | 相同输入文档 → 相同流程与检查项                        |
| **Layered**           | Framework 不管业务 WHAT，管 HOW to collaborate |
| **Append-only ADR**   | Framework 引用 ADR，不合并 ADR 内容              |
| **No business logic** | 无 Prisma schema、无 API、无组件                |


---

## 7. 实施计划（Review 通过后）

### Phase A — 骨架（1 session）

1. 创建目录：`prompts/`、`workflow/`、`checklists/`、`templates/`
2. 写入 `constitution.md`、`coding-rules.md`、`.agent/README.md`
3. 各子目录 `README.md` 索引

### Phase B — 角色与流程（1 session）

1. 7 个 `prompts/*.md`
2. 6 个 `workflow/*.md`

### Phase C — 清单与模板（1 session）

1. 9 个 `checklists/*.md`
2. 8 个 `templates/*.md`

### Phase D — 集成（1 session）

1. 更新 `RULES.md` 引用 Framework 启动顺序
2. ADR-007：引入 Agent Prompt Framework
3. CHANGELOG + STATE

**预估文件数**：~35 个 Markdown（无代码）

---

## 8. 与现有 RULES.md 的合并策略


| RULES.md 条目      | 归属                                                               |
| ---------------- | ---------------------------------------------------------------- |
| 开发前读 `.agent`    | → `constitution.md` + Framework README                           |
| 更新 TASKS / STATE | → `workflow/implementation.md` + `checklists/sprint.md`          |
| 数据库改 DECISIONS   | → `coding-rules.md` + `templates/adr.md`                         |
| 不删 Decision      | → `constitution.md` 不可违背项                                        |
| 重大重构 REVIEW      | → `workflow/code-review.md`                                      |
| 架构冲突停止           | → 所有角色 `Forbidden`                                               |
| Sprint Report    | → `templates/sprint-report.md` + `workflow/sprint-acceptance.md` |


**不删除 RULES.md**；改为「操作型规则索引」，指向 Framework 具体文件。

---

## 9. 验收标准（Framework 本身）

Review 通过当且仅当：

1. 新 Agent 仅读 Framework 即可定位角色 Prompt 与 Workflow
2. `coding-rules.md` 依赖禁止矩阵完整且无歧义
3. 7 角色 × 6 工作流 × 9 清单 × 8 模板 齐备
4. 不含 Student / Sprint 2 业务内容
5. 与现有 ADR、Spec、Plan、Progress 范例结构一致
6. `PROJECT.md`、`RULES.md`、ADR 无冲突

---

## 10. 开放问题（待 Tech Lead Review）


| #   | 问题                                   | 建议                                  |
| --- | ------------------------------------ | ----------------------------------- |
| 1   | Framework 文档语言：全中文 vs 中英双语？          | 正文中文，角色 System Prompt Block 英文（跨工具） |
| 2   | `constitution.md` 是否替代 `PROJECT.md`？ | 否，并存；constitution 索引 PROJECT        |
| 3   | 是否新增 ADR-007 记录 Framework 引入？        | 是，Implement 时写入                     |
| 4   | Cursor rules 是否 Implement 阶段一并生成？    | 可选 Phase D                          |
| 5   | QA 角色是否本 Sprint 需要 E2E 工具约定？         | Framework 仅留占位，不写工具链                |


---

## 11. 下一步

```
Tech Lead Review 本文档
        ↓
  APPROVED → 按 §7 Phase A~D 生成正式 Framework 文件
  REVISE   → 修订设计后重新 Review
```

**当前状态：仅设计文档，未生成 Framework 正式文件。**

---

**等待 Tech Lead Review。**