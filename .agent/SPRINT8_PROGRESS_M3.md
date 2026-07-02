# Sprint 8 Progress Report — M3（UI / Export Integration）

> **里程碑**：M3 — UI / Export Integration  
> **日期**：2026-07-02  
> **状态**：✅ APPROVED（2026-07-02 Tech Lead Review）  
> **前置**：Sprint 8 M2 APPROVED（WITH STRICT NOTES）

---

## 1. 交付内容

| 项 | 说明 |
|----|------|
| `attendance-export-download-button.tsx` | Action → `AttendanceExportPayload` → Blob 下载 |
| `attendance-export-download.ts` | 浏览器下载辅助（无 CSV 拼装） |
| `attendance-monthly-trend.tsx` | `monthlyTrend` 只读表格 |
| `attendance-remaining-rank.tsx` | `remainingLessonRank` 只读表格 |
| `attendance-audit-page.tsx` | 导出 CSV 按钮（复用当前 URL 筛选） |
| `attendance-statistics-page.tsx` | 导出 CSV 按钮 |
| `attendance-statistics-summary.tsx` | 扩展 `voidEventCount` · Trend · Rank 展示 |

---

## 2. UI 数据流（M3 冻结）

```text
Audit / Statistics Page
  → Export Action（与页面同源 Query Input）
  → AttendanceExportPayload
  → downloadAttendanceExportPayload（Blob）

Statistics Summary
  → 直接渲染 getAttendanceStatistics ViewModel
  → 无客户端 sort / reduce / 聚合
```

---

## 3. M3 约束落实

| 约束 | 状态 |
|------|------|
| UI 不拼 CSV | ✅ Serializer 边界不变 |
| UI 不聚合 / 排序 | ✅ 静态审计扩展 |
| Export 复用同源筛选 | ✅ `buildListAttendanceAuditInput` / `buildGetAttendanceStatisticsInput` |
| Trend / Rank 只读 | ✅ 纯 map 渲染 |

### NF 项（M3 并行确认）

| 项 | 状态 |
|----|------|
| NF-1 Export 无双入口 Repository | ✅ `attendance-export.service` 仅调 Service |
| NF-2 Rank 候选 `groupAllValidAttendanceByStudent` + `getBalances` | ✅ 未变 M2 链 |
| NF-3 补零纯 Mapper | ✅ UI 无 date normalization |

---

## 4. 验证

| 命令 | 结果 |
|------|------|
| `npm run build` | ✅（含 `/attendance/audit` · `/attendance/statistics`） |
| `npm run test:m2-attendance-export-trend` | ✅（Prisma Dev 可用时） |
| M4 UI 静态审计 | ✅ 已扩展 Sprint 8 Export / Trend / Rank 检查 |

---

## 5. 不变项

- M1 Repository 契约 — **未改**
- M2 Service / Serializer / Actions — **未改**
- Sprint 7 写链 — **未触碰**

---

## 6. 未做（M4）

- `m4-attendance-export-trend-acceptance.test.mts` 全量验收脚本
- Evidence 包 · Close-out 文档
- 全量回归日志归档

---

## 7. 状态

**M3 编码已停止，等待 Tech Lead Review。**

---

**下一步（待批准后）**：Sprint 8 M4 — Acceptance + Evidence
