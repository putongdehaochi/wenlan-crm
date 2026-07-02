# Sprint 7 Progress Report — M3（Audit UI / Statistics UI）

> **里程碑**：M3 — Audit UI / Statistics UI  
> **日期**：2026-07-01  
> **状态**：✅ 完成，待 Tech Lead Review  
> **前置**：Sprint 7 M2 APPROVED（S7-M2-REVIEW-001）

---

## 1. 交付内容

| 项 | 说明 |
|----|------|
| 路由 | `/attendance/audit` · `/attendance/statistics` |
| Audit UI | List · Timeline Sheet · 日期/状态/学员筛选 |
| Statistics UI | Summary Cards · 生命周期统计 · 学员排行表 |
| Query 工具 | `attendance-audit-query.ts` · `attendance-statistics-query.ts` |
| 导航 | `attendance-nav-links.tsx` — 四页互通 + 学生管理 |
| 学员详情 | 新增「查看签到审计」跳转 |

---

## 2. UI Data Flow

### 2.1 Audit List

```
/attendance/audit[?studentId=&dateFrom=&dateTo=&status=]
        ↓
Server: listAttendanceAuditAction
        ↓
AttendanceAuditPage
        ↓
AttendanceAuditFilter（URL 导航）
        ↓
AttendanceAuditList → 行点击
        ↓
getAttendanceAuditTimelineAction
        ↓
AttendanceAuditTimelinePanel（Sheet 只读）
```

### 2.2 Statistics

```
/attendance/statistics[?dateFrom=&dateTo=]
        ↓
Server: getAttendanceStatisticsAction
        ↓
AttendanceStatisticsPage
        ↓
AttendanceStatisticsFilter
        ↓
AttendanceStatisticsSummaryView（直接消费 ViewModel）
```

---

## 3. UI Import Audit

| 组件 | 允许 | 实际 |
|------|------|------|
| `attendance-audit-page.tsx` | Actions only | ✅ `list` · `getTimeline` |
| `attendance-statistics-page.tsx` | 无 Action（服务端注入） | ✅ |
| `attendance-audit-filter.tsx` | Router + query helper | ✅ |
| `attendance-audit-timeline-panel.tsx` | ViewModel only | ✅ 使用 `event.label`，无 `eventType` 分支 |
| `attendance-statistics-summary.tsx` | ViewModel only | ✅ 无统计计算 |

**禁止项（未出现）**：Repository · Prisma · `studentService` · 客户端 Timeline 排序 · UI 重算排名

---

## 4. MC 落实

| MC | 落实 |
|----|------|
| MC-1 | Timeline 直接渲染 `timeline.events`（Mapper 已排序 + label） |
| MC-2 | Statistics 直接展示 `AttendanceStatisticsSummary` 字段 |
| MC-3 | 列表使用 `lastEventType` / `lastEventAt`，不扫描 events |

---

## 5. 验证

| 命令 | 结果 |
|------|------|
| `npm run build` | ✅ |
| `/attendance/audit` | ✅ 路由出现在 build 输出 |
| `/attendance/statistics` | ✅ 路由出现在 build 输出 |

---

## 6. 不变项

| 模块 | 状态 |
|------|------|
| History void/restore UI | 零改动（仅导航扩展） |
| Today check-in | 零改动（仅导航扩展） |
| Service / Repository | 零改动（M3 范围外） |

---

## 7. 构建修复（附带）

- `attendance-lifecycle.repository.ts` — `metadata` Prisma `InputJsonValue` 类型断言（解除 build 阻塞）

---

## 8. 未做（M4）

- Acceptance 全量回归 · Evidence 包
- `test:m4-attendance-audit`

---

## 9. 下一步

提交本报告 → Tech Lead Review M3 → 通过后 **M4（Acceptance + Integration）**

---

**M3 编码已停止，等待 Tech Lead Review。**
