# Sprint Progress Report — M1（数据层）

> **里程碑**：M1 — 数据层  
> **日期**：2026-06-29  
> **状态**：待 Tech Lead Review

---

## 1. 目标

| 项 | 内容 |
|----|------|
| 里程碑 | M1 — 数据层 |
| 范围 | Schema · Migration · db.ts · Entity 类型 · Repository · 自测 |
| 依据 | `specs/student.md` · `student.plan.md` Rev 2 |

---

## 2. Implementation Order 完成情况

| Step | 内容 | 状态 |
|------|------|------|
| 1 | 确认 PostgreSQL + DATABASE_URL | ⚠️ 本机无可用 PG（Docker 未运行） |
| 2 | ADR-006 + prisma schema + migration | ✅ |
| 3 | `shared/lib/db.ts` | ✅ |
| 4 | `types/student-entity.type.ts` | ✅ |
| 5–7 | （M2 范围，未开始） | — |
| 8 | （Mapper，M2） | — |
| 9 | `repositories/student.repository.ts` | ✅ |
| — | `scripts/m1-student-repository.test.mts` + `npm run test:m1` | ✅ 脚本就绪 |

---

## 3. 交付物清单

### 3.1 新增文件

| 文件 | 用途 |
|------|------|
| `.agent/adr/006-student-schema.md` | Student Schema 决策 |
| `prisma/migrations/20260629120000_init_student/migration.sql` | 首次 Student 迁移 SQL |
| `prisma/migrations/migration_lock.toml` | 迁移锁 |
| `src/shared/lib/db.ts` | Prisma 单例 + pg adapter |
| `src/features/students/types/student-entity.type.ts` | StudentEntity / CreateStudentEntityInput |
| `src/features/students/repositories/student.repository.ts` | 四方法 Repository |
| `scripts/m1-student-repository.test.mts` | M1 数据层自测 |

### 3.2 修改文件

| 文件 | 变更 |
|------|------|
| `prisma/schema.prisma` | Student model + StudentStatus enum |
| `.agent/DECISIONS.md` | 索引 ADR-006 |
| `package.json` | pg、adapter、tsx；`test:m1` 脚本 |
| `.env.example` | 本地 Docker PG 示例连接串 |

---

## 4. Schema 摘要（ADR-006）

| 项 | 值 |
|----|-----|
| 表名 | `students` |
| 枚举 | ACTIVE · ARCHIVED |
| 唯一约束 | `(name, contact_name)` |
| phone | 可选，无唯一约束 |
| lessonBalance | **未建**（ADR-004 合规） |

---

## 5. Repository 方法

| 方法 | 返回 | 验证 |
|------|------|------|
| `findAllActive` | `StudentEntity[]` | 代码完成；待 PG 运行自测 |
| `findById` | `StudentEntity \| null` | 同上 |
| `existsByNameAndContact` | `boolean` | 同上 |
| `create` | `StudentEntity` | 同上 |

**Entity 边界**：Repository 仅 import `StudentEntity`；无 ViewModel、无 `lessonBalance`。

---

## 6. 自测结果

```bash
npm run test:m1
```

| 结果 | 说明 |
|------|------|
| ❌ 未通过 | `ECONNREFUSED` — localhost:5432 无 PostgreSQL |

**自测脚本覆盖（PG 可用时将执行）**

- create → ACTIVE 默认 + Entity 形状
- existsByNameAndContact true/false
- findById
- findAllActive 仅 ACTIVE
- `(name, contactName)` 唯一约束

**Tech Lead 本地验证步骤**

```bash
# 1. 启动 PostgreSQL（示例）
docker run --name wenlan-postgres \
  -e POSTGRES_USER=wenlan -e POSTGRES_PASSWORD=wenlan \
  -e POSTGRES_DB=wenlan_crm -p 5432:5432 -d postgres:16-alpine

# 2. 配置 .env DATABASE_URL（见 .env.example）

# 3. 应用迁移
npm run db:migrate

# 4. 运行 M1 自测
npm run test:m1
```

---

## 7. 风险与阻塞

| # | 项 | 状态 |
|---|-----|------|
| 1 | PostgreSQL 未运行 | 🔴 阻塞 migrate apply + 自测 |
| 2 | Docker Desktop 未启动 | 本环境无法自动拉起 PG |
| 3 | Prisma 7 需 driver adapter | ✅ 已装 pg + @prisma/adapter-pg |

---

## 8. 未做（符合范围）

- Service / Validator / Mapper / Action / UI（M2+）
- Spec 外功能
- ADR 修改（仅新增 ADR-006）

---

## 9. 下一步（M2 — 待 M1 Review 通过后）

```
errors → validators → mapper → service → actions → 本地验证
```

---

**M1 代码已提交就绪；迁移 apply 与自测 green 依赖 PostgreSQL。请 Tech Lead Review 后批准进入 M2。**
