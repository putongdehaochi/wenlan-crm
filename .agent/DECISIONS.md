# 架构决策记录（索引）

> 各 ADR 以独立文件存放于 `.agent/adr/`，**不得删除历史文件**。
>
> 新增决策：创建下一编号 ADR 文件，并更新本索引。

---

## ADR 清单


| 编号  | 文件                                                                                 | 标题                                       | 状态                   | 日期         |
| --- | ---------------------------------------------------------------------------------- | ---------------------------------------- | -------------------- | ---------- |
| 001 | [adr/001-tech-stack.md](./adr/001-tech-stack.md)                                   | 技术栈选型                                    | 已采纳                  | 2026-06-29 |
| 002 | [adr/002-feature-first.md](./adr/002-feature-first.md)                             | Feature First 目录约定                       | 已采纳                  | 2026-06-29 |
| 003 | [adr/003-prisma-init.md](./adr/003-prisma-init.md)                                 | Prisma 初始化策略                             | 已采纳                  | 2026-06-29 |
| 004 | [adr/004-student-no-remaining-lesson.md](./adr/004-student-no-remaining-lesson.md) | Student 禁止存储 remainingLesson             | 已采纳                  | 2026-06-29 |
| 005 | [adr/005-student-household-evolution.md](./adr/005-student-household-evolution.md) | Student 未来演进为 Household                  | 已采纳（方向性）             | 2026-06-29 |
| 006 | [adr/006-student-schema.md](./adr/006-student-schema.md)                           | Student Schema                           | 已采纳                  | 2026-06-29 |
| 007 | [adr/007-lesson-balance.md](./adr/007-lesson-balance.md)                           | 课时余额计算规则（lessonBalance）                  | 已采纳                  | 2026-06-29 |
| 008 | [adr/008-lesson-package-schema.md](./adr/008-lesson-package-schema.md)             | LessonPackage Schema                     | 已采纳                  | 2026-06-29 |
| 009 | [adr/009-attendance.md](./adr/009-attendance.md)                                   | Attendance Schema 与签到扣课规则                | 已采纳                  | 2026-06-29 |
| 010 | [adr/010-attendance-prisma-schema.md](./adr/010-attendance-prisma-schema.md)       | Attendance Prisma Schema（M1）             | 已采纳                  | 2026-06-29 |
| 011 | [adr/011-attendance-history.md](./adr/011-attendance-history.md)                   | Attendance History、Undo、Evolution（Rev 3） | 已采纳（Sprint 5 CLOSED） | 2026-07-01 |
| 012 | [adr/012-attendance-restore.md](./adr/012-attendance-restore.md)                   | Attendance Restore、History Filter 演进     | 已采纳（Sprint 6 CLOSED） | 2026-07-01 |
| 013 | [adr/013-attendance-audit.md](./adr/013-attendance-audit.md)                       | Audit Timeline、Statistics 架构             | 已采纳（Sprint 7 CLOSED） | 2026-07-02 |
| 014 | [adr/014-attendance-export-trend.md](./adr/014-attendance-export-trend.md)         | Export CSV、Monthly Trend、Remaining Rank  | 已采纳（Sprint 8 CLOSED） | 2026-07-02 |


---

## 如何追加新 ADR

1. 在 `.agent/adr/` 创建 `{编号}-{slug}.md`
2. 在本表追加一行
3. 在 `CHANGELOG.md` 记录原因