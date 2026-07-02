# Sprint 7 Design Review — Rev 2

> **Work Order**：S7-DESIGN-001  
> **日期**：2026-07-01  
> **状态**：🟡 已重提交，待 Tech Lead FINAL APPROVAL  
> **编码**：**禁止** — Rev 2 FINAL APPROVAL 前不得进入 M1

---

## Rev 1 → Rev 2 变更摘要

Tech Lead Rev 1 结论：**CHANGES REQUIRED**。Rev 2 响应 **RC1～RC5** 全部 Required Changes，并纳入 Non-blocking 建议（生命周期图 · Statistics 分层图 · Timeline Mermaid）。

---

## RC1～RC5 落实位置

| RC | 要求 | 落实文档 | 章节 |
|----|------|----------|------|
| **RC1** | `appendLifecycleEvent` 签名冻结 + `metadata` Reserved JSON | Plan | §3.4 |
| | | ADR-013 | §决策 5 |
| **RC2** | `AttendanceStatisticsRepository` aggregate-only | Plan | §3.6 · §8 |
| | | ADR-013 | §决策 4 · §决策 9 |
| **RC3** | Timeline Reserved：`operatorName?` · `reason?` · `source?` | Spec | §4.2 · §4.3 |
| | | ADR-013 | §决策 8 |
| **RC4** | `AttendanceStatisticsSummary` 完整 Evolution | Spec | §3.3 · §4.4 · §4.5 |
| | | ADR-013 | §决策 8 |
| **RC5** | Transaction：Attendance 先 UPDATE → 后 Lifecycle INSERT | Plan | §7.1 |
| | | ADR-013 | §决策 7 |

---

## Design Summary

Sprint 7 交付 **Audit Timeline**（只读）+ **Statistics**（只读聚合）。

| 能力 | 路由 | 核心 |
|------|------|------|
| Audit | `/attendance/audit` | Lifecycle Event + Mapper → Timeline ViewModel |
| Statistics | `/attendance/statistics` | **AttendanceStatisticsRepository** → Mapper → Summary |

Schema：`voidedAt` + `attendance_lifecycle_events`（含 `operator_id` · `metadata` JSON 列）。Sprint 2～6 对外 API **零变更**。

---

## Repository Contract（Rev 2）

| Repository | 职责 |
|------------|------|
| `attendanceRepository` | Audit 读 · create/void/restore 状态写（§7.1 事务序） |
| `attendanceLifecycleRepository` | `appendLifecycleEvent`（RC1 冻结）· Event 查询 |
| `attendanceStatisticsRepository` | **aggregate only**（RC2 冻结） |

详见：`specs/attendance-audit.plan.md` §3

---

## Service Flow

| 链 | 要点 |
|----|------|
| `listAttendanceAudit` | Validator → findAuditList → Events batch → Mapper |
| `getAttendanceAuditTimeline` | findById → Events → Timeline Mapper（Reserved null） |
| `getAttendanceStatistics` | **statisticsRepository** 聚合 → findByIds → getBalances → Mapper |

**禁止**：Statistics → `studentService`

---

## Statistics Architecture

```text
attendanceStatisticsService
        ↓
attendanceStatisticsRepository   ← RC2 冻结
        ↓
studentRepository.findByIds + lessonBalanceRepository.getBalances
        ↓
attendance-statistics.mapper
        ↓
AttendanceStatisticsSummary      ← RC4 冻结字段名
```

---

## Audit Timeline Design

**选型**：Audit Timeline ✅ · Operation Log ❌

**生命周期（RC5 + Non-blocking）**

```text
VALID → VOIDED → VALID → VOIDED
CHECK_IN → VOID → RESTORE → VOID
```

Mapper 装配升序 `events`；Reserved 字段 Sprint 7 恒 null。

---

## Transaction Sequence Freeze（RC5）

```text
Service → BEGIN → ① Attendance UPDATE/INSERT → ② appendLifecycleEvent → COMMIT
```

**禁止**先 Event 后 Attendance。

---

## Evolution（Sprint 8 不破坏 Sprint 7 API）

| Sprint 8 | Sprint 7 预留 |
|----------|---------------|
| Export CSV/Excel | `appendLifecycleEvent` + Query Input |
| Teacher/Class Rank | `teacherRank` · `classRank` |
| Monthly Trend · Heatmap | Summary Reserved 字段 |
| void/restore reason | `metadata` JSON · Timeline `reason?` |

---

## Risks

| 风险 | 缓解 |
|------|------|
| Event/Attendance 顺序错误 | RC5 冻结 + M1 事务测试 |
| Statistics 职责膨胀 | RC2 独立 Repository |
| Sprint 8 改接口 | RC1/RC3/RC4 一次定型 |

---

## Deliverables Checklist

| # | 交付物 | Rev 2 |
|---|--------|-------|
| ① | `specs/attendance-audit.md` | ✅ Rev 2 |
| ② | `specs/attendance-audit.plan.md` | ✅ Rev 2 |
| ③ | `.agent/adr/013-attendance-audit.md` | ✅ Rev 2 |
| ④ | `.agent/STATE.json` | ✅ 已同步 |
| ⑤ | `.agent/CHANGELOG.md` | ✅ 已同步 |
| ⑥ | `.agent/DECISIONS.md` | ✅ 已同步 |
| — | 无业务代码 / Schema / Migration | ✅ |

---

**等待 Tech Lead Design Review FINAL APPROVAL 后方可进入 M1 Repository 开发。**
