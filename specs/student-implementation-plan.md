# Student Implementation Plan — Sprint 2

> **状态：待 Tech Lead Review**
>
> 基于 `specs/student.md`。Review 通过后方可编码。

---

## 1. 范围确认


| 做                                  | 不做                      |
| ---------------------------------- | ----------------------- |
| Student List                       | Edit / Delete           |
| Create Student（Dialog）             | Search / Pagination     |
| Read-only Detail Drawer            | Import / Export / Batch |
| Prisma `Student` model + migration | Login / Auth            |
| Server Actions                     | Lesson / 课时 / 签到        |


---

## 2. 实施顺序

```
① Prisma Student model + migration
        ↓
② shared/lib/db.ts — Prisma 单例
        ↓
③ features/students — schema / types / service
        ↓
④ features/students — server actions
        ↓
⑤ features/students — UI 组件
        ↓
⑥ app/students/page.tsx — 路由薄层
        ↓
⑦ 对照 specs/student.md §5 验收
        ↓
⑧ 更新 .agent/TASKS、STATE、CHANGELOG、ADR-005
```

---

## 3. 目录与文件规划

```
wenlan-crm/
├── prisma/
│   ├── schema.prisma              ← 追加 Student model + StudentStatus enum
│   └── migrations/
│       └── YYYYMMDD_init_student/ ← 首次业务迁移
│
├── specs/
│   ├── student.md                 ← 本 Sprint Spec（已完成）
│   └── student-implementation-plan.md
│
├── src/
│   ├── app/
│   │   ├── layout.tsx             ← 可选：全局字体/容器微调
│   │   └── students/
│   │       └── page.tsx           ← 薄路由，组合 StudentsPage
│   │
│   ├── features/
│   │   └── students/
│   │       ├── actions/
│   │       │   ├── create-student.ts
│   │       │   ├── list-students.ts
│   │       │   └── get-student.ts
│   │       ├── components/
│   │       │   ├── students-page.tsx      # 页面容器
│   │       │   ├── student-list.tsx       # 表格 + 空状态
│   │       │   ├── create-student-dialog.tsx
│   │       │   └── student-detail-drawer.tsx
│   │       ├── schemas/
│   │       │   └── student-form.schema.ts # Zod 校验
│   │       ├── services/
│   │       │   ├── student.repository.ts  # Prisma 读写
│   │       │   └── remaining-lessons.ts   # compute → 0
│   │       └── types/
│   │           └── student.types.ts       # 列表/详情 DTO
│   │
│   └── shared/
│       ├── components/ui/         ← 追加 shadcn 组件
│       │   ├── button.tsx         （已有）
│       │   ├── table.tsx
│       │   ├── dialog.tsx
│       │   ├── sheet.tsx
│       │   ├── input.tsx
│       │   ├── label.tsx
│       │   └── textarea.tsx
│       └── lib/
│           ├── utils.ts           （已有）
│           └── db.ts              ← Prisma client 单例
```

**共约 18 个新建/修改文件**（不含 shadcn 生成文件与 migration SQL）。

---

## 4. 模块职责

### 4.1 数据层


| 文件                      | 职责                                                             |
| ----------------------- | -------------------------------------------------------------- |
| `prisma/schema.prisma`  | `Student` model、`StudentStatus` enum、`@@unique([name, phone])` |
| `shared/lib/db.ts`      | 开发环境 Prisma 单例，防 HMR 多实例                                       |
| `student.repository.ts` | `findAllActive`、`findById`、`findByNamePhone`、`create`          |


**为什么 repository 独立于 actions：**

- actions 管 HTTP/表单边界；repository 管 SQL
- Sprint 3 签到模块复用 `findById` 时不耦合 Server Action

### 4.2 业务层


| 文件                       | 职责                                              |
| ------------------------ | ----------------------------------------------- |
| `student-form.schema.ts` | Zod：name、phone 必填；phone 格式                      |
| `remaining-lessons.ts`   | `computeRemainingLessons(id)` → `0`（ADR-004 占位） |
| `create-student.ts`      | 校验 → 查重 → 创建 → 返回                               |
| `list-students.ts`       | 查全量 + 附加 computed remainingLessons              |
| `get-student.ts`         | 按 id 查详情 + computed remainingLessons            |


### 4.3 表现层


| 组件                          | 职责                                       |
| --------------------------- | ---------------------------------------- |
| `students-page.tsx`         | 状态：dialog open、selected student id；组合子组件 |
| `student-list.tsx`          | Table 渲染；行点击回调；空状态                       |
| `create-student-dialog.tsx` | 受控表单；调用 `createStudent` action；错误展示      |
| `student-detail-drawer.tsx` | Sheet 只读展示；无编辑控件                         |


