# Sprint 4 Progress Report — M3（Attendance UI）

> **里程碑**：M3 — Attendance UI  
> **日期**：2026-06-30  
> **状态**：✅ APPROVED（2026-06-30 Tech Lead Review）  
> **前置**：M2 APPROVED

---

## 1. 交付内容

| 项 | 说明 |
|----|------|
| 路由 | `src/app/attendance/page.tsx` — 服务端初始加载 |
| 容器 | `attendance-page.tsx` — 状态编排、Action 调用 |
| 列表 | `attendance-today-list.tsx` — 表格 + 空状态 |
| 行 | `attendance-today-row.tsx` — 状态展示 + 签到按钮 |
| 导航 | `/students` ↔ `/attendance` 页面互链 |

---

## 2. 架构合规

### UI 仅调用 Action

| 允许 | 禁止 |
|------|------|
| `listTodayAttendanceAction()` | Attendance Service |
| `checkInStudentAction()` | Attendance Repository |
| | Lesson Balance Repository |
| | Student Repository |

### UI 不计算业务状态

直接读取 `AttendanceTodayRow` 字段：

- `lessonBalance` — 展示
- `todayStatus` — 展示「未签到 / 已签到」
- `canCheckIn` — 控制签到按钮可用性

未在 UI 中判断余额不足、重复签到等业务规则。

---

## 3. 签到刷新流程

```
点击「签到」
    ↓
checkInStudentAction({ studentId })
    ↓
成功 → listTodayAttendanceAction() 全量刷新
失败 → 行内展示 result.message
```

不做局部手工修改行状态。

---

## 4. 错误处理

沿用 `ActionResult`，行内展示 `result.message`：

| errorType | 默认消息 |
|-----------|----------|
| `ALREADY_CHECKED_IN` | 今日已签到 |
| `INSUFFICIENT_BALANCE` | 课时不足，请续费 |
| `STUDENT_ARCHIVED` | 该学员已归档，无法签到 |
| `STUDENT_NOT_FOUND` | 找不到该学员 |

无 UI 专用错误协议。

---

## 5. 页面行为

| 场景 | UI 表现 |
|------|---------|
| 空名单 | 「暂无在读学员」 |
| 可签到 | 「签到」按钮（`canCheckIn === true`） |
| 已签到 | 「已签到」文本，无按钮 |
| 课时不足 | 「课时不足」文本，无按钮 |
| 签到中 | 按钮 disabled + 「签到中…」 |

未加入：历史签到、撤销、搜索、分页、班级/教师过滤。

---

## 6. 验证

| 命令 | 结果 |
|------|------|
| `npm run build` | ✅ `/attendance` 路由生成 |
| `npm run test:m2-attendance` | ✅ 回归 |
| `npm run test:m1-attendance` | ✅ 回归 |

---

## 7. 未做（M4）

- `test:m4-attendance` 验收脚本
- §5.3 八条 Given/When/Then 全链路验收
- Sprint 4 结项报告

---

## 8. 下一步

Tech Lead Review M3 → 通过后 **M4（Acceptance + Integration）**

---

**M3 已批准，M4 验收已完成。**
