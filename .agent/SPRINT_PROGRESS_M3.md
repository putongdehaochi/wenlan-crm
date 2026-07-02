# Sprint Progress Report — M3（UI）

> **里程碑**：M3 — UI  
> **日期**：2026-06-29  
> **状态**：✅ APPROVED  
> **Tech Lead Review**：2026-06-29（M4 Review 后正式确认）

---

## 1. 交付能力（Spec 对齐）

| Spec 能力 | UI 实现 | 状态 |
|-----------|---------|------|
| Student List | `StudentList` + 空状态 | ✅ |
| Create Student | `CreateStudentForm`（Dialog） | ✅ |
| View Student Detail | `StudentDetailView`（Sheet，只读） | ✅ |

**未实现（Spec 禁止）**：Edit · Delete · Search · Pagination

---

## 2. 新增 / 修改文件

| 文件 | 职责 |
|------|------|
| `components/student-list.tsx` | 列表 + 空状态 |
| `components/create-student-form.tsx` | 新增表单 |
| `components/student-detail-view.tsx` | 只读详情 |
| `components/students-page.tsx` | 状态编排 |
| `app/students/page.tsx` | 薄路由，SSR 初始列表 |
| `app/page.tsx` | redirect → `/students` |
| `app/layout.tsx` | 标题 + lang zh-CN |
| `shared/components/ui/*` | table · dialog · sheet · input · label · textarea |

---

## 3. 分层合规（Tech Lead M3 要求）

### 3.1 UI import 审计

| 组件 | 业务 import | 禁止项 |
|------|-------------|--------|
| `students-page.tsx` | `listStudentsAction`, `getStudentAction` | 无 Service / Repository / Validator / prisma |
| `create-student-form.tsx` | `createStudentAction` | 同上 |
| `student-list.tsx` | 仅 types + UI | 无 Action 以外业务层 |
| `student-detail-view.tsx` | 仅 types + UI | 纯展示 |

### 3.2 数据流

```
/students (RSC)
  └─ listStudentsAction() → initialSummaries
  └─ <StudentsPage />

StudentsPage (Client)
  ├─ listStudentsAction()        刷新列表
  ├─ createStudentAction()       经 CreateStudentForm
  └─ getStudentAction()          打开详情
```

**UI 仅调用 Action，不越层。**

---

## 4. 状态流（Plan §9）

| 操作 | 行为 |
|------|------|
| 进入 `/students` | SSR 加载 initialSummaries |
| 新增学生 | 关闭详情 → 打开表单 |
| 保存成功 | 关闭表单 → refreshList |
| 点击行 | 关闭表单 → 加载详情 Sheet |
| 校验/重复错误 | 表单内 fieldErrors / globalError |

---

## 5. 构建验证

```bash
npm run build
```

| 项 | 结果 |
|----|------|
| TypeScript | ✅ 通过 |
| 路由 | `/` redirect · `/students` 140 kB First Load |
| PostgreSQL | 未阻塞 M3；运行时需 DB 方可完整联调 |

---

## 6. 未做（M4）

- `specs/student.md` §5.4 Acceptance 七条抽检
- 端到端 DB 联调
- `.agent/TASKS.md` 录入学生 → Done（待 M4）

---

## 7. 下一步

Tech Lead Review M3 → 通过后 **M4（Acceptance + 联调）**

---

**已停止，等待 M3 Review。**
