# AI 工作流规则

1. 任何业务开发前必须先读取整个 `.agent`。
2. 每完成一个 Task 必须更新 `TASKS.md`。
3. 每完成一个 Task 必须更新 `STATE.json`。
4. 修改数据库必须更新 `DECISIONS.md`。
5. 不得删除历史 Decision。
6. 任何重大重构必须写 `REVIEW.md`。
7. 如果发现架构冲突，立即停止开发，不要自行决定。
8. 每个 Sprint 完成后必须生成 `.agent/SPRINT_REPORT.md`（固定格式，≤300 行，不含源码）；所有 Sprint Review 均基于此文件进行。