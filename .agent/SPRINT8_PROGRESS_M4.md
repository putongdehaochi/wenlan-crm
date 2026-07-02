# Sprint 8 Progress Report — M4（Acceptance + Close-out）

> **里程碑**：M4 — Acceptance Test + Evidence Pack  
> **日期**：2026-07-02  
> **状态**：✅ APPROVED（2026-07-02 Tech Lead Final Close-out）→ **Sprint 8 CLOSED**  
> **前置**：Sprint 8 M3 APPROVED（S8-M3-REVIEW-001）

---

## 1. M4 交付范围（仅验收，无新编码）


| 项                                                        | 说明                                                               |
| -------------------------------------------------------- | ---------------------------------------------------------------- |
| `scripts/m4-attendance-export-trend-acceptance.test.mts` | §9 EX/TR/RR/R + NF-UI 全链路验收                                      |
| `npm run test:m4-attendance-export-trend`                | package.json 注册                                                  |
| `.agent/SPRINT8_REVIEW_EVIDENCE.md`                      | Evidence Pack                                                    |
| UI contract 注释                                           | `attendance-monthly-trend.tsx` · `attendance-remaining-rank.tsx` |


**未改动**：M1 Repository · M2 Service/Mapper/Serializer · M3 UI 结构 · Schema

---

## 2. Acceptance 结果（specs/attendance-export-trend.md §9）

### 2.1 Export（EX1～EX6）


| #                                       | 结果  |
| --------------------------------------- | --- |
| EX1 Audit 6 列 + 行数一致                    | ✅   |
| EX2 空导出仅表头                              | ✅   |
| EX3 Statistics 3 Section                | ✅   |
| EX4 Summary vs Export 数值一致              | ✅   |
| EX5 Payload 含 fileName/mimeType/content | ✅   |
| EX6 UTF-8 BOM                           | ✅   |


### 2.2 Trend（TR1～TR4）


| #                      | 结果  |
| ---------------------- | --- |
| TR1 月序 + 计数（6月3 · 7月2） | ✅   |
| TR2 双边界补零（8月=0）        | ✅   |
| TR3 无日期稀疏不补零           | ✅   |
| TR4 studentId 筛选       | ✅   |


### 2.3 Remaining Rank（RR1～RR4）


| #                   | 结果  |
| ------------------- | --- |
| RR1 降序 + 名次         | ✅   |
| RR2 范围外学员排除         | ✅   |
| RR3 改 date 范围余额快照不变 | ✅   |
| RR4 无 VALID → `[]`  | ✅   |


### 2.4 架构回归（R4～R6）


| #                                              | 结果  |
| ---------------------------------------------- | --- |
| R4 Statistics 无 studentService                 | ✅   |
| R5 Export 无 UI/Repo 拼 CSV                      | ✅   |
| R6 Statistics Export → getAttendanceStatistics | ✅   |


### 2.5 NF-UI 固化


| #                              | 结果  |
| ------------------------------ | --- |
| NF-UI-1 Export Query 与页面同源     | ✅   |
| NF-UI-2 Trend UI 无 sort/reduce | ✅   |
| NF-UI-3 Rank UI 不 override 顺序  | ✅   |


---

## 3. 全链路回归矩阵

```
PostgreSQL (Prisma Dev)
  → M1 Repository ✅
  → M2 Service / Serializer ✅
  → M3 UI / Export ✅
  → M4 Acceptance ✅
```


| 命令                                | 结果  |
| --------------------------------- | --- |
| `test:m4-attendance-export-trend` | ✅   |
| `test:m4-attendance-audit`        | ✅   |
| `test:m2-attendance-export-trend` | ✅   |
| `test:m2-attendance-statistics`   | ✅   |
| `test:m1-attendance-statistics`   | ✅   |
| `test:m4-attendance`              | ✅   |
| `npm run build`                   | ✅   |


---

## 4. M3 Review 结论落实

Tech Lead M3 Review（APPROVED）Non-blocking Notes 已在 M4 固化：


| Note                      | M4 落实               |
| ------------------------- | ------------------- |
| NF-UI-1 Export 与 Query 同源 | 静态审计 + 验收脚本         |
| NF-UI-2 Trend chart 扩展约束  | UI contract comment |
| NF-UI-3 Rank 顺序冻结         | UI contract comment |


---

## 5. 硬约束遵守


| 约束                      | 状态  |
| ----------------------- | --- |
| 无新增 aggregation / UI 计算 | ✅   |
| 无 Export bypass         | ✅   |
| 无 Schema 变更             | ✅   |
| M1/M2/M3 冻结层未改          | ✅   |


---

## 6. 停止编码声明

- Sprint 8 M4 编码/验收脚本已完成
- **M4 后禁止新编码**，等待 Tech Lead Final Close-out Review
- 通过后 Sprint 8 CLOSED，方可规划 Sprint 9

---

## 7. 请求 Tech Lead 动作

1. Review `.agent/SPRINT8_REVIEW_EVIDENCE.md`
2. 确认 §9 Acceptance + 回归矩阵
3. 签发 Sprint 8 Final Close-out（CLOSED / CHANGES_REQUIRED）

---

**Sprint 8 M4 — APPROVED — Sprint 8 CLOSED（2026-07-02）**