/**
 * @file attendance-monthly-trend.tsx
 * @feature attendance
 * @purpose 月度有效签到趋势图表（仅展示 Mapper 输出，不补零/插值）
 */

"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { AttendanceMonthlyTrendPoint } from "@/features/attendance/types/attendance-monthly-trend-point.type"
import { ChartCard } from "@/shared/components/charts/chart-card"
import { CHART_COLORS } from "@/shared/lib/chart-theme"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

type AttendanceMonthlyTrendProps = {
  points: AttendanceMonthlyTrendPoint[]
}

export function AttendanceMonthlyTrend({ points }: AttendanceMonthlyTrendProps) {
  const chartData = points.map((point) => ({
    month: point.month,
    count: point.validAttendanceCount,
  }))

  return (
    <ChartCard
      title="月度有效签到趋势"
      description="按月份汇总有效签到次数"
      isEmpty={points.length === 0}
      emptyMessage="暂无趋势数据"
    >
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.9 0.015 75)" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip
              formatter={(value) => [`${value} 次`, "有效签到"]}
              labelFormatter={(label) => `月份：${label}`}
              contentStyle={{
                borderRadius: "0.75rem",
                border: "1px solid oklch(0.9 0.015 75)",
              }}
            />
            <Bar
              dataKey="count"
              fill={CHART_COLORS.primary}
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>月份</TableHead>
              <TableHead className="text-right">有效签到次数</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {points.map((point) => (
              <TableRow key={point.month}>
                <TableCell className="font-medium">{point.month}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {point.validAttendanceCount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ChartCard>
  )
}
