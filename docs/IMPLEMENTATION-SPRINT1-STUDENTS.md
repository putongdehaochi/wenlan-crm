# Implementation Plan — Sprint 1：学生管理

> **状态：待 Tech Lead Review**
>
> 本文档为 Sprint 1 实施计划，**不含代码**。Review 通过后方可开始开发。

---

## 1. 阅读摘要

### 1.1 业务边界（来自 `.agent/` + `docs/`）

| 来源 | 约束 |
|------|------|
| `PROJECT.md` | MVP 聚焦课时闭环；学生管理是签到前置，非 Dashboard / 权限 / 家长端 |
| `DOMAIN.md` | 学生职责：学员主体；字段：姓名、联系人、电话、备注（可选）、状态（在读）；新建时剩余课时为 0 |
| `FLOW.md` | 新增学生：建档 → 出现在名单 → 尚无课时包；不涉及签到 |
| `ACCEPTANCE.md` §1 | 必填：姓名 + 电话；防重复（同名同电话）；同名不同电话允许；备注可空；初始剩余课时 0 |
| `TASKS.md` | Phase1 第一项：「录入学生」— Sprint 1 对应此 Task |

### 1.2 Sprint 1 范围

**做：**

- 学生列表
- 新增学生
- 编辑学生
- 删除学生

**不做：**

- 录入课时、签到、扣课时
- 撤销签到、请假、补课
- 登录 / 多老师 / 权限
- Dashboard、报表、导出

### 1.3 验收对齐（`ACCEPTANCE.md` §1）

| 类别 | 必须覆盖 |
|------|----------|
| 正常 | 首次登记、登记后剩余 0、名单可见 |
| 异常 | 必填缺失、同名同电话重复 |
| 边界 | 空名单首条、备注留空、同名不同电话 |

编辑 / 删除的验收场景 `ACCEPTANCE.md` 未单独列出，本 Sprint 补充如下业务规则（待 Review）：

| 操作 | 业务规则（提议） |
|------|------------------|
| 编辑 | 可改姓名、联系人、电话、备注；不可通过编辑修改剩余课时；编辑后若姓名+电话与他人冲突则拒绝 |
| 删除 | 仅允许删除**无课时包且无签到记录**的学生；否则提示「该学员已有上课记录，不可删除」（MVP 保护数据完整性） |

---

## 2. 总体架构（提议）

```
┌─────────────────────────────────────────────────┐
│  frontend/          老师使用的 Web 界面            │
│  · 学生列表页                                    │
│  · 新增 / 编辑表单                               │
└──────────────────────┬──────────────────────────┘
                       │ HTTP
┌──────────────────────▼──────────────────────────┐
│  backend/           业务规则 + 数据访问           │
│  · 学生 CRUD                                      │
│  · 重复校验                                       │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│  database/          持久化（SQLite 文件）         │
│  · students 表（Sprint 1 仅此一张）               │
└─────────────────────────────────────────────────┘
```

**为什么前后端分离、三层目录：**

- `frontend/` / `backend/` 已在项目初始化时划定，Sprint 1 不打破该结构
- 后续 Sprint（课时、签到）会追加模块，分离可避免全部堆在一个目录
- `database/` 独立存放 Schema 与迁移，满足 `.agent/RULES.md` 第 4 条（改库必记 DECISIONS）

**为什么 Sprint 1 只建一张 `students` 表：**

- `DOMAIN.md` 明确：新建学生时尚无课时包、无签到记录
- 列表页「剩余课时」列 Sprint 1 固定显示 `0`，不引入 `lesson_packages` 表，避免与「remainingLesson 存还是算」开放问题冲突

---

## 3. 目录与文件规划

### 3.1 新增目录树

