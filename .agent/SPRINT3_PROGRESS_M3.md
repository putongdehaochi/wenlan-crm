# Sprint 3 Progress Report — M3（UI）

> **里程碑**：M3 — UI  
> **日期**：2026-06-29  
> **状态**：✅ APPROVED  
> **Tech Lead Review**：2026-06-29  
> **前置**：M2 APPROVED

---

## 1. 交付能力（Spec 对齐）

| Spec 能力 | UI 实现 | 状态 |
|-----------|---------|------|
| Create Lesson Purchase | `CreateLessonPurchaseForm`（Dialog） | ✅ |
| Lesson Balance（列表） | `StudentList` 展示 `lessonBalance` | ✅ |
| Lesson Balance（详情） | `StudentDetailView` 展示 `lessonBalance` | ✅ |
| 购课入口 | 详情 Sheet「录入课时」按钮 | ✅ |

**未实现（Spec 禁止）**：签到 · 购课历史列表 · Edit/Delete 购课

---

## 2. 新增 / 修改文件

| 文件 | 职责 |
|------|------|
| `lessons/components/create-lesson-purchase-form.tsx` | 购课表单；仅调 `createLessonPurchaseAction` |
| `students/components/student-detail-view.tsx` | 增加「录入课时」入口 |
| `students/components/students-page.tsx` | 编排购课 Dialog + 刷新列表/详情 |

---

## 3. 分层合规

| 组件 | 业务 import | 禁止项 |
|------|-------------|--------|
| `create-lesson-purchase-form.tsx` | `createLessonPurchaseAction` | 无 Service / Repository |
| `student-detail-view.tsx` | 仅 types + UI | 无 Action 以外业务层 |
| `students-page.tsx` | student Actions + 购课表单（内调 lesson Action） | 无 Service / Repository |
| `student-list.tsx` | 仅 types + UI | 纯展示 |

---

## 4. 状态流

| 操作 | 行为 |
|------|------|
| 点击列表行 | 关闭 Create / Purchase Dialog → 打开详情 |
| 详情点击「录入课时」 | 关闭 Create → 打开购课 Dialog |
| 购课成功 | 关闭 Dialog → `listStudentsAction` + `getStudentAction` 刷新 |
| 新增学生 | 关闭详情 / 购课 → 打开 Create Dialog |
| 校验/业务错误 | 表单内 fieldErrors / globalError |

Dialog / Sheet 互斥：Create · Purchase · Detail 不同时产生冲突状态。

---

## 5. 余额展示

- 列表与详情均展示 ViewModel `lessonBalance`（来自 Action 返回）
- UI **不**计算余额；购课成功后通过 Action 刷新获取最新值

---

## 6. 构建验证

```bash
npm run build
```

---

## 7. 未做（M4）

- `specs/lesson.md` §5.3 Acceptance 八条抽检
- 端到端 DB 联调验收脚本
- `.agent/TASKS` 更新

---

## 8. 下一步

Tech Lead Review M3 → 通过后 **M4（Acceptance + Integration）**

---

**已停止，等待 M3 Review。**
