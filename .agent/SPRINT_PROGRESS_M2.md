# Sprint Progress Report — M2（业务层）Rev 2

> **里程碑**：M2 — Validator · Mapper · Service · Actions  
> **日期**：2026-06-29  
> **状态**：Resubmitted — 待 Tech Lead Review  
> **Rev 1 结论**：REQUEST_CHANGES → 本报告补充可验证调用证据

---

## 1. 摘要

| 项 | 内容 |
|----|------|
| 架构 | 符合 Plan Rev 2 |
| 业务代码 | 无需返工 |
| 本报告 | 补充 Required Change 1–4 的事实依据 |
| PostgreSQL | **非 M2 阻塞项**；DB 集成测试延后统一验证 |

---

## 2. Required Change 1 — 可验证调用链

### 2.1 Action 层 import 审计

对 `src/features/students/actions/*.ts` 执行 import 扫描：

| 文件 | 运行时 import | 是否含 Validator / Repository / prisma / db |
|------|---------------|---------------------------------------------|
| `list-students.action.ts` | `studentService` | **否** |
| `create-student.action.ts` | `studentService` | **否** |
| `get-student.action.ts` | `studentService` | **否** |

其余 import 均为 `type` 仅类型（编译后擦除，无运行时依赖）。

### 2.2 Action 实际调用链（源码级）

#### `listStudentsAction`

**文件**：`src/features/students/actions/list-students.action.ts`

```
L16: return studentService.listActiveStudents()
```

| 检查项 | 证据 |
|--------|------|
| 仅调用 Service | 函数体唯一语句为 `studentService.listActiveStudents()` |
| 未调用 Validator | 无 `validate*` import / 调用 |
| 未调用 Repository | 无 `studentRepository` import / 调用 |
| 未访问数据库 | 无 `prisma` / `@/shared/lib/db` import |

#### `createStudentAction`

**文件**：`src/features/students/actions/create-student.action.ts`

```
L17: return studentService.createStudent(input)
```

| 检查项 | 证据 |
|--------|------|
| 仅调用 Service | 函数体唯一语句为 `studentService.createStudent(input)` |
| 未调用 Validator | 无 validator import |
| 未调用 Repository | 无 repository import |
| 未访问数据库 | 无 prisma / db import |

#### `getStudentAction`

**文件**：`src/features/students/actions/get-student.action.ts`

```
L16: return studentService.getStudentDetail(id)
```

| 检查项 | 证据 |
|--------|------|
| 仅调用 Service | 函数体唯一语句为 `studentService.getStudentDetail(id)` |
| 未调用 Validator | 无 validator import |
| 未调用 Repository | 无 repository import |
| 未访问数据库 | 无 prisma / db import |

---

### 2.3 Service 实际调用链（源码级）

**文件**：`src/features/students/services/student.service.ts`

#### `listActiveStudents`（无入参，跳过 Validator）

```
L25: entities  ← studentRepository.findAllActive()
L26: balanceMap ← buildZeroLessonBalanceMap(entities)    [Mapper 纯函数]
L29: data       ← toSummaryList(entities, balanceMap)  [Mapper 纯函数]
```

链：`Service → Repository → Mapper`

#### `getStudentDetail`

```
L43: validation ← validateGetStudentId(id)               [Validator]
L44–49: 失败 → 构造 StudentActionResult VALIDATION_ERROR
L53: entity ← studentRepository.findById(validation.data) [Repository]
L54–59: null → STUDENT_NOT_FOUND（Service 构造，非 Validator）
L63: data ← toDetail(entity, 0)                           [Mapper]
```

链：`Service → Validator → Repository → Mapper`

#### `createStudent`

