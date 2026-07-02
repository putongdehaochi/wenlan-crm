# Sprint 6 Progress Report — M4（Acceptance + Integration）

> **里程碑**：M4 — Acceptance + Integration  
> **日期**：2026-07-01  
> **状态**：✅ APPROVED（2026-07-01 Tech Lead Final Review）  
> **Tech Lead Review**：Evidence APPROVED → **Sprint 6 CLOSED**

---

## 1. 联调环境

| 项 | 说明 |
|----|------|
| PostgreSQL | Prisma Dev 本地实例 |
| Migrations | 无新增（Sprint 6 零 Schema 变更） |
| 验收脚本 | `scripts/m4-attendance-restore-acceptance.test.mts` |

---

## 2. 全链路验证

```
PostgreSQL
  → Repository (test:m1-attendance-restore ✅)
  → Service (test:m2-attendance-restore ✅)
  → Action (test:m4-attendance-restore ✅)
  → UI (build ✅ + 静态审计)
```

---

## 3. Acceptance Evidence Summary

依据 `specs/attendance-restore.md` §5

### 3.1 Restore（§5.1）

| # | 场景 | 结果 |
|---|------|------|
| RS1 | VOIDED→VALID，余额 8→7 | ✅ |
| RS2 | 再次 Restore → ALREADY_VALID | ✅ |
| RS3 | 不存在 → ATTENDANCE_NOT_FOUND | ✅ |
| RS4 | 余额 0 → INSUFFICIENT_BALANCE | ✅ |
| RS5 | Restore 后 Today CHECKED_IN | ✅ |
| RS6 | History canVoid=true · canRestore=false | ✅ |

### 3.2 History Filter（§5.2）

| # | 场景 | 结果 |
|---|------|------|
| HF1 | dateFrom/dateTo 筛选 2 条 | ✅ |
| HF2 | studentId + 日期组合 | ✅ |
| HF3 | 无参数 Sprint 5 行为 | ✅ |
| HF4 | dateFrom > dateTo → VALIDATION_ERROR | ✅ |

### 3.3 回归（§5.3）

| # | 场景 | 结果 |
|---|------|------|
| R1 | voidAttendanceAction 不变 | ✅ |
| R2 | checkInStudentAction 不变 | ✅ |
| R3 | listStudents 余额公式一致 | ✅ |
| R4 | UI Import 审计 | ✅ |

### 3.4 Restore Regression Checklist

| 检查点 | 结果 |
|--------|------|
| RestoreResult.lessonBalance | ✅ |
| History status / canVoid | ✅ |
| Today CHECKED_IN + balance | ✅ |
| Student List / Detail balance | ✅ |
| checkedInAt 不变 | ✅ |

---

## 4. Regression Summary

| 命令 | 结果 |
|------|------|
| `npm run test:m4-attendance-restore` | ✅ |
| `npm run test:m4-attendance-history` | ✅ |
| `npm run test:m4-attendance` | ✅ |
| `npm run test:m4-lesson` | ✅ |
| `npm run test:m4` | ✅ |
| `npm run test:m2-attendance-restore` | ✅ |
| `npm run test:m2-attendance-history` | ✅ |
| `npm run test:m2-attendance` | ✅ |
| `npm run test:m2-lesson` | ✅ |
| `npm run test:m2` | ✅ |
| `npm run test:m1-attendance-restore` | ✅ |
| `npm run test:m1-attendance-history` | ✅ |
| `npm run test:m1-attendance` | ✅ |
| `npm run test:m1-lesson` | ✅ |
| `npm run test:m1` | ✅ |
| `npm run build` | ✅ |

**合计：16 条 test 命令 + build — All Passed**

---

## 5. Architecture Regression Audit

| 检查项 | 结果 |
|--------|------|
| `student.service` 无 attendance 引用 | ✅ |
| `lesson-balance.repository` 契约保留 | ✅ |
| Sprint 4 Check-in 回归 | ✅ |
| Sprint 5 Void 回归 | ✅ |
| Feature First 未破坏 | ✅ |
| 无新增 Design Change / ADR | ✅ |

---

## 6. 缺陷修复

M4 联调**未发现**需修改实现层的缺陷；无需 Design Change / ADR。

---

## 7. 文档同步

- `.agent/SPRINT6_REVIEW_EVIDENCE.md` — Evidence 包（含 UI Flow · Query Matrix · Checklist）
- `.agent/SPRINT_REPORT.md` — Sprint 6 待 Final Review
- `.agent/CHANGELOG.md` — M4 条目
- `.agent/STATE.json` — `awaiting_final_review`
- `.agent/TASKS.md` — 恢复签到 + 历史筛选 → Done

---

## 8. Sprint 6 里程碑

| 里程碑 | 状态 |
|--------|------|
| M1 Repository | ✅ APPROVED |
| M2 Service / Actions | ✅ APPROVED |
| M3 History UI | ✅ APPROVED |
| M4 Acceptance + Integration | ✅ APPROVED |

**Sprint 6：CLOSED** — Attendance Restore + History Filter 交付完成。

详见：`.agent/SPRINT6_REVIEW_EVIDENCE.md`
