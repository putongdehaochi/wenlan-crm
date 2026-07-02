# Sprint 5 Progress Report — M4（Acceptance + Integration）

> **里程碑**：M4 — Acceptance + Integration  
> **日期**：2026-07-01  
> **状态**：✅ APPROVED（2026-07-01 Tech Lead Final Review）  
> **Tech Lead Review**：Evidence APPROVED → **Sprint 5 CLOSED**

---

## 1. 联调环境

| 项 | 说明 |
|----|------|
| PostgreSQL | Prisma Dev 本地实例 |
| Migrations | 无新增（Sprint 5 零 Schema 变更） |
| 验收脚本 | `scripts/m4-attendance-history-acceptance.test.mts` |

---

## 2. 全链路验证

```
PostgreSQL
  → Repository (test:m1-attendance-history ✅)
  → Service (test:m2-attendance-history ✅)
  → Action (test:m4-attendance-history ✅)
  → UI (build ✅ + 静态审计)
```

---

## 3. Acceptance Evidence Summary

依据 `specs/attendance-history.md` §7

### 3.1 History（§7.1）

| # | 场景 | 结果 |
|---|------|------|
| H1 | 3 条 VALID 倒序 + studentName | ✅ |
| H2 | studentId 筛选 | ✅ |
| H3 | 多学员姓名正确 | ✅ |
| H4 | 无签到空列表 | ✅ |
| H5 | 无效 studentId → STUDENT_NOT_FOUND | ✅ |
| H6 | 归档学员历史可查 | ✅ |

### 3.2 Undo（§7.2）

| # | 场景 | 结果 |
|---|------|------|
| U1 | VALID→VOIDED，余额 7→8 | ✅ |
| U2 | 重复撤销 → ALREADY_VOIDED | ✅ |
| U3 | 不存在 → ATTENDANCE_NOT_FOUND | ✅ |
| U4 | History VOIDED + canVoid=false | ✅ |
| U5 | 撤销后 Today NOT_CHECKED_IN | ✅ |

### 3.3 回归（§7.3）

| # | 场景 | 结果 |
|---|------|------|
| R1 | Sprint 4 checkInStudentAction 仍成功 | ✅ |
| R2 | listStudents 余额与公式一致 | ✅ |
| R3 | UI Import 审计 | ✅ |

### 3.4 M4 Work Order 八项

| # | 场景 | 结果 |
|---|------|------|
| 1 | 历史倒序 | ✅ H1 |
| 2 | studentId 筛选 | ✅ H2 |
| 3 | VALID→VOIDED + 余额恢复 | ✅ U1 |
| 4 | ALREADY_VOIDED | ✅ U2 |
| 5 | ATTENDANCE_NOT_FOUND | ✅ U3 |
| 6 | 三处余额一致 | ✅ M4 #6 |
| 7 | VOIDED 状态展示 | ✅ U4 |
| 8 | canVoid=false 不可再撤 | ✅ U4 |

---

## 4. Regression Summary

| 命令 | 结果 |
|------|------|
| `npm run test:m4-attendance-history` | ✅ |
| `npm run test:m4` | ✅ |
| `npm run test:m4-lesson` | ✅ |
| `npm run test:m4-attendance` | ✅ |
| `npm run test:m2` | ✅ |
| `npm run test:m2-lesson` | ✅ |
| `npm run test:m2-attendance` | ✅ |
| `npm run test:m2-attendance-history` | ✅ |
| `npm run test:m1` | ✅ |
| `npm run test:m1-lesson` | ✅ |
| `npm run test:m1-attendance` | ✅ |
| `npm run test:m1-attendance-history` | ✅ |
| `npm run build` | ✅ |

---

## 5. Architecture Regression Audit

| 检查项 | 结果 |
|--------|------|
| `student.service` 无 attendance 引用 | ✅ |
| `student.service` 无 `findByIds` 消费 | ✅ |
| `lesson-balance.repository` 契约保留 | ✅ |
| Sprint 4 Check-in 回归 | ✅ `test:m4-attendance` |
| Feature First 未破坏 | ✅ |
| 无新增 Design Change / ADR | ✅ |

---

## 6. 缺陷修复

M4 联调**未发现**需修改实现层的缺陷；无需 Design Change / ADR。

**已知边界**（Design 已记录）：同日撤销后再签到受 `studentId+attendanceDate` 唯一约束，归 Future Restore。

---

## 7. 文档同步

- `.agent/TASKS.md` — 查看签到记录 → Done
- `.agent/STATE.json` — sprint_5 `closed` · current_sprint `Sprint 6`
- `.agent/CHANGELOG.md` — Sprint 5 CLOSED
- `.agent/SPRINT_REPORT.md` — Sprint 5 CLOSED
- `.agent/SPRINT5_REVIEW_EVIDENCE.md` — Evidence APPROVED

---

## 8. Sprint 5 里程碑

| 里程碑 | 状态 |
|--------|------|
| M1 Schema / Repository | ✅ APPROVED |
| M2 Validator / Service / Actions | ✅ APPROVED |
| M3 Attendance History UI | ✅ APPROVED |
| M4 Acceptance + Integration | ✅ APPROVED |

**Sprint 5：CLOSED** — Attendance History + Undo 交付完成。

详见：`.agent/SPRINT5_REVIEW_EVIDENCE.md`
