# ADR-001：技术栈选型

| 项 | 内容 |
|----|------|
| 状态 | 已采纳 |
| 日期 | 2026-06-29 |
| 修订 | 2026-06-29 — 仓库合并至根目录（Sprint 1 Review 后） |

## 决策

| 层级 | 选型 |
|------|------|
| 框架 | Next.js 15（App Router） |
| 语言 | TypeScript |
| UI | React + TailwindCSS + shadcn/ui |
| ORM | Prisma |
| 数据库 | PostgreSQL |
| 架构 | Feature First |

## 原因

- Next.js App Router 支持前后端同仓，适合书法工作室 MVP 快速迭代
- Prisma + PostgreSQL 提供类型安全的数据访问与生产级持久化
- Feature First 按业务功能垂直切分，避免 Sprint 2–4 模块耦合
- shadcn/ui 提供可定制的基础组件，减少 UI 搭建时间

## 影响

- 应用位于**仓库根目录**（单一 Git 仓库，无 `frontend/` 嵌套层）
- 已删除废弃的 `backend/` 目录
- 数据库迁移通过 Prisma 管理，位于 `prisma/`

## 替代方案（已否决）

- 前后端分离双仓：对 MVP 过重
- SQLite：Tech Lead 指定 PostgreSQL
