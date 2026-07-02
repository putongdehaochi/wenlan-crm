# ADR-006：Student Schema

| 项 | 内容 |
|----|------|
| 状态 | 已采纳 |
| 日期 | 2026-06-29 |
| Sprint | Sprint 2 — M1 |

## 决策

### Student 表

| 字段 | 类型 | 约束 |
|------|------|------|
| id | String (cuid) | PK |
| name | String | NOT NULL |
| contact_name | String | NOT NULL |
| phone | String | NULL |
| note | String | NULL |
| status | StudentStatus | NOT NULL，默认 ACTIVE |
| created_at | DateTime | NOT NULL |
| updated_at | DateTime | NOT NULL |

### StudentStatus 枚举

| 值 | Sprint 2 |
|----|----------|
| ACTIVE | 使用 |
| ARCHIVED | Schema 预留 |

### 唯一约束

- `@@unique([name, contact_name])` — 对齐 Spec：同名同联系人不可重复
- `phone` 无唯一约束 — 允许多学员共用或留空

## 禁止（ADR-004 合规）

- 不得包含 `remaining_lessons` / `lesson_balance` 等余额字段

## 原因

- 对齐 `specs/student.md` Rev 2 数据字段
- contactName 必填、phone 可选
- 数据库层 enforce 业务唯一性，配合 Service 层 exists 检查

## 影响

- 首次 migration：`init_student`
- Repository 返回 `StudentEntity`，不含 ViewModel 字段

## 相关

- ADR-004、ADR-005
- `specs/student/student.plan.md` §4
