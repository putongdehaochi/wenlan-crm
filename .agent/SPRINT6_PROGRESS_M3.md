# Sprint 6 Progress Report — M3（History Filter UI + Restore Dialog）

> **里程碑**：M3 — History Filter UI + Restore Dialog  
> **日期**：2026-07-01  
> **状态**：✅ 完成，待 Tech Lead Review  
> **前置**：Sprint 6 M2 APPROVED

---

## 1. 交付内容

| 项 | 说明 |
|----|------|
| 筛选 | `attendance-history-filter.tsx` — `dateFrom` / `dateTo` URL Query 驱动 |
| Query 工具 | `attendance-history-query.ts` — href / Action input 构建 |
| 恢复对话框 | `restore-attendance-dialog.tsx` |
| 行 / 列表 | `canRestore` →「恢复」按钮 |
| 容器 | `attendance-history-page.tsx` — Restore 编排 + 筛选集成 |
| 路由 | `/attendance/history?studentId=&dateFrom=&dateTo=` |

---

## 2. UI Data Flow

### 2.1 History 加载

```
/attendance/history[?studentId=&dateFrom=&dateTo=]
        ↓
Server: listAttendanceHistoryAction({ studentId?, dateFrom?, dateTo? })
        ↓
AttendanceHistoryPage (initialRows)
        ↓
AttendanceHistoryFilter（URL 导航）
        ↓
AttendanceHistoryList → AttendanceHistoryRow[]
```

### 2.2 Restore 流程（全量刷新）

```
点击「恢复」(canRestore === true)
        ↓
RestoreAttendanceDialog 打开
        ↓
确认 → restoreAttendanceAction({ attendanceId })
        ↓
成功 → listAttendanceHistoryAction（当前 Query 参数）全量刷新
失败 → Dialog 内展示 result.message
```

Undo 流程与 Sprint 5 一致，未改动。

**禁止项**：乐观更新 · 手工修改行状态 · UI 计算 `canRestore` / `canVoid`

---

## 3. Query Contract

| 参数 | 来源 | 行为 |
|------|------|------|
| `studentId` | URL Query | 服务端 + 客户端 refresh 透传 |
| `dateFrom` | URL Query | 筛选表单 submit → `router.push` |
| `dateTo` | URL Query | 同上 |
| 清除日期 | Link | 保留 `studentId`，移除日期参数 |
| 查看全部记录 | Link | 保留日期，移除 `studentId` |

无 Hidden Filter State；筛选变更均触发路由导航或服务端重载。

---

## 4. UI Import Audit

| 组件 | 允许导入 | 实际 |
|------|----------|------|
| `attendance-history-page.tsx` | Actions only | ✅ `list` · `void` · `restore` |
| `attendance-history-filter.tsx` | Router + query helper | ✅ |
| `attendance-history-row.tsx` | types + UI | ✅ |
| `restore-attendance-dialog.tsx` | types + Dialog | ✅ |

**禁止项（均未出现）**

- `attendanceService` / `attendanceRepository`
- `lessonBalanceRepository` / `prisma`

---

## 5. Dialog State

| 准则 | Restore Dialog | Void Dialog |
|------|----------------|-------------|
| 独立状态 | ✅ `restoreTarget` / `restoring` / `restoreError` | ✅ 不变 |
| 提交中禁止关闭 | ✅ `restoring` 时 `onOpenChange` 拦截 | ✅ |
| 成功关闭 + 全量刷新 | ✅ | ✅ |
| 失败展示 `message` | ✅ | ✅ |
| 不修改 Row 本地状态 | ✅ | ✅ |

---

## 6. ViewModel 使用

| 字段 | UI 用途 |
|------|---------|
| `canVoid` | 撤销按钮（读取 ViewModel） |
| `canRestore` | 恢复按钮（读取 ViewModel） |
| `studentName` / `attendanceDate` / `status` | 表格列 + Dialog 文案 |

UI 未计算余额或业务规则。

---

## 7. 验证

| 命令 | 结果 |
|------|------|
| `npm run build` | ✅（含 `/attendance/history` 动态路由） |
| `npm run test:m2-attendance-restore` | ✅ |
| `npm run test:m2-attendance-history` | ✅ |
| `npm run test:m2-attendance` | ✅ |

### 附加修复

- `toAttendanceDate` 扩展接受 `string`（URL 日期 Query 类型兼容）
- 删除遗留 `scripts/_debug-rs5.mts`（阻塞 build 类型检查）

---

## 8. 不变项

| 模块 | 状态 |
|------|------|
| Service / Repository / Actions | 零 M3 diff（仅 UI 层） |
| Sprint 5 Undo UI | 行为不变 |
| Sprint 4 Today Check-in | 零改动 |

---

## 9. 未做（M4）

- `test:m4-attendance-restore` Acceptance
- Restore Regression Checklist Evidence
- 全量 M4 回归

---

## 10. 下一步

提交本报告 → Tech Lead Review M3 → 通过后 **M4（Acceptance + Integration）**

---

**M3 编码已停止，等待 Tech Lead Review。**
