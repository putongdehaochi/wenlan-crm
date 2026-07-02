# Sprint 5 Progress Report — M3（Attendance History UI）

> **里程碑**：M3 — Attendance History UI  
> **日期**：2026-07-01  
> **状态**：✅ 完成，待 Tech Lead Review  
> **前置**：Sprint 5 M2 APPROVED

---

## 1. 交付内容

| 项 | 说明 |
|----|------|
| 路由 | `src/app/attendance/history/page.tsx` — 支持 `?studentId=` 筛选 |
| 容器 | `attendance-history-page.tsx` — 状态编排、Action 调用 |
| 列表 | `attendance-history-list.tsx` — 表格 + 空状态 |
| 行 | `attendance-history-row.tsx` — 状态展示 + 撤销按钮 |
| 对话框 | `void-attendance-dialog.tsx` — 撤销确认 |
| 导航 | `/attendance` ↔ `/attendance/history` ↔ `/students` |
| 学员入口 | 学生详情「查看签到历史」→ `/attendance/history?studentId=` |

---

## 2. UI Import Audit

| 组件 | 允许导入 | 实际 |
|------|----------|------|
| `attendance-history-page.tsx` | `listAttendanceHistoryAction` · `voidAttendanceAction` | ✅ |
| `attendance-history-list.tsx` | types + 子组件 | ✅ |
| `attendance-history-row.tsx` | types + UI primitives | ✅ |
| `void-attendance-dialog.tsx` | types + Dialog | ✅ |

**禁止项（均未出现）**

- `attendanceService` / `attendanceRepository`
- `lessonBalanceRepository` / `studentRepository`
- `prisma`

路由薄层 `app/attendance/history/page.tsx` 使用 `listAttendanceHistoryAction` + `getStudentAction`（仅解析筛选学员姓名），与 Sprint 4 `/attendance` 路由模式一致。

---

## 3. UI State Flow Diagram

### 3.1 History 加载

```
/attendance/history[?studentId=]
        ↓
Server: listAttendanceHistoryAction({ studentId? })
        ↓
AttendanceHistoryPage (initialRows)
        ↓
AttendanceHistoryList → AttendanceHistoryRow[]
```

### 3.2 Undo 流程（全量刷新）

```
点击「撤销」(canVoid === true)
        ↓
VoidAttendanceDialog 打开
        ↓
确认 → voidAttendanceAction({ attendanceId })
        ↓
成功 → listAttendanceHistoryAction({ studentId? }) 全量刷新
失败 → Dialog 内展示 result.message
```

**禁止**：乐观更新 · 手工修改行状态 · UI 自行恢复余额

---

## 4. UI Layer Boundary Audit

| 准则 | 结果 |
|------|------|
| UI 仅调用 Action | ✅ |
| UI 不计算 `canVoid` | ✅ 读取 `row.canVoid` |
| UI 不计算 `lessonBalance` | ✅ History Row 无余额字段 |
| UI 不修改 History Row | ✅ 仅 setState 来自 Action 响应 |
| Dialog / List 状态隔离 | ✅ `voiding` 时禁止关闭 Dialog |
| Feature First | ✅ 组件均在 `features/attendance/components/` |

### ViewModel 使用

| 字段 | UI 用途 |
|------|---------|
| `studentName` | 表格列 |
| `attendanceDate` | 表格列 |
| `status` | 展示「有效 / 已撤销」 |
| `canVoid` | 控制撤销按钮 |
| `quantityConsumed` / `voidedAt` | 未展示（预留） |

---

## 5. 错误处理

沿用 `ActionResult.message`：

| 场景 | 展示位置 |
|------|----------|
| 列表加载失败 | 页面顶部 |
| `ATTENDANCE_NOT_FOUND` | Dialog |
| `ALREADY_VOIDED` | Dialog |
| 其他撤销失败 | Dialog `result.message` |

无 UI 专用错误协议。

---

## 6. 页面行为

| 场景 | UI 表现 |
|------|---------|
| 无记录 | 「暂无签到记录」 |
| `canVoid === true` | 「撤销」按钮 |
| `canVoid === false` | 「—」 |
| `?studentId=` 筛选 | 筛选提示 +「查看全部记录」 |
| 撤销成功 | 关闭 Dialog → 全量刷新列表 |

---

## 7. 验证

| 命令 | 结果 |
|------|------|
| `npm run build` | ✅ `/attendance/history` 动态路由 |
| `npm run test:m2-attendance-history` | ✅ |
| `npm run test:m2-attendance` | ✅ |

---

## 8. 未做（M4）

- Spec §7 全量 Acceptance 测试
- `test:m4-attendance-history`
- Sprint 5 Evidence 文档

---

## 9. 下一步

提交本报告 → Tech Lead Review M3 → 通过后 **M4（Acceptance + Evidence）**

---

**M3 编码已停止，等待 Tech Lead Review。**
