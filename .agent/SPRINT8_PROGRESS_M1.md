# Sprint 8 Progress Report — M1（Repository）

> **里程碑**：M1 — Repository  
> **日期**：2026-07-02  
> **状态**：✅ 完成，待 Tech Lead Review  
> **前置**：Sprint 8 Design Rev 2 FINAL APPROVED（S8-DESIGN-001）

---

## 1. 交付内容

| 项 | 说明 |
|----|------|
| `groupValidAttendanceByMonth` | `attendance-statistics.repository.ts` 新增月度稀疏聚合 |
| `MonthlyAttendanceAggregateRow` | `monthly-attendance-aggregate-row.type.ts` |
| 自测扩展 | `scripts/m1-attendance-statistics-repository.test.mts` — Sprint 8 场景 |

**无 Schema 变更** · **无 Service / Action / UI 改动**

---

## 2. Repository Contract Summary

### 2.1 `groupValidAttendanceByMonth`（Sprint 8 新增）

```typescript
groupValidAttendanceByMonth(
  filter: FindStatisticsInput
): Promise<MonthlyAttendanceAggregateRow[]>

type MonthlyAttendanceAggregateRow = {
  month: string              // YYYY-MM
  validAttendanceCount: number
}
```

| 项 | 实现 |
|----|------|
| 统计对象 | `status = VALID` only |
| 分组 | `attendance_date` 自然月（`groupBy` 日 → 月 rollup） |
| 过滤 | 复用 `buildAttendanceStatisticsWhere` |
| 返回 | **稀疏**月份列表 |
| 补零 | **无**（Mapper 职责，M2） |
| 排序 | **无**强制（Mapper 职责，M2） |

### 2.2 Sprint 7 冻结方法集

`countTotalAttendance` · `countValidAttendance` · `countVoidedAttendance` · `countLifecycleEvents` · `groupValidAttendanceByStudent` — **签名与语义不变**

---

## 3. Responsibility Audit

### ✔ Repository 负责

- SQL `groupBy` + 按月 rollup
- `FindStatisticsInput` 过滤（含 `dateFrom`/`dateTo`/`studentId`）
- 返回 `{ month, validAttendanceCount }[]`

### ✘ Repository 未做（符合设计）

- `studentService` / `lessonBalanceRepository` / `studentRepository`
- ViewModel 装配 · 补零 · 排序
- `rank` · CSV · Export payload
- `remainingLessonRank` 数据

---

## 4. 验证

| 命令 | 结果 |
|------|------|
| `npm run test:m1-attendance-statistics` | ✅ |

### 新增测试覆盖

1. `groupValidAttendanceByMonth` 仅统计 VALID（void 后计数下降）
2. 多月稀疏聚合（2026-06 · 2026-07）
3. `dateFrom`/`dateTo` 闭区间
4. 无数据返回 `[]`
5. aggregate-only 静态审计（无 CSV / balance / studentName）
6. Sprint 7 既有用例仍通过

---

## 5. 不变项

| 模块 | 状态 |
|------|------|
| Sprint 7 Statistics 既有方法 | ✅ 未改签名 |
| Audit / History / Restore / Check-in Repository | ✅ 未触碰 |
| Service / Action / UI | ✅ 未实现 |
| Schema / Migration | ✅ 无变更 |

---

## 6. 未做（留 M2）

- `attendanceExportService` · `attendance-export.serializer`
- `exportAttendanceAuditAction` · `exportAttendanceStatisticsAction`
- `getAttendanceStatistics` 扩展（`monthlyTrend` · `remainingLessonRank` · `voidEventCount`）
- `groupAllValidAttendanceByStudent`（remaining rank 候选集）
- Mapper 补零 / 顺序名次
- Export 按钮 · Trend/Rank UI
- `npm run build` · M4 Acceptance

---

## 7. 状态

- Sprint 8 M1 → **完成，待 Tech Lead Review**
- **M1 编码已停止，等待 Tech Lead Review。**

---

**下一步（待批准后）**：Sprint 8 M2 — Service / Serializer / Actions
