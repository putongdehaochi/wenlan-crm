# ADR-003：Prisma 初始化策略

| 项 | 内容 |
|----|------|
| 状态 | 已采纳 |
| 日期 | 2026-06-29 |
| 修订 | 2026-06-29 — schema 路径更新为仓库根 `prisma/` |

## 决策

- 数据库：PostgreSQL
- Schema 位置：`prisma/schema.prisma`
- 配置：`prisma.config.ts`
- Client 输出：`src/generated/prisma`
- Sprint 1 初始化阶段**不定义任何业务表**

## 原因

- 项目初始化与业务建模分离，等业务 Review 后再建表
- 避免与 remainingLesson 设计决策提前耦合（见 ADR-004）

## 后续

- Sprint 2 将追加 `Student` model 及首次 migration

## 约束

- 修改 schema 必须同步更新 DECISIONS 索引并追加/修订对应 ADR
- 不得在未记录 ADR 的情况下引入业务表
