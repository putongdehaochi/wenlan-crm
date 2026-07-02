# Sprint 8 Progress Report — M2（Service / Serializer / Actions）

> **里程碑**：M2 — Service / Serializer / Actions  
> **日期**：2026-07-02  
> **状态**：✅ 完成，待 Tech Lead Review  
> **前置**：Sprint 8 M1 APPROVED（WITH CONDITIONS）

---

## 1. 交付内容

| 层 | 交付 |
|----|------|
| Service | `attendance-statistics.service.ts` 扩展 · `attendance-export.service.ts` |
| Serializer | `attendance-export.serializer.ts`（`toAuditCsvPayload` · `toStatisticsCsvPayload`） |
| Mapper | `attendance-statistics.mapper.ts` — `monthlyTrend` 补零 · `remainingLessonRank` 顺序名次 |
| Actions | `export-attendance-audit.action.ts` · `export-attendance-statistics.action.ts` |
| Validators | `export-attendance-audit.validator.ts` · `export-attendance-statistics.validator.ts` |
| Types | `AttendanceExportPayload` · `AttendanceMonthlyTrendPoint` · `voidEventCount` |
| Repository | `groupAllValidAttendanceByStudent`（remaining rank 候选集） |
| 自测 | `test:m2-attendance-export-trend` · 扩展 `test:m2-attendance-statistics` |

---

## 2. Service Flow（RC6 落实）

### `getAttendanceStatistics` — 唯一事实源

```text
Validator → Repository 并行聚合（含 groupValidAttendanceByMonth · groupAllValidAttendanceByStudent · voidEventCount）
  → studentRepository.findByIds
  → lessonBalanceRepository.getBalances
  → toAttendanceStatisticsSummary（monthlyTrend 补零 · remainingLessonRank）
```

### Export 冻结链

```text
exportAttendanceAudit → listAttendanceAudit → toAuditCsvPayload
exportAttendanceStatistics → getAttendanceStatistics → toStatisticsCsvPayload
```

---

## 3. Contract Freeze 落实

| 约束 | 状态 |
|------|------|
| RC-F1 唯一事实源 | ✅ Statistics Export 复用 `getAttendanceStatistics` |
| RC-F2 禁止分散统计 | ✅ Export Service 无 Repository 直连 |
| RC-F3 Mapper 补零 | ✅ `toMonthlyTrendPoints` 双边界闭区间补零 |
| RC-F4 Rank 在 Mapper | ✅ `toRemainingLessonRankRows` 排序 + 顺序名次 |
| RC-F5 Serializer 边界 | ✅ 静态审计通过 |

---

## 4. 验证

| 命令 | 结果 |
|------|------|
| `npm run test:m2-attendance-export-trend` | ✅ |
| `npm run test:m2-attendance-statistics` | ✅ |
| `npm run test:m1-attendance-statistics` | ✅ |
| `npm run test:m2-attendance-audit` | ✅ |

---

## 5. 不变项

- Sprint 7 Audit / History / Restore / Check-in 写链 — **未改动**
- M1 `groupValidAttendanceByMonth` 契约 — **未改签名**
- Sprint 7 Statistics 既有字段语义 — **不变**（增量 `voidEventCount` · 激活 Reserved）

---

## 6. 未做（M3）

- Export 下载 UI 组件
- `AttendanceMonthlyTrend` / `AttendanceRemainingRank` 展示
- Audit / Statistics 页导出按钮
- `npm run build`
- M4 Acceptance

---

## 7. 状态

**M2 编码已停止，等待 Tech Lead Review。**

---

**下一步（待批准后）**：Sprint 8 M3 — UI / Export Integration
