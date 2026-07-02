# ADR-005：Student 未来演进为 Household

| 项 | 内容 |
|----|------|
| 状态 | 已采纳（方向性记录） |
| 日期 | 2026-06-29 |
| 决策者 | Tech Lead（Sprint 2 Spec Review） |

## 背景

书法工作室现实中，多位学员常属于同一家庭（同一联系人、共用电话、统一续费）。当前 Sprint 2 以 **Student** 为独立实体建模，满足 MVP 最小需求。

## 决策

**记录未来演进方向：Student 可能演进为 Household（家庭/联系人单元）模型，当前 Sprint 不实现。**

### 当前 Sprint 2（不变）

- 以 `Student` 为独立档案
- `contactName` 必填，表示当前联系人（通常为家长）
- `phone` 可选，允许多学员共用或留空

### 未来演进方向（未实施）

```
Household（家庭单元）
  ├── 联系人信息（姓名、电话…）
  └── Student[]（关联学员）
```

**可能收益**

- 同一家庭多学员共享联系信息与续费上下文
- 续费提醒、课时查询可按家庭聚合
- 减少重复录入联系人

**可能影响**

- Student 与 Household 外键关联
- 列表 / 详情 ViewModel 需携带 household 上下文
- 重复校验规则从「学员维度」转为「家庭 + 学员」维度

## 约束

- Sprint 2 **不得**提前引入 Household 表或 UI
- Sprint 2 Schema 设计应**避免**与 Household 演进硬冲突（如不将 contactName 语义绑定为不可变唯一键）
- 若启动 Household 演进，须另立 ADR，不得覆盖本文件

## 相关文档

- `specs/student.md` — Sprint 2 Student Spec
- `docs/DOMAIN.md` — Student 领域对象
