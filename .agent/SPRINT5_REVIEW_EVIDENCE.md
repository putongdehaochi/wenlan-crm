# Sprint 5 Review Evidence

> **日期**：2026-07-01  
> **用途**：M4 Final Review 证据包  
> **状态**：✅ APPROVED（2026-07-01 Tech Lead Final Review）→ Sprint 5 CLOSED

---

## Evidence 1 — Acceptance 逐条（specs/attendance-history.md §7）

| 锚点 | 脚本输出 | 源码 |
|------|----------|------|
| H1 | `§7.1 H1 历史倒序 + studentName` | `m4-attendance-history-acceptance.test.mts` L175+ |
| H2 | `§7.1 H2 studentId 筛选` | 同上 L191+ |
| H3 | `§7.1 H3 多学员姓名` | 同上 L196+ |
| H4 | `§7.1 H4 无签到空列表` | 同上 L214+ |
| H5 | `§7.1 H5 无效 studentId` | 同上 L222+ |
| H6 | `§7.1 H6 归档学员历史` | 同上 L232+ |
| U1 | `§7.2 U1 VALID→VOIDED` | 同上 L252+ |
| U2 | `§7.2 U2 重复撤销` | 同上 L272+ |
| U3 | `§7.2 U3 不存在记录` | 同上 L281+ |
| U4 | `§7.2 U4 History VOIDED` | 同上 L290+ |
| U5 | `§7.2 U5 撤销后 Today List` | 同上 L301+ |
| R1 | `§7.3 R1 Sprint 4 签到回归` | 同上 L330+ |
| R2 | `§7.3 R2 Student 余额公式` | 同上 L343+ |
| R3 | `§7.3 R3 UI Import 审计` | 同上 L352+ |

---

## Evidence 2 — Student Module 零改动

`student.service.ts` 无 diff：

- 无 `attendanceRepository` / `attendanceService`
- 无 `findByIds` 调用
- `npm run test:m4` / `test:m2` 回归通过

---

## Evidence 3 — Balance 唯一来源（ADR-007）

撤销后余额恢复路径：

```
voidAttendanceAction
  → attendanceRepository.void()     // 仅 UPDATE status
  → lessonBalanceRepository.getBalance()  // COUNT(VALID) 派生
```

`lesson-balance.repository.ts` 公开签名未变；M4 静态审计通过。

---

## Evidence 4 — UI Import 审计

| 文件 | Action Only | 无 Service/Repo |
|------|-------------|-----------------|
| `attendance-history-page.tsx` | ✅ | ✅ |
| `attendance-history-list.tsx` | ✅ | ✅ |
| `attendance-history-row.tsx` | ✅ | ✅ |
| `void-attendance-dialog.tsx` | ✅ | ✅ |

---

## Evidence 5 — 全量回归（2026-07-01）

13 条测试命令 + `npm run build` — **All Passed**

详见 `.agent/SPRINT5_PROGRESS_M4.md` §4

---

## Evidence 6 — 无新增 ADR

Sprint 5 实现完全落在 ADR-011 设计范围内；M4 未发现需新 ADR 的架构变更。
