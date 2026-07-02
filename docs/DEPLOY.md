# 免费线上部署指南（Vercel + Neon）

适合「先看看效果」的演示环境，**免费、无需信用卡**。

## 架构

| 组件 | 服务 | 免费额度 |
|------|------|----------|
| 网站 | [Vercel](https://vercel.com) | Hobby 免费 |
| 数据库 | [Neon](https://neon.tech) | 约 0.5GB 存储 + 每月计算时长 |

本地开发用的 **Prisma Dev 不能用于线上**，需要换成 Neon 的 PostgreSQL。

---

## 你需要注册的账号（2 个）

1. **GitHub**（你已有仓库 `putongdehaochi/wenlan-crm`）
2. **Vercel**：https://vercel.com/signup （用 GitHub 登录最省事）

Neon 可在 Vercel 里一键创建，不必单独注册。

---

## 第一步：导出本地数据

确保 Prisma Dev 在运行：

```powershell
npm run dev:all
# 或另开终端：
npx prisma dev start default
```

导出当前数据：

```powershell
npm run db:export
```

会生成 `prisma/data/export.json`（含学员、课时、签到等）。

---

## 第二步：推送代码到 GitHub

把应用代码和 `prisma/data/export.json` 一起推到 GitHub（export.json 不含密码，可提交）。

```powershell
git add .
git commit -m "chore: add deployment and seed scripts"
git push origin main
```

---

## 第三步：Vercel 部署

1. 打开 https://vercel.com/new
2. **Import** 仓库 `putongdehaochi/wenlan-crm`
3. Framework 选 **Next.js**（自动识别）
4. 点击 **Storage** → **Create Database** → 选 **Neon Postgres**
   - 选 **Create New Neon Account**（免费）
   - Region 选离国内较近的（如 Singapore / Tokyo，若有）
5. 确认环境变量（Neon 会自动注入）：
   - `DATABASE_URL` — 带 `-pooler` 的连接串（运行时用）
   - `DATABASE_URL_UNPOOLED` 或 `DIRECT_URL` — 直连（迁移用）
6. **Deploy**

构建命令已配置为：

```
prisma generate && prisma migrate deploy && tsx prisma/seed.ts && next build
```

首次部署会自动：建表 → 导入你的 export.json → 补充 mock 学员。

---

## 第四步：访问

部署成功后 Vercel 会给出地址，例如：

```
https://wenlan-crm-xxxx.vercel.app
```

---

## 常见问题

### 构建失败：数据库连不上

- 检查 `DATABASE_URL` 是否为 **pooler** 地址
- 在 Vercel → Settings → Environment Variables 补一条：
  ```
  DIRECT_URL = <Neon 控制台里的 direct / unpooled 连接串>
  ```

### 页面能开但没有数据

在 Vercel 项目 → Deployments → 最新一次 → **Redeploy**（确保 `prisma/data/export.json` 已在仓库里）。

或本地连 Neon 手动 seed：

```powershell
$env:DATABASE_URL="你的 Neon 连接串"
npx tsx prisma/seed.ts
```

### 免费版限制

- Neon 长时间无访问会 **休眠**，首次打开可能慢 1～2 秒
- 仅适合演示/内测，不适合正式营业

---

## 我需要你提供什么（给协助部署的人）

若请人代部署，请提供：

1. GitHub 仓库已 push 最新代码
2. Vercel 项目已创建并连上 Neon（或把 Vercel 邀请为成员）
3. 不需要提供数据库密码（在 Vercel 环境变量里即可）

**不要**把 `.env` 或 Neon 密码发到公开渠道。
