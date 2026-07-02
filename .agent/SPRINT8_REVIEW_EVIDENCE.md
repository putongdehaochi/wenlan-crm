# Sprint 8 Review Evidence

> **日期**：2026-07-02  
> **用途**：M4 Final Review 证据包  
> **状态**：✅ APPROVED（2026-07-02 Tech Lead Final Close-out）→ **Sprint 8 CLOSED**  
> **Spec**：`specs/attendance-export-trend.md` §9

---

## Evidence 1 — Acceptance Matrix（§9 Export / Trend / Rank）

### 9.1 Export（EX）

| 锚点 | 场景 | 脚本输出 | 源码 |
| --- | --- | --- | --- |
| EX1 | 3 条 Audit → 6 列 CSV | `§9.1 EX1/EX5/EX6` | `m4-attendance-export-trend-acceptance.test.mts` |
| EX2 | 空 Audit 仅表头 | `§9.1 EX2` | 同上 |
| EX3 | Statistics 3 Section | `§9.1 EX3/EX4` | 同上 |
| EX4 | Summary vs Export 数值一致 | `§9.1 EX3/EX4` | 同上 |
| EX5 | `mimeType=text/csv;charset=utf-8` | `§9.1 EX1/EX5/EX6` | 同上 |
| EX6 | UTF-8 BOM · LF | `§9.1 EX1/EX5/EX6` | 同上 |

### 9.2 Trend（TR）

| 锚点 | 场景 | 脚本输出 | 源码 |
| --- | --- | --- | --- |
| TR1 | 6 月 3 · 7 月 2 · 升序 | `§9.2 TR1/TR2` | 同上 |
| TR2 | 6～8 月边界补零 | `§9.2 TR1/TR2` | 同上 |
| TR3 | 无日期稀疏（不补零） | `§9.2 TR3` | 同上 |
| TR4 | `studentId` 筛选 | `§9.2 TR4` | 同上 |

### 9.3 Remaining Rank（RR）

| 锚点 | 场景 | 脚本输出 | 源码 |
| --- | --- | --- | --- |
| RR1 | 剩余课时降序 + 名次 | `§9.3 RR1/RR2` | 同上 |
| RR2 | 范围外学员不出现 | `§9.3 RR1/RR2` | 同上 |
| RR3 | 改 date 范围余额不变 | `§9.3 RR3` | 同上 |
| RR4 | 无 VALID → `[]` | `§9.3 RR4` | 同上 |

### 9.4 Regression（R）

| 锚点 | 场景 | 脚本输出 | 源码 |
| --- | --- | --- | --- |
| R4 | Statistics 无 `studentService` | `§9.4 R4/R5/R6` | 同上 |
| R5 | Export 无 UI/Repo 拼 CSV | `§9.4 R4/R5/R6` | 同上 |
| R6 | Statistics Export 调 `getAttendanceStatistics` | `§9.4 R4/R5/R6` | 同上 |

### NF-UI（M3 固化项）

| 锚点 | 场景 | 脚本输出 | 源码 |
| --- | --- | --- | --- |
| NF-UI-1 | Export input 与页面 Query 同源 | `NF-UI-1` | 同上 + `attendance-audit-page.tsx` · `attendance-statistics-page.tsx` |
| NF-UI-2 | Trend UI 无 sort/reduce（chart 扩展约束） | 静态审计 | `attendance-monthly-trend.tsx` |
| NF-UI-3 | Rank UI 不得 override 顺序 | 静态审计 + contract comment | `attendance-remaining-rank.tsx` |

---

## Evidence 2 — Export CSV Samples（Serializer 契约）

### Audit CSV（§3.2 列序）

```csv
签到日期,学员姓名,状态,撤销时间,最近事件,最近事件时间
2099-06-01,__m4_att_export__甲,VALID,,
2099-06-05,__m4_att_export__甲,VALID,,
```

- 生成点：`attendance-export.serializer.ts` → `toAuditCsvPayload`
- 调用链：`exportAttendanceAuditAction` → `listAttendanceAudit` → Serializer

### Statistics CSV（§4.2～4.4 三 Section）

```csv
指标,数值
总签到次数,5
有效签到,5
...
月份,有效签到次数
2099-06,3
2099-07,2
2099-08,0
...
排名,学员姓名,剩余课时
1,__m4_att_export__甲,27
2,__m4_att_export__丙,24
3,__m4_att_export__乙,19
```

- 生成点：`attendance-export.serializer.ts` → `toStatisticsCsvPayload`
- 调用链：`exportAttendanceStatisticsAction` → `getAttendanceStatistics` → Serializer（RC6）

---

## Evidence 3 — End-to-End Data Flow

```text
M1 Repository
  groupValidAttendanceByMonth · groupAllValidAttendanceByStudent
        ↓
M2 Service + Mapper
  monthlyTrend 补零 · remainingLessonRank 排序
        ↓
M2 Serializer
  toAuditCsvPayload · toStatisticsCsvPayload
        ↓
M3 UI
  Statistics Summary / Trend / Rank 只读渲染
  Export Button → Action（同源 Query）
```

---

## Evidence 4 — UI Read Model Contract

| 组件 | 约束 | 审计 |
| --- | --- | --- |
| `attendance-statistics-summary.tsx` | 无 reduce / sort | ✅ |
| `attendance-monthly-trend.tsx` | 无 sort / reduce / 补零 | ✅ contract comment |
| `attendance-remaining-rank.tsx` | 无 sort / reduce | ✅ contract comment |
| `attendance-export-download-button.tsx` | 无 CSV 拼装 | ✅ |

---

## Evidence 5 — Full Regression Log（2026-07-02）

| 命令 | 结果 |
| --- | --- |
| `npm run test:m4-attendance-export-trend` | ✅ |
| `npm run test:m4-attendance-audit` | ✅ |
| `npm run test:m2-attendance-export-trend` | ✅ |
| `npm run test:m2-attendance-statistics` | ✅ |
| `npm run test:m1-attendance-statistics` | ✅ |
| `npm run test:m4-attendance` | ✅ |
| `npm run build` | ✅ |

**Sprint 8 M4 回归矩阵 — All Passed**

---

## Evidence 6 — Build Routes

```
ƒ /attendance/audit      （含 Export CSV）
ƒ /attendance/statistics （含 Export CSV · Trend · Rank）
ƒ /attendance/history
○ /attendance
○ /students
```

---

## Evidence 7 — M4 测试隔离说明

`m4-attendance-export-trend-acceptance.test.mts` 使用 `2099-xx` 日期前缀 + `__m4_att_export__` 学员前缀，避免与 M2/M4 Audit 等测试数据在 `2026-xx` 范围交叉污染。

---

**Tech Lead Final Review APPROVED — Sprint 8 CLOSED（2026-07-02）**

**Frozen Analytics Core (v1)** — Statistics pipeline 封板；Sprint 9+ 扩展须单独 ADR。
