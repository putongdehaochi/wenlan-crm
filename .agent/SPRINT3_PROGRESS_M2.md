# Sprint 3 Progress Report — M2（业务层）

> **里程碑**：M2 — Validator / Mapper / Service / Actions  
> **日期**：2026-06-29  
> **状态**：✅ APPROVED  
> **Tech Lead Review**：2026-06-29  
> **前置**：M1 APPROVED

---

## 1. 交付内容

| 层 | 文件 |
|----|------|
| Shared | `shared/types/action-result.type.ts` — 统一 ActionResult |
| Types | `create-lesson-purchase-input` · `lesson-purchase-result` |
| Errors | `lesson.errors.ts` |
| Validators | `positive-integer.rule` · `create-lesson-purchase.validator` |
| Mapper | `lesson.mapper.ts` — `toLessonPurchaseResult` |
| Service | `lesson.service.ts` — `createLessonPurchase` |
| Action | `create-lesson-purchase.action.ts` |
| Student 增强 | `student.service.ts` — 真实余额；移除 `buildZeroLessonBalanceMap` |

---

## 2. 固定调用链（Plan 合规）

**Student List**

```
findAllActive() → getBalances(ids) → toSummaryList()
```

**Student Detail**

```
findById() → getBalance(id) → toDetail()
```

**Create Lesson Purchase**

```
Validator → studentRepository.findById → lessonPackageRepository.create
         → lessonBalanceRepository.getBalance → toLessonPurchaseResult
```

---

## 3. Cross Feature Dependency

| 允许 | 禁止 |
|------|------|
| `studentService` → `lessonBalanceRepository` | `studentService` → `lessonService` |
| `lessonService` → `studentRepository.findById` | `lessonService` → `studentService` |

---

## 4. Action 契约

沿用统一结构：`success` · `data` · `errorType` · `fieldErrors` · `message`

Lesson 错误码：`VALIDATION_ERROR` · `STUDENT_NOT_FOUND` · `STUDENT_ARCHIVED` · `INTERNAL_ERROR`

---

## 5. 事务边界

Sprint 3 购课：单表 INSERT，**不**开启 `$transaction`（Plan §7.2）

---

## 6. 验证

| 命令 | 结果 |
|------|------|
| `npm run test:m2-lesson` | ✅ 11 项 |
| `npm run test:m2`（Student 回归） | ✅ |
| `npm run test:m1-lesson` | ✅ |
| `npm run test:m4`（Student Acceptance 回归） | ✅ |
| `npm run build` | ✅ |

---

## 7. 未做（M3）

- `create-lesson-purchase-form.tsx`
- `student-detail-view` 购课入口
- `students-page` 编排

---

## 8. 下一步

Tech Lead Review M2 → 通过后 **M3（UI）**

---

**已停止，等待 M2 Review。**
