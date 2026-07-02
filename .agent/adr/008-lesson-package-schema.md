# ADR-008：LessonPackage Schema

| 项 | 内容 |
|----|------|
| 状态 | 已采纳 |
| 日期 | 2026-06-29 |
| 决策者 | Sprint 3 M1 |
| 关联 | ADR-007 · `specs/lesson.md` |

## 决策

新增 `lesson_packages` 表，每笔购课一条记录：

| 列 | 说明 |
|----|------|
| `id` | cuid 主键 |
| `student_id` | FK → students，ON DELETE RESTRICT |
| `quantity` | 正整数；CHECK > 0 |
| `note` | 可选备注 |
| `purchased_at` | 购课时间 |
| `created_at` | 记录创建时间 |

**禁止**在本表存储 `remainingQuantity` / `consumed`（ADR-007）。

## 原因

- 对应 `DOMAIN.md` 课时包概念
- 余额由 `lesson-balance.repository` 聚合计算
- 多笔购课追加写入，支持续费场景

## 影响

- `Student` 新增 `lessonPackages` 关系
- Migration `20260629140000_init_lesson_package`
