# Sprint 6 Progress Report — M1（Repository）

> **里程碑**：M1 — Repository  
> **日期**：2026-07-01  
> **状态**：✅ 完成，待 Tech Lead Review  
> **前置**：Sprint 6 Design Rev 2 FINAL APPROVAL

---

## 1. 交付内容

| 项 | 说明 |
|----|------|
| Prisma Schema | **无变更** |
| `FindHistoryInput` | RC3 完整 Evolution 类型（Reserved 字段声明） |
| `attendanceRepository.restore()` | `VOIDED → VALID` |
| `findHistory()` | 扩展 `dateFrom` / `dateTo` 闭区间筛选 |
| 自测 | `scripts/m1-attendance-restore-repository.test.mts` |

---

## 2. Repository Contract Summary

### 2.1 新增 `restore(id): AttendanceEntity`

| 字段 | restore() |
|------|-----------|
| `status` | → `VALID` |
| `createdAt` / `attendanceDate` / `studentId` | 不变 |

### 2.2 `findHistory` 扩展

| 参数 | Sprint 6 行为 |
|------|---------------|
| `dateFrom` | `attendanceDate >= toAttendanceDate(dateFrom)` |
| `dateTo` | `attendanceDate <= toAttendanceDate(dateTo)` |
| `status` / `teacherId` / `classId` / `cursor` | **忽略**（Reserved） |
| 无日期参数 | 与 Sprint 5 一致 |

### 2.3 完整方法集

`create` · `findById` · `findHistory` · `void` · **`restore`** · `existsToday` · `getTodayStatuses`

---

## 3. Repository Responsibility Audit

| ✔ 负责 | ✘ 绝不（源码审计通过） |
|--------|------------------------|
| Query / Update / Mapping | `ALREADY_VALID` / `INSUFFICIENT_BALANCE` |
| `restore()` 纯 UPDATE status | `getBalance` / `lessonBalanceRepository` |
| Reserved 字段不参与 where | ViewModel / Service 调用 |

---

## 4. 验证

| 命令 | 结果 |
|------|------|
| `npm run test:m1-attendance-restore` | ✅ |
| `npm run test:m1-attendance-history` | ✅ |
| `npm run test:m1-attendance` | ✅ |
| `npm run test:m1-lesson` | ✅ |
| `npm run test:m1` | ✅ |

---

## 5. 不变项

| 模块 | 状态 |
|------|------|
| `lesson-balance.repository` | 零改动 |
| `student.service` / `lesson.service` | 零改动 |
| `create` / `void` / `existsToday` / `getTodayStatuses` | 语义不变 |

---

## 6. 未做（M2）

- `restoreAttendance` Service + 冻结调用链
- Validator / Mapper（`canRestore` · `RestoreAttendanceResult`）
- `restoreAttendanceAction`
- `listAttendanceHistory` Validator 日期校验

---

## 7. 下一步

提交本报告 → Tech Lead Review M1 → 通过后 **M2（Service / Actions）**

---

**M1 编码已停止，等待 Tech Lead Review。**
