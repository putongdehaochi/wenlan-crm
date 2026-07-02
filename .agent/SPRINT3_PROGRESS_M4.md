# Sprint 3 Progress Report — M4（Acceptance + Integration）

> **里程碑**：M4 — Acceptance + Integration  
> **日期**：2026-06-29  
> **状态**：✅ APPROVED  
> **Tech Lead Review**：2026-06-29

---

## 1. 联调环境


| 项          | 说明                                             |
| ---------- | ---------------------------------------------- |
| PostgreSQL | Prisma Dev 本地实例                                |
| Migrations | `init_student` + `init_lesson_package` 已 apply |


---

## 2. 全链路验证

```
PostgreSQL
  → Repository (test:m1-lesson ✅)
  → Service (test:m2-lesson ✅)
  → Action (test:m4-lesson ✅)
  → UI (M3 build ✅ + 静态审计)
```

---

## 3. Acceptance（specs/lesson.md §5.3）


| #   | 场景                | 结果  |
| --- | ----------------- | --- |
| 1   | 小明 0→10，列表与详情一致   | ✅   |
| 2   | 小红 2→22           | ✅   |
| 3   | 10+5=15，两条购课记录    | ✅   |
| 4   | STUDENT_NOT_FOUND | ✅   |
| 5   | quantity 0 校验     | ✅   |
| 6   | quantity −5 校验    | ✅   |
| 7   | STUDENT_ARCHIVED  | ✅   |
| 8   | 多学员列表余额           | ✅   |


### 附加


| 场景        | 结果  |
| --------- | --- |
| 大量课时 100  | ✅   |
| 最小课时 1    | ✅   |
| UI 分层静态审计 | ✅   |


---

## 4. 全量回归


| 命令                                   | 结果                   |
| ------------------------------------ | -------------------- |
| `npm run test:m4-lesson`             | ✅                    |
| `npm run test:m4`                    | ✅ Student Acceptance |
| `npm run test:m2-lesson` / `test:m2` | ✅                    |
| `npm run test:m1-lesson` / `test:m1` | ✅                    |
| `npm run build`                      | ✅                    |


---

## 5. 缺陷修复

M4 联调**未发现**需修改实现层的缺陷；无需 Design Change / ADR。

---

## 6. 文档同步

- `.agent/TASKS.md` — 为学生录入课时 → Done
- `.agent/STATE.json` — M4 awaiting_review
- `.agent/CHANGELOG.md` — M4 条目
- `.agent/SPRINT_REPORT.md` — Sprint 3 完整报告

---

## 7. Sprint 3 结论


| 里程碑 | 状态         |
| --- | ---------- |
| M1  | ✅ APPROVED |
| M2  | ✅ APPROVED |
| M3  | ✅ APPROVED |
| M4  | ✅ APPROVED |

**Sprint 3：CLOSED** — Lesson Module 交付完成，允许进入 Sprint 4（快速签到 / Attendance Module）。

### Sprint 4 前建议（非阻塞）

1. Attendance 仅改 `lesson-balance.repository` 内部公式
2. 保持 `features/attendance/` 目录规范
3. 统一测试体系（Repository / Service / Acceptance）
4. 新能力 Spec → Plan → ADR → Code

---

**Sprint 3 已关闭。**