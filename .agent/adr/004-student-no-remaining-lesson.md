# ADR-004：Student 禁止存储 remainingLesson

| 项 | 内容 |
|----|------|
| 状态 | 已采纳 |
| 日期 | 2026-06-29 |
| 决策者 | Tech Lead（Sprint 1 Review） |

## 决策

**`Student` 模型及一切持久化层不得包含 `remainingLesson`（或等价命名）字段。**

剩余课时必须**实时计算**，来源于：

```
剩余课时 = 课时包充值总和 − 有效签到消耗总和（± 未来调整项）
```

## 原因

- 单一事实来源：避免 stored balance 与明细账本不一致（见 `docs/DOMAIN.md` 方案 B 分析）
- 撤销签到、调账时只需修改明细记录，余额自动正确
- 天然支持多课时包汇总
- 可追溯、可审计

## 影响

| 层面 | 要求 |
|------|------|
| Prisma Schema | `Student` 表无 `remainingLesson` / `remaining_lessons` 等字段 |
| API / Server Actions | 不得读写该字段 |
| UI 列表 | 「剩余课时」列为计算结果，非持久化属性 |
| Sprint 2 学生列表 | 新学员无课时包时显示 `0` |

## 禁止

- 在 `Student` 上缓存剩余课时以「加速查询」
- 在签到 / 充值时同步更新 Student 上的课时数字段
- 使用 Redis / 内存缓存替代计算并当作权威数据源

## 允许的优化（须另立 ADR）

- 只读视图、物化视图、数据库 computed column——若引入须新 ADR 且不得违背单一事实来源原则

## 相关文档

- `docs/DOMAIN.md` §四 — remainingLesson 存算分析
- `docs/ACCEPTANCE.md` §1 — 新学员剩余课时为 0

## 替代方案（已否决）

- **方案 A**：Student 存储 remainingLesson — 已否决，同步风险高、多课时包难扩展