```
L77: validation ← validateCreateStudentInput(input)        [Validator]
L78–83: 失败 → 构造 StudentActionResult VALIDATION_ERROR
L87: { name, contactName, phone, note } ← validation.data  [已 normalize，见 §5]
L88–91: exists ← studentRepository.existsByNameAndContact(name, contactName)
L92–97: duplicate → DUPLICATE_STUDENT（Service 构造）
L100–105: entity ← studentRepository.create({...})       [Repository]
L108: data ← toDetail(entity, 0)                         [Mapper]
```

链：`Service → Validator → Repository → Mapper`

### 2.4 调用链总览

```
listStudentsAction()
  └─ studentService.listActiveStudents()
       ├─ studentRepository.findAllActive()
       ├─ buildZeroLessonBalanceMap()
       └─ toSummaryList()

createStudentAction(input)
  └─ studentService.createStudent(input)
       ├─ validateCreateStudentInput(input)
       ├─ studentRepository.existsByNameAndContact()
       ├─ studentRepository.create()
       └─ toDetail()

getStudentAction(id)
  └─ studentService.getStudentDetail(id)
       ├─ validateGetStudentId(id)
       ├─ studentRepository.findById()
       └─ toDetail()
```

---

## 3. Required Change 2 — Validator 输出契约

### 3.1 ValidationResult 结构

**定义文件**：`src/features/students/validators/validation-result.type.ts`

| 分支 | 形状 |
|------|------|
| 成功 | `{ success: true, data: T }` |
| 失败 | `{ success: false, fieldErrors: FieldErrors }` |

其中 `FieldErrors = Record<string, string>`（`action-result.type.ts` L22）。

### 3.2 fieldErrors 组织方式

| 规则 | 实现 |
|------|------|
| 键 | 表单字段名：`name` · `contactName` · `phone` · `note` · `id` |
| 值 | 单条中文错误消息（string） |
| 多字段 | `mergeFieldErrors()` 合并为单一对象（`create-student.validator.ts` L21–35） |
| 每字段一条 | `collectFieldError()` 仅在有错误时写入 `{ [field]: message }` |

**示例（create 失败）**：

```json
{
  "success": false,
  "fieldErrors": {
    "name": "请填写学员姓名",
    "contactName": "请填写联系人"
  }
}
```

### 3.3 Service 对 Validator 结果的处理

**Service 不直接透传 `ValidationResult`。** Action 层永远收到 `StudentActionResult<T>`，而非 `ValidationResult<T>`。

| 步骤 | 行为 | 源码位置 |
|------|------|----------|
| 1 | 调用 Validator | `student.service.ts` L43 / L77 |
| 2 | 判断 `validation.success` | L44 / L78 |
| 3 | 失败时 **重新构造** `StudentActionResult` | L45–49 / L79–83 |

失败分支构造方式（create / get 相同模式）：

```
{
  success: false,
  errorType: "VALIDATION_ERROR",    ← Service 添加（Validator 无此字段）
  fieldErrors: validation.fieldErrors ← 从 Validator 原样复制
}
```

| 字段 | Validator 有 | Service 添加 |
|------|-------------|--------------|
| `success: false` | ✅ | — |
| `fieldErrors` | ✅ | 原样复制 |
| `errorType` | ❌ | ✅ `VALIDATION_ERROR` |

**业务错误（非 Validator）**  wholly 由 Service 构造：

| errorType | 构造位置 | 含 fieldErrors |
|-----------|----------|----------------|
| `DUPLICATE_STUDENT` | L93–97 | 否，仅 `message` |
| `STUDENT_NOT_FOUND` | L55–59 | 否，仅 `message` |
| `INTERNAL_ERROR` | catch 块 | 否，仅 `message` |

### 3.4 全链路 Validation Error 一致性

```
Validator.fieldErrors  →  Service 复制到 StudentActionResult.fieldErrors
                       →  Action 原样 return Service 结果
                       →  UI（M3）读取 fieldErrors[fieldName]
```

`fieldErrors` 键名从 Validator 到 Action **不变**；仅外层包装从 `ValidationResult` 变为 `StudentActionResult`。

