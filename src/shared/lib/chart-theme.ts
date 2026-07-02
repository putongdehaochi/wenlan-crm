/**
 * @file chart-theme.ts
 * @purpose 统计图表配色（与 globals.css chart-* 一致）
 */

export const CHART_COLORS = {
  primary: "oklch(0.58 0.05 48)",
  secondary: "oklch(0.72 0.06 55)",
  tertiary: "oklch(0.48 0.04 45)",
  muted: "oklch(0.78 0.03 60)",
  destructive: "oklch(0.577 0.245 27.325)",
  success: "oklch(0.55 0.08 145)",
} as const

export type ChartSeries = {
  key: string
  label: string
  color: string
}
