# 架构决策记录

> 所有重要架构决策追加于此，不得覆盖历史记录。

---

## ADR-001：技术栈选型（2026-06-29）

**决策**

Sprint 1 起采用以下技术栈：

| 层级 | 选型 |
|------|------|
| 框架 | Next.js 15（App Router） |
| 语言 | TypeScript |
| UI | React + TailwindCSS + shadcn/ui |
| ORM | Prisma |
| 数据库 | PostgreSQL |
| 架构 | Feature First |

**原因**

- Next.js App Router 支持前后端同仓，适合书法工作室 MVP 快速迭代
- Prisma + PostgreSQL 提供类型安全的数据访问与生产级持久化
- Feature First 按业务功能垂直切分，避免 Sprint 2–4 模块耦合
- shadcn/ui 提供可定制的基础组件，减少 UI 搭建时间

**影响**

- 应用主目录：`frontend/`（Next.js 全栈单体）
- 原 `backend/` 目录暂不使用，后续可移除或作脚本用途
- 数据库迁移通过 Prisma 管理，位于 `frontend/prisma/`

---

## ADR-002：Feature First 目录约定（2026-06-29）

**决策**

```
src/
├── app/          # 路由薄层
├── features/     # 业务功能（students、lessons、attendance…）
└── shared/       # 跨功能共享（ui、lib、hooks、types）
```

shadcn/ui 组件统一放 `src/shared/components/ui/`。

**原因**

- 与 `docs/IMPLEMENTATION-SPRINT1-STUDENTS.md` 按领域拆模块的思路一致
- `features/` 内聚功能代码，`shared/` 避免循环依赖
- `app/` 只做路由组合，业务逻辑不进 page 文件

---

## ADR-003：Prisma 初始化策略（2026-06-29）

**决策**

- 数据库：PostgreSQL
- Schema 位置：`frontend/prisma/schema.prisma`
- Client 输出：`src/generated/prisma`
- Sprint 1 初始化阶段**不定义任何业务表**

**原因**

- 项目初始化与业务建模分离，等 Tech Lead Review 后再建 `students` 表
- 避免与 `DOMAIN.md` remainingLesson 开放问题提前耦合

**后续**

- 学生管理 Sprint 将追加 `Student` model 及首次 migration