---

## 4. Required Change 3 — Mapper 纯函数证明

**文件**：`src/features/students/mappers/student.mapper.ts`

### 4.1 import 审计

```
import type { StudentDetail }   ← 仅类型
import type { StudentEntity }  ← 仅类型
import type { StudentSummary } ← 仅类型
```

| 禁止项 | 是否存在 |
|--------|----------|
| Repository | **否** |
| Prisma / db | **否** |
| Service | **否** |
| Validator | **否** |
| 异步 / IO | **否**（全部 sync function） |

### 4.2 函数输入 / 输出

| 函数 | 输入 | 输出 | 副作用 |
|------|------|------|--------|
| `toSummary` | `StudentEntity`, `lessonBalance: number` | `StudentSummary` | 无 |
| `toDetail` | `StudentEntity`, `lessonBalance: number` | `StudentDetail` | 无 |
| `toSummaryList` | `StudentEntity[]`, `Map<string, number>` | `StudentSummary[]` | 无 |
| `buildZeroLessonBalanceMap` | `StudentEntity[]` | `Map<string, number>`（全 0） | 无 |

### 4.3 职责边界

- **仅做**：Entity 字段 → ViewModel 字段映射 + 注入 `lessonBalance` 参数
- **不做**：校验、normalize、查库、业务规则
- `lessonBalance` 由 **Service 传入**（Sprint 2 恒为 `0` 或 `buildZeroLessonBalanceMap` 生成），Mapper 不计算余额逻辑

---

## 5. Required Change 4 — normalize 时机

与 Plan Rev 2 §5.5 对齐：**字段格式 / 必填 → Validator；Repository 收到已标准化数据。**

### 5.1 Create Student

| 字段 | normalize 位置 | 操作 | 源码 |
|------|----------------|------|------|
| `name` | **Validator**（成功分支） | `input.name.trim()` | `create-student.validator.ts` L44 |
| `contactName` | **Validator** | `input.contactName.trim()` | L45 |
| `phone` | **Validator** | `normalizeOptional()` → trim，空串 → `null` | L46, L59–62 |
| `note` | **Validator** | 同上 | L47 |

Validator 成功返回 `ValidationResult<CreateStudentEntityInput>`，`data` 已是标准化值。

Service 路径：

```
L87: const { name, contactName, phone, note } = validation.data
L100–105: studentRepository.create({ name, contactName, phone, note })
```

**Service 不对 create 字段二次 trim。** 直接使用 `validation.data`。

**Repository** 原样写入 DB，不再 normalize。

### 5.2 Get Student Detail

| 字段 | normalize 位置 | 操作 | 源码 |
|------|----------------|------|------|
| `id` | **Validator** | `(id as string).trim()` | `get-student.validator.ts` L16 |

Service 使用 `validation.data` 作为 `findById` 参数（`student.service.ts` L53）。

### 5.3 List Students

无入参 → **无 normalize**。

### 5.4 职责汇总

| 层 | normalize |
|----|-----------|
| Validator | ✅ 负责（create + get id） |
| Service | ❌ 不二次 normalize |
| Repository | ❌ 不 normalize |

---

## 6. 交付物清单（不变）

M2 新增文件见 Rev 1 §2.2；业务代码无变更。

---

## 7. 数据库与自测

| 项 | 说明 |
|----|------|
| M2 Review | PostgreSQL **不阻塞** |
| `npm run test:m2` | 脚本就绪；DB 集成延后至后续里程碑 |
| Validator / Mapper / Service / Action | 不依赖 DB 即可 Review |

---

## 8. 未做（M3）

- UI 组件 · `/students` 路由 · shadcn · M4 Acceptance

---

## 9. 请求

请 Tech Lead 基于本报告 **§2–§5 源码证据** 批准 M2 → 进入 **M3（UI）**。

---

**Resubmitted — 等待 M2 Review（Rev 2）。**
