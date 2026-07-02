/**
 * @file attendance-remaining-rank.tsx
 * @feature attendance
 * @purpose 剩余课时排行图表
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

import type { RemainingLessonRankRow } from "@/features/attendance/types/attendance-statistics-summary.type"
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

type AttendanceRemainingRankProps = {
  rows: RemainingLessonRankRow[]
}

export function AttendanceRemainingRank({ rows }: AttendanceRemainingRankProps) {
  const chartData = rows.map((row) => ({
    name: row.studentName,
    balance: row.remainingLessons,
  }))

  return (
    <ChartCard
      title="剩余课时排行"
      isEmpty={rows.length === 0}
      emptyMessage="暂无排行数据"
    >
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="oklch(0.9 0.015 75)" />
            <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={72}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value) => [`${value} 课时`, "剩余"]}
              contentStyle={{
                borderRadius: "0.75rem",
                border: "1px solid oklch(0.9 0.015 75)",
              }}
            />
            <Bar
              dataKey="balance"
              fill={CHART_COLORS.secondary}
              radius={[0, 6, 6, 0]}
              maxBarSize={22}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">排名</TableHead>
              <TableHead>学员姓名</TableHead>
              <TableHead className="text-right">剩余课时</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.studentId}>
                <TableCell className="tabular-nums">{row.rank}</TableCell>
                <TableCell className="font-medium">{row.studentName}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.remainingLessons}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ChartCard>
  )
}
