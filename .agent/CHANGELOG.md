# 变更日志

## 2026-06-29 — Sprint 1 项目初始化

### 新增

- `frontend/` — Next.js 15 + TypeScript + TailwindCSS + shadcn/ui 应用
- `frontend/prisma/schema.prisma` — Prisma 初始化（无业务表）
- `frontend/prisma.config.ts` — Prisma 配置
- `frontend/.env.example` — 数据库连接模板
- `frontend/ARCHITECTURE.md` — Feature First 目录约定
- `frontend/src/features/` — 业务功能目录（空）
- `frontend/src/shared/` — 共享组件、lib、hooks、types

### 修改

- `.agent/DECISIONS.md` — ADR-001 ~ ADR-003 技术栈与架构决策
- `.agent/STATE.json` — version 0.1.0，current_task 录入学生，completed 追加 Project Initialization

### 原因

Sprint 1 正式开始，按已确认 Architecture Decision 初始化项目骨架，尚未开发学生管理功能。

---

## 2026-06-29 — Sprint Planning

### 新增

- `docs/ACCEPTANCE.md` — MVP 五项功能验收标准（Given / When / Then，含正常 / 异常 / 边界场景）

### 修改

- `STATE.json` — version 0.0.5，completed 追加 Sprint Planning

### 原因

进入 Sprint Planning 阶段，为 Phase1 MVP 编写可验收的业务标准，供开发与 Review 对齐。

---

## 2026-06-29 — Business Flow Design

### 新增

- `docs/FLOW.md` — 六项核心业务流程（新增学生、购买课时、今日签到、自动扣课时、查看剩余课时、撤销签到）

### 修改

- `STATE.json` — version 0.0.4，completed 追加 Business Flow Design

### 原因

进入 Business Flow Design 阶段，基于 DOMAIN.md 梳理现实业务流转，留待 Tech Lead Review。

---

## 2026-06-29 — Domain Modeling

### 新增

- `docs/DOMAIN.md` — 现实世界业务对象、签到流程分解、remainingLesson 开放问题分析

### 修改

- `STATE.json` — version 0.0.3，completed 追加 Domain Modeling

### 原因

进入 Domain Modeling 阶段，从业务视角定义对象与行为，remainingLesson 存算问题留待 Tech Lead Review。

---

## 2026-06-29 — Product Planning

### 修改

- `PROJECT.md` — 重写项目目标与 MVP 边界，聚焦「课时闭环」三件事
- `TASKS.md` — 按 Phase1/2/3 重组，移除全部技术词，改为用户可感知功能
- `STATE.json` — 精简为 version / phase / current_task / completed / last_update

### 原因

进入 Product Planning 阶段，明确 MVP 范围，任务与状态对齐产品视角。

---

## 2026-06-29 — 初始化

### 新增

- `.agent/` — AI Native 工作流目录
  - `PROJECT.md` — 项目目标与 MVP 定义
  - `TASKS.md` — 任务看板（第一版）
  - `STATE.json` — 项目状态快照
  - `DECISIONS.md` — 架构决策记录
  - `CHANGELOG.md` — 变更日志
  - `REVIEW.md` — 人工 Review 与重构备忘
  - `RULES.md` — AI 工作流规则
- `frontend/` — 前端目录（空）
- `backend/` — 后端目录（空）
- `database/` — 数据库目录（空）
- `docs/` — 文档目录（空）
- `scripts/` — 脚本目录（空）

### 原因

初始化 AI Native Project Workflow，建立项目骨架与协作规范，尚未安装依赖或编写业务代码。