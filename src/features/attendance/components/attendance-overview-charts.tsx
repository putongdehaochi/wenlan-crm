/**
 * @file attendance-overview-charts.tsx
 * @feature attendance
 * @purpose 签到概览与学员排行图表
 */

"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type {
  AttendanceStatisticsSummary,
  StudentRankRow,
} from "@/features/attendance/types/attendance-statistics-summary.type"
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

type AttendanceOverviewChartsProps = {
  summary: Pick<
    AttendanceStatisticsSummary,
    "validAttendance" | "voidedAttendance" | "checkInCount" | "voidEventCount"
  >
  studentRank: StudentRankRow[]
}

export function AttendanceOverviewCharts({
  summary,
  studentRank,
}: AttendanceOverviewChartsProps) {
  const statusData = [
    {
      name: "有效签到",
      value: summary.validAttendance,
      color: CHART_COLORS.primary,
    },
    {
      name: "已撤销",
      value: summary.voidedAttendance,
      color: CHART_COLORS.destructive,
    },
  ].filter((item) => item.value > 0)

  const lifecycleData = [
    { name: "签到事件", value: summary.checkInCount },
    { name: "撤销事件", value: summary.voidEventCount },
  ]

  const rankChartData = studentRank.map((row) => ({
    name: row.studentName,
    count: row.validAttendance,
  }))

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard
        title="签到状态分布"
        description="有效 vs 已撤销"
        isEmpty={statusData.length === 0}
        emptyMessage="暂无签到数据"
      >
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={88}
                paddingAngle={2}
              >
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value} 次`, name]}
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "1px solid oklch(0.9 0.015 75)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="生命周期事件" description="签到与撤销事件次数对比">
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={lifecycleData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.9 0.015 75)" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
              <Tooltip
                formatter={(value) => [`${value} 次`, "次数"]}
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "1px solid oklch(0.9 0.015 75)",
                }}
              />
              <Bar dataKey="value" fill={CHART_COLORS.tertiary} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="lg:col-span-2">
      <ChartCard
        title="学员有效签到排行"
        description="Top 排行可视化"
        isEmpty={studentRank.length === 0}
        emptyMessage="暂无排行数据"
      >
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rankChartData}
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
                formatter={(value) => [`${value} 次`, "有效签到"]}
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "1px solid oklch(0.9 0.015 75)",
                }}
              />
              <Bar
                dataKey="count"
                fill={CHART_COLORS.primary}
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
                <TableHead className="text-right">有效签到</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentRank.map((row) => (
                <TableRow key={row.studentId}>
                  <TableCell className="tabular-nums">{row.rank}</TableCell>
                  <TableCell className="font-medium">{row.studentName}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.validAttendance}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ChartCard>
      </div>
    </div>
  )
}
