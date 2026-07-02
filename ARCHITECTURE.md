# Feature First Architecture

```
src/
├── app/                  # Next.js App Router（路由入口）
├── features/             # 按业务功能垂直切分
│   └── {feature}/
│       ├── components/   # 功能私有 UI
│       ├── actions/      # Server Actions
│       ├── schemas/      # 校验
│       └── types/        # 功能类型
└── shared/               # 跨功能共享
    ├── components/ui/    # shadcn/ui 组件
    ├── hooks/
    ├── lib/
    └── types/
```

**原则**

- 功能代码放 `features/`，不跨功能引用私有模块
- 通用 UI / 工具放 `shared/`
- 路由薄层：`app/` 只做组合与路由，业务逻辑在 `features/`
