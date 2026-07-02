# Sprint Progress Report — M4（Acceptance + Integration）

> **里程碑**：M4 — Acceptance + Integration  
> **日期**：2026-06-29  
> **状态**：✅ APPROVED  
> **Tech Lead Review**：2026-06-29  
> **前置**：M3 APPROVED

---

## 1. 联调环境

| 项 | 说明 |
|----|------|
| PostgreSQL | `npx prisma dev -d`（Prisma Dev 本地实例，端口 51214） |
| Migration | `20260629120000_init_student` 已 apply |
| `.env` | `DATABASE_URL` 指向 Prisma Dev TCP 连接 |

> Docker Desktop 未运行；M4 使用 Prisma Dev 完成真实 PostgreSQL 联调。生产/团队环境可改用 Docker Compose（见 `.env.example`）。

---

## 2. 全链路验证

```
PostgreSQL
  → Prisma Migration
  → Repository (M1 test:m1 ✅)
  → Service (M2 test:m2 ✅)
  → Action (M4 test:m4 ✅)
  → UI (M3 build ✅ + 详情只读静态审计)
```

| 命令 | 结果 |
|------|------|
| `npx prisma migrate deploy` | ✅ |
| `npm run test:m1` | ✅ |
| `npm run test:m2` | ✅ |
| `npm run test:m4` | ✅ |
| `npm run build` | ✅ |

---

## 3. Acceptance（specs/student.md §5.4）

| # | 场景 | 验证方式 | 结果 |
|---|------|----------|------|
| 1 | 空名册 → 创建小明/明妈 → 列表 1 条，lessonBalance=0 | `test:m4` | ✅ |
| 2 | 重复姓名+联系人 | `test:m4` DUPLICATE_STUDENT | ✅ |
| 3 | 张伟+张妈 → 张伟+李妈，列表 2 条 | `test:m4` | ✅ |
| 4 | 查看详情，只读无编辑 | `getStudentAction` + `StudentDetailView` 静态审计 | ✅ |
| 5 | 联系人为空 → 校验失败 | `test:m4` VALIDATION_ERROR | ✅ |
| 6 | 电话留空 → 创建成功 | `test:m4` | ✅ |
| 7 | 两学员共用电话 | `test:m4` | ✅ |

### 附加（Tech Lead M4 / §5.1）

| 场景 | 结果 |
|------|------|
| 空列表（test prefix） | ✅ |
| lessonBalance 默认值 0（列表/详情/创建返回） | ✅ |
| 不存在学生 STUDENT_NOT_FOUND | ✅ |
| 姓名为空 VALIDATION_ERROR | ✅ |
| 已归档学员同名同联系人 → DUPLICATE_STUDENT | ✅ |

---

## 4. 新增交付物

| 文件 | 说明 |
|------|------|
| `scripts/m4-student-acceptance.test.mts` | M4 验收脚本（Action 层入口） |
| `package.json` | `test:m4` script |

---

## 5. 缺陷修复

M4 联调**未发现**需修改实现层的缺陷；无需 Design Change / ADR。

---

## 6. 文档同步

- `.agent/TASKS.md` — 录入学生 → Done
- `.agent/STATE.json` — M3 approved，M4 awaiting_review
- `.agent/CHANGELOG.md` — M4 条目
- `.agent/SPRINT_REPORT.md` — Sprint 2 完整报告（覆盖 Sprint 1）

---

## 7. Tech Lead Review 结论

| 里程碑 | 状态 |
|--------|------|
| M1 数据层 | ✅ APPROVED |
| M2 业务层 | ✅ APPROVED |
| M3 UI | ✅ APPROVED |
| M4 Acceptance | ✅ APPROVED |

**Sprint 2：CLOSED** — Student Module 交付完成，允许进入 Sprint 3（课时录入 / Lesson Module）。

### Sprint 3 前建议（非阻塞）

1. 逐步统一 unit / integration / acceptance 测试体系
2. 沉淀共享 UI 组件（Dialog Form、Validation Error、Action Result Hook、Table Empty State）
3. 保持 Feature First，Student 与 Lesson 不耦合
4. 新能力继续 Spec → Plan → ADR → Code

---

**Sprint 2 已关闭。**
