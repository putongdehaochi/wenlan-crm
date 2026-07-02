# Sprint 4 Progress Report — M4（Acceptance + Integration）

> **里程碑**：M4 — Acceptance + Integration  
> **日期**：2026-06-30  
> **状态**：✅ APPROVED（2026-07-01 Tech Lead Final Review）  
> **Tech Lead Review**：Evidence APPROVED → Sprint 4 CLOSED

---

## 1. 联调环境

| 项 | 说明 |
|----|------|
| PostgreSQL | Prisma Dev 本地实例（端口 51214） |
| Migrations | `init_student` + `init_lesson_package` + `init_attendance` 已 apply |

---

## 2. 全链路验证

```
PostgreSQL
  → Repository (test:m1-attendance ✅)
  → Service (test:m2-attendance ✅)
  → Action (test:m4-attendance ✅)
  → UI (M3 build ✅ + 静态审计)
```

---

## 3. Acceptance（specs/attendance.md §5.3）

| # | 场景 | 结果 |
|---|------|------|
| 1 | 小明余额 8、未签 → 签到 → 已签到，余额 7 | ✅ |
| 2 | 小明今日已签 → 再签 → ALREADY_CHECKED_IN，余额不变 | ✅ |
| 3 | 小红余额 0 → INSUFFICIENT_BALANCE，无记录 | ✅ |
| 4 | 5 名学员依次签到 → 5 人均已签到 | ✅ |
| 5 | 小刚未到课 → 未签到，余额不变 | ✅ |
| 6 | 余额 1 → 签到 → 0，不可再签 | ✅ |
| 7 | 签到后 `/students` 余额与今日名单一致 | ✅ |
| 8 | 已归档学员 → STUDENT_ARCHIVED，无记录 | ✅ |

### 附加

| 场景 | 结果 |
|------|------|
| STUDENT_NOT_FOUND | ✅ |
| 3 已签 / 1 未签 | ✅ |
| 1 记录 = 1 扣课 | ✅ |
| UI 分层静态审计 | ✅ |

---

## 4. 全量回归

| 命令 | 结果 |
|------|------|
| `npm run test:m4-attendance` | ✅ |
| `npm run test:m1-attendance` / `test:m2-attendance` | ✅ |
| `npm run test:m4` / `test:m2` / `test:m1` | ✅ Student |
| `npm run test:m4-lesson` / `test:m2-lesson` / `test:m1-lesson` | ✅ Lesson |
| `npm run build` | ✅ |

---

## 5. 缺陷修复

M4 联调**未发现**需修改实现层的缺陷；无需 Design Change / ADR。

---

## 6. 文档同步

- `.agent/TASKS.md` — 快速签到 → Done
- `.agent/STATE.json` — sprint_4 closed
- `.agent/CHANGELOG.md` — Sprint 4 CLOSED
- `.agent/SPRINT_REPORT.md` — Sprint 4 CLOSED
- `.agent/SPRINT4_REVIEW_EVIDENCE.md` — Evidence APPROVED

---

## 7. Review Evidence（REQUEST_CHANGES 响应）

| Required Change | 证据 |
|-----------------|------|
| RC1 Acceptance 逐条 | Evidence 1 — §5.3 八条 + 源码行号 |
| RC2 Student 零改动 | Evidence 2 — 文件清单 + grep |
| RC3 Balance 唯一来源 | Evidence 3 — 调用链 + 禁止项 grep |
| RC4 UI Import 审计 | Evidence 4 — 四文件 import 表 |
| RC5 全量回归 | Evidence 5 — 10 命令，2026-07-01 All Passed |

---

## 8. Sprint 4 结论

| 里程碑 | 状态 |
|--------|------|
| M1 Schema / Repository | ✅ APPROVED |
| M2 Validator / Service / Actions | ✅ APPROVED |
| M3 Attendance UI | ✅ APPROVED |
| M4 Acceptance + Integration | ✅ APPROVED |

**Sprint 4：CLOSED** — Attendance Module 交付完成。

详见：`.agent/SPRINT4_REVIEW_EVIDENCE.md`