### 4.4 路由层


| 文件                      | 职责                                                            |
| ----------------------- | ------------------------------------------------------------- |
| `app/students/page.tsx` | `import { StudentsPage } from '@/features/students/...'` 一行组合 |


---

## 5. Prisma Schema（提议）

```prisma
enum StudentStatus {
  ACTIVE
  GRADUATED
}

model Student {
  id          String        @id @default(cuid())
  name        String
  contactName String?       @map("contact_name")
  phone       String
  note        String?
  status      StudentStatus @default(ACTIVE)
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")

  @@unique([name, phone])
  @@map("students")
}
```

**ADR 合规检查：**

- ✅ 无 `remainingLesson` 字段
- ✅ 需新增 ADR-005 记录 Student schema 决策

---

## 6. Server Actions 契约（提议）

### `listStudents`

- **输入**：无
- **输出**：`StudentListItem[]` — `{ id, name, contactName, phone, status, remainingLessons }`
- **规则**：`status = ACTIVE`，`createdAt desc`，无分页

### `createStudent`

- **输入**：`{ name, contactName?, phone, note? }`
- **输出**：`{ success: true, id }` 或 `{ success: false, error: string }`
- **规则**：Zod 校验 → `name+phone` 唯一 → 默认 `ACTIVE`

### `getStudent`

- **输入**：`{ id: string }`
- **输出**：`StudentDetail` 或 `null`
- **规则**：附加 `remainingLessons` 计算值

**不做：** `updateStudent`、`deleteStudent`

---

## 7. shadcn 组件安装计划

Review 通过后执行：

```bash
npx shadcn@latest add table dialog sheet input label textarea
```

---

## 8. 依赖追加（提议）


| 包                     | 用途                    |
| --------------------- | --------------------- |
| `zod`                 | 表单 / action 校验        |
| `@hookform/resolvers` | React Hook Form + Zod |
| `react-hook-form`     | Create Dialog 表单      |


> 若 Tech Lead 倾向原生 form + Server Actions 无 RHF，可省略 hookform 依赖（实施时二选一）。

---

## 9. 验收对照


| specs/student.md §5 场景 | 实施验证                   |
| ---------------------- | ---------------------- |
| 首次登记                   | 手动：创建后在列表可见            |
| 必填缺失                   | 表单 validation          |
| 同名同电话重复                | action 返回错误            |
| 同名不同电话                 | 两条记录                   |
| 备注留空                   | 创建成功                   |
| Detail 只读              | Drawer 无 input / 无保存按钮 |
| 剩余课时 0                 | 列表 + Drawer 均显示 0      |


---

## 10. 风险与规避


| 风险                                          | 规避                                     |
| ------------------------------------------- | -------------------------------------- |
| PostgreSQL 未配置                              | 开发前确认 `DATABASE_URL`；文档 `.env.example` |
| ADR-004 误加字段                                | Schema review checklist                |
| Scope 蔓延（Edit/Delete）                       | Spec §1.3 禁止项；PR 自检                    |
| 旧 `IMPLEMENTATION-SPRINT1-STUDENTS.md` 范围冲突 | 以本 Plan 为准（Sprint 2 缩小范围）              |


---

## 11. 开发完成后需更新


| 文件                                 | 内容                     |
| ---------------------------------- | ---------------------- |
| `.agent/adr/005-student-schema.md` | Student model 决策       |
| `.agent/DECISIONS.md`              | 索引追加 ADR-005           |
| `.agent/TASKS.md`                  | 「录入学生」→ Done（或部分 Done） |
| `.agent/STATE.json`                | Sprint 2 进度            |
| `.agent/CHANGELOG.md`              | Sprint 2 记录            |
| `.agent/SPRINT_REPORT.md`          | Sprint 2 结束时覆盖         |


---

## 12. 开放问题（需 Tech Lead Review）


| #   | 问题                              | 默认提议                         |
| --- | ------------------------------- | ---------------------------- |
| 1   | `contactName` 必填还是可选？           | 可选                           |
| 2   | 表单方案：React Hook Form 还是原生 Form？ | RHF + Zod                    |
| 3   | `/students` 设为首页跳转？             | 是，`/` redirect → `/students` |
| 4   | 列表是否过滤非 ACTIVE？                 | 是，仅 ACTIVE                   |
| 5   | `GRADUATED` 写入 Schema 但不用？      | 是，预留 enum                    |
| 6   | phone 唯一性是否独立于 name？            | 否，仅 `(name, phone)` 联合唯一     |


---

**Review 通过后执行 §2 实施顺序，开始编码。**