```
project/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── students/           # 学生模块页面
│   │   ├── components/
│   │   │   └── students/           # 学生模块 UI 组件
│   │   ├── services/
│   │   │   └── studentService.ts   # 调用后端的学生接口
│   │   ├── types/
│   │   │   └── student.ts          # 学生类型定义
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── students.ts          # 学生 HTTP 路由
│   │   ├── services/
│   │   │   └── studentService.ts    # 业务规则（重复校验、删除保护）
│   │   ├── repositories/
│   │   │   └── studentRepository.ts # 数据库读写
│   │   ├── models/
│   │   │   └── student.ts           # 领域模型 / DTO
│   │   ├── middleware/
│   │   │   └── errorHandler.ts      # 统一错误响应
│   │   ├── db/
│   │   │   └── connection.ts        # 数据库连接
│   │   └── index.ts                 # 入口
│   └── package.json
│
├── database/
│   ├── migrations/
│   │   └── 001_create_students.sql  # Sprint 1 唯一迁移
│   └── README.md                    # 如何初始化 / 迁移
│
└── docs/
    └── IMPLEMENTATION-SPRINT1-STUDENTS.md   # 本文档
```

### 3.2 文件职责一览

| 文件 | 模块 | 职责 |
|------|------|------|
| `database/migrations/001_create_students.sql` | 持久化 | 定义 `students` 表结构 |
| `backend/src/repositories/studentRepository.ts` | 数据层 | CRUD SQL，不含业务规则 |
| `backend/src/services/studentService.ts` | 业务层 | 重复校验、删除保护、默认值（status=在读） |
| `backend/src/routes/students.ts` | 接口层 | 映射 HTTP 请求到 service |
| `backend/src/models/student.ts` | 模型 | Student 字段定义与校验 shape |
| `frontend/src/pages/students/StudentListPage.tsx` | 页面 | 列表 + 空状态 + 操作入口 |
| `frontend/src/pages/students/StudentFormPage.tsx` | 页面 | 新增 / 编辑共用表单 |
| `frontend/src/components/students/StudentTable.tsx` | 组件 | 表格：姓名、电话、剩余课时(0)、操作 |
| `frontend/src/components/students/StudentForm.tsx` | 组件 | 表单：姓名*、联系人、电话*、备注 |
| `frontend/src/services/studentService.ts` | 前端服务 | fetch 封装，与 backend 通信 |

---

## 4. 模块拆分与理由

### 4.1 后端三层

```
routes  →  services  →  repositories  →  database
  │            │              │
 HTTP        业务规则        纯数据访问
```

| 层 | 为什么独立 |
|----|-----------|
| **routes** | 只负责请求解析与响应格式，Sprint 2 加「课时」时新增 routes 而不动 service |
| **services** | 重复登记（姓名+电话）、删除保护等规则集中于此，与 `ACCEPTANCE.md` 场景一一对应 |
| **repositories** | SQL 与业务解耦；未来换存储或加缓存只改这一层 |

### 4.2 前端按「页面 + 组件 + 服务」

