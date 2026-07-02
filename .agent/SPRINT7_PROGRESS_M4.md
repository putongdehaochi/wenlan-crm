# Sprint 7 Progress Report — M4（Acceptance + Integration）

> **里程碑**：M4 — Acceptance + Integration  
> **日期**：2026-07-01  
> **状态**：✅ APPROVED（2026-07-02 Tech Lead Final Review）  
> **Tech Lead Review**：Evidence APPROVED → **Sprint 7 CLOSED**  
> **前置**：Sprint 7 M3 APPROVED（S7-M3-REVIEW-001）

---

## 1. 联调环境


| 项          | 说明                                                |
| ---------- | ------------------------------------------------- |
| PostgreSQL | Prisma Dev 本地实例                                   |
| Migrations | `20260701120000_sprint7_attendance_audit`         |
| 验收脚本       | `scripts/m4-attendance-audit-acceptance.test.mts` |


---

## 2. 全链路验证

```
PostgreSQL
  → Repository (M1 ✅)
  → Service (M2 ✅)
  → Action (M4 ✅)
  → UI (M3 ✅ + build ✅)
```

---

## 3. Acceptance Evidence Summary

依据 `specs/attendance-audit.md` §6

### 3.1 Audit List（§6.1）


| #   | 场景                             | 结果  |
| --- | ------------------------------ | --- |
| AL1 | 混合列表含 voidedAt / lastEventType | ✅   |
| AL2 | status=VALID 筛选                | ✅   |
| AL3 | dateFrom/dateTo 闭区间            | ✅   |
| AL4 | studentId 筛选                   | ✅   |
| AL5 | 空列表 success                    | ✅   |


### 3.2 Audit Timeline（§6.2）


| #   | 场景                        | 结果  |
| --- | ------------------------- | --- |
| AT1 | 仅 CHECK_IN                | ✅   |
| AT2 | CHECK_IN → VOID 升序        | ✅   |
| AT3 | 三事件 + currentStatus=VALID | ✅   |
| AT4 | ATTENDANCE_NOT_FOUND      | ✅   |
| AT5 | Restore 后 VOID 保留         | ✅   |


### 3.3 Statistics（§6.3）


| #   | 场景             | 结果  |
| --- | -------------- | --- |
| ST1 | 口径符合 §3.3      | ✅   |
| ST2 | 日期范围聚合         | ✅   |
| ST3 | studentRank 降序 | ✅   |
| ST4 | 无数据全 0         | ✅   |


### 3.4 回归（§6.4）


| #   | 场景                          | 结果  |
| --- | --------------------------- | --- |
| R1  | void/restore Action 不变      | ✅   |
| R2  | listAttendanceHistory 不变    | ✅   |
| R3  | checkInStudent 不变           | ✅   |
| R4  | listStudents 余额一致           | ✅   |
| R5  | Statistics 无 studentService | ✅   |
| R6  | Audit UI Action Only        | ✅   |


### 3.5 Integration Checklist


| 检查点                                    | 结果  |
| -------------------------------------- | --- |
| voidAttendanceAction → lifecycle event | ✅   |
| Navigation Graph 四页闭环                  | ✅   |
| Timeline UI 无 sort / eventType 分支      | ✅   |
| Statistics UI 无客户端聚合                   | ✅   |


---

## 4. Regression Summary


| 命令                                   | 结果  |
| ------------------------------------ | --- |
| `npm run test:m4-attendance-audit`   | ✅   |
| `npm run test:m4-attendance-restore` | ✅   |
| `npm run test:m4-attendance-history` | ✅   |
| `npm run test:m4-attendance`         | ✅   |
| `npm run test:m4`                    | ✅   |
| `npm run test:m4-lesson`             | ✅   |
| M2 全量（6 条）                           | ✅   |
| M1 全量（7 条）                           | ✅   |
| `npm run build`                      | ✅   |


**合计：20 条 test 命令 + build — All Passed**

---

## 5. Architecture Regression Audit


| 检查项                                     | 结果  |
| --------------------------------------- | --- |
| `student.service` 无 statistics/audit 泄漏 | ✅   |
| Sprint 4 Check-in 回归                    | ✅   |
| Sprint 5 Void 回归                        | ✅   |
| Sprint 6 Restore/History 回归             | ✅   |
| Feature First 未破坏                       | ✅   |


---

## 6. 缺陷修复

M4 联调**未发现**需修改实现层的缺陷；无需 Design Change / ADR。

---

## 7. 文档同步

- `.agent/SPRINT7_REVIEW_EVIDENCE.md` — Evidence 包
- `.agent/SPRINT7_PROGRESS_M4.md` — 本报告
- `.agent/CHANGELOG.md` — M4 条目
- `.agent/STATE.json` — `closed` · `current_sprint = Sprint 8`

---

## 8. Sprint 7 里程碑


| 里程碑                         | 状态               |
| --------------------------- | ---------------- |
| M1 Repository               | ✅ APPROVED       |
| M2 Service / Actions        | ✅ APPROVED       |
| M3 Audit / Statistics UI    | ✅ APPROVED       |
| M4 Acceptance + Integration | ✅ APPROVED |


---

**Tech Lead Final Review APPROVED — Sprint 7 CLOSED（2026-07-02）**

详见：`.agent/SPRINT7_REVIEW_EVIDENCE.md`