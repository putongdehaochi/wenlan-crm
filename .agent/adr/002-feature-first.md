# ADR-002：Feature First 目录约定

| 项 | 内容 |
|----|------|
| 状态 | 已采纳 |
| 日期 | 2026-06-29 |

## 决策

```
src/
├── app/          # 路由薄层
├── features/     # 业务功能（students、lessons、attendance…）
└── shared/       # 跨功能共享（ui、lib、hooks、types）
```

shadcn/ui 组件统一放 `src/shared/components/ui/`。

## 原因

- 与 `docs/IMPLEMENTATION-SPRINT1-STUDENTS.md` 按领域拆模块的思路一致
- `features/` 内聚功能代码，`shared/` 避免循环依赖
- `app/` 只做路由组合，业务逻辑不进 page 文件

## 约束

- 功能代码不得跨 `features/` 边界直接引用私有模块
- 通用 UI / 工具必须放 `shared/`
