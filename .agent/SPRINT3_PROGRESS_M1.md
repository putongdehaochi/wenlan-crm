# Sprint 3 Progress Report — M1（数据层）

> **里程碑**：M1 — Schema / Repository  
> **日期**：2026-06-29  
> **状态**：✅ APPROVED  
> **Tech Lead Review**：2026-06-29  
> **前置**：Sprint 3 Design Rev 2 APPROVED

---

## 1. 交付内容


| 项             | 说明                                                                 |
| ------------- | ------------------------------------------------------------------ |
| Prisma Schema | `LessonPackage` model + `Student.lessonPackages` relation          |
| Migration     | `20260629140000_init_lesson_package`                               |
| ADR-008       | LessonPackage Schema                                               |
| Entity        | `lesson-package-entity.type.ts`                                    |
| Repository    | `lesson-package.repository.ts`（CRUD only）                          |
| Repository    | `lesson-balance.repository.ts`（`getBalance` / `getBalances`）       |
| 自测            | `scripts/m1-lesson-repository.test.mts` — `npm run test:m1-lesson` |


---

## 2. Repository 职责（ADR-007 RC1）

### lessonPackageRepository


| 方法                | 职责        |
| ----------------- | --------- |
| `create`          | 插入购课记录    |
| `findByStudentId` | 按学员查询购课记录 |


**无** `getBalance` / `getBalances` / `SUM`

### lessonBalanceRepository


| 方法                        | 契约                                |
| ------------------------- | --------------------------------- |
| `getBalance(studentId)`   | `number`；内部委托 `getBalances([id])` |
| `getBalances(studentIds)` | `Map<string, number>`；批量 GROUP BY |


**无** `create` / `findByStudentId`

---

## 3. Schema 要点

```prisma
model LessonPackage {
  id, studentId, quantity, note?, purchasedAt, createdAt
  student → Student (onDelete: Restrict)
  @@index([studentId])
}
```

- `quantity` CHECK > 0（migration SQL）
- **无** `remainingQuantity` / `lessonBalance` 列

---

## 4. 验证


| 命令                            | 结果     |
| ----------------------------- | ------ |
| `npx prisma migrate deploy`   | ✅      |
| `npm run test:m1-lesson`      | ✅ 10 项 |
| `npm run test:m1`（Student 回归） | ✅      |


---

## 5. 未做（M2+）

- Validator / Service / Action
- `shared/types/action-result.type.ts` 提取
- Student Service 接入真实余额
- UI 购课表单

---

## 6. 下一步

Tech Lead Review M1 → 通过后 **M2（Validator / Service / Actions + Student 余额接入）**

---

**已停止，等待 M1 Review。**