| 模块 | 为什么独立 |
|------|-----------|
| **pages/students/** | 路由级页面，Sprint 1 仅学生相关路由 |
| **components/students/** | `StudentTable` / `StudentForm` 可复用；Sprint 3 签到页可能引用学生列表组件 |
| **services/studentService.ts** | 前端不直接拼 URL；后续换接口版本只改 service |
| **types/student.ts** | 前后端共享的 Student 形状（或通过约定保持一致） |

### 4.3 为什么不把 CRUD 写成一个文件

- Sprint 1 规模小，单文件可行，但 Sprint 2–4 会追加课时、签到模块
- 提前按**领域（students）**而非**技术（crud）**拆分，避免后续 `index.ts` 膨胀
- 符合 `DOMAIN.md` 中以 Student 为中心的对象模型

---

## 5. 数据模型（提议，待 Review）

### 5.1 `students` 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增主键 |
| name | TEXT NOT NULL | 学员姓名 |
| contact_name | TEXT | 联系人（家长姓名） |
| phone | TEXT NOT NULL | 联系电话 |
| note | TEXT | 备注，可空 |
| status | TEXT NOT NULL DEFAULT 'active' | MVP 仅「在读」；预留 `graduated` 供 Phase2 |
| created_at | TEXT | 创建时间 |
| updated_at | TEXT | 更新时间 |

**唯一约束（提议）：** `UNIQUE(name, phone)` — 对齐 `ACCEPTANCE.md`「同名同电话不可重复；同名不同电话允许」

**Sprint 1 不建字段：** `remaining_lessons` — 列表页硬编码显示 0，等 Tech Lead 对 DOMAIN 开放问题拍板后再引入

### 5.2 接口清单（提议）

| 方法 | 路径 | 用途 |
|------|------|------|
| GET | `/students` | 学生列表 |
| GET | `/students/:id` | 单个学生（编辑页预填） |
| POST | `/students` | 新增 |
| PUT | `/students/:id` | 编辑 |
| DELETE | `/students/:id` | 删除 |

---

## 6. 页面与交互（提议）

### 6.1 学生列表页

- 展示：姓名、联系人、电话、剩余课时（固定 `0`）、操作（编辑 / 删除）
- 空状态：「暂无学员，点击新增」
- 顶部按钮：「新增学生」

### 6.2 新增 / 编辑页

- 共用 `StudentForm` 组件
- 必填校验：姓名、电话
- 保存成功 → 返回列表
- 重复登记 → 展示后端返回的错误提示

### 6.3 删除

- 点击删除 → 二次确认
- 后端拒绝（有历史记录时）→ 展示原因

---

## 7. 技术选型（提议，待 Tech Lead 确认）

| 层级 | 提议 | 理由 |
|------|------|------|
| 前端 | React + Vite + TypeScript | 轻量、启动快，适合 MVP 单人开发 |
| 后端 | Node.js + Express + TypeScript | 与前端同语言，降低上下文切换 |
| 数据库 | SQLite | 书法工作室单机部署，零运维；DECISIONS 待 Review 后写入 |
| 样式 | 原生 CSS 或 Tailwind（二选一） | 待 Tech Lead 决定，Sprint 1 不追求视觉 |

> 若 Tech Lead 另有指定栈，目录与模块划分保持不变，仅替换实现层。

---

## 8. 开发顺序（Review 通过后）

```
1. database/migrations/001_create_students.sql
2. backend  db → repository → service → routes → 本地可测
3. frontend   types → service → form/table → pages → 联调
4. 逐条对照 ACCEPTANCE.md §1 自测
5. 更新 .agent/TASKS.md、STATE.json、CHANGELOG.md、DECISIONS.md
```

---

## 9. 开放问题（需 Tech Lead Review）

| # | 问题 | 影响 |
|---|------|------|
| 1 | 技术栈是否采纳 §7 提议？ | 依赖安装与配置文件 |
| 2 | `remaining_lessons` Sprint 1 列表固定显示 0 是否可接受？ | 列表页实现方式 |
| 3 | 删除规则：无课时包且无签到才可删 — 是否同意？Sprint 1 无 lesson/attendance 表，删除实际无约束 | 删除 API 逻辑 |
| 4 | 唯一约束用 `(name, phone)` 还是仅 `phone`？ | 迁移 SQL |
| 5 | `status` 字段 Sprint 1 是否只做「在读」，不做结业/停课 UI？ | 表单字段 |
| 6 | 编辑时是否重新校验 `(name, phone)` 唯一（排除自身）？ | service 逻辑 |
| 7 | 是否需要 `.agent/DECISIONS.md` 先写入 SQLite 决策再动 database/？ | 流程合规 |

---

## 10. 风险与规避

| 风险 | 规避 |
|------|------|
| 与 DOMAIN「remainingLesson 存还是算」冲突 | Sprint 1 不存不算，列表显示 0 |
| 提前建 lesson_packages 表导致 scope 膨胀 | Sprint 1 仅 students 一张表 |
| 删除有历史学生导致课时账本断裂 | 删除保护规则 + Sprint 2 再加关联检查 |
| 架构未 Review 就写代码 | **本 Sprint 暂停于本文档，等待 Review** |

---

**下一步：Tech Lead Review 本文档 → 确认开放问题 → 开始编码**
