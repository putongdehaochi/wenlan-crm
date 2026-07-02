/**
 * @file chart-card.tsx
 * @purpose 统计图表容器
 */

"use client"

import type { ReactNode } from "react"

type ChartCardProps = {
  title: string
  description?: string
  emptyMessage?: string
  isEmpty?: boolean
  children: ReactNode
}

export function ChartCard({
  title,
  description,
  emptyMessage = "暂无数据",
  isEmpty = false,
  children,
}: ChartCardProps) {
  return (
    <section className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-sm font-medium">{title}</h2>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </div>

      {isEmpty ? (
        <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        children
      )}
    </section>
  )
}
