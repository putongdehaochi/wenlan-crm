/**
 * @file lesson-statistics-page.tsx
 * @feature lessons
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

import type { StudioLessonStatistics } from "@/features/lessons/types/lesson-record-list-row.type"
import { ChartCard } from "@/shared/components/charts/chart-card"
import { PageShell } from "@/shared/components/page-shell"
import { CHART_COLORS } from "@/shared/lib/chart-theme"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

type LessonStatisticsPageProps = {
  statistics: StudioLessonStatistics | null
  loadError?: string
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  )
}

export function LessonStatisticsPage({
  statistics,
  loadError,
}: LessonStatisticsPageProps) {
  const balanceData =
    statistics && statistics.totalRecorded > 0
      ? [
          {
            name: "已消耗",
            value: statistics.totalConsumed,
            color: CHART_COLORS.destructive,
          },
          {
            name: "当前余额",
            value: statistics.totalBalance,
            color: CHART_COLORS.primary,
          },
        ].filter((item) => item.value > 0)
      : []

  const recordTypeData = statistics
    ? [
        { name: "购课", value: statistics.purchaseCount },
        { name: "调整", value: statistics.adjustmentCount },
      ]
    : []

  const rankChartData =
    statistics?.studentRanks.map((row) => ({
      name: row.studentName,
      balance: row.balance,
    })) ?? []

  return (
    <PageShell
      title="课时统计"
      description="工作室课时录入、消耗与余额概览"
    >
      {loadError && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      )}

      {statistics && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard label="在读学员" value={statistics.activeStudentCount} />
            <MetricCard label="已录入总量" value={statistics.totalRecorded} />
            <MetricCard label="已消耗课时" value={statistics.totalConsumed} />
            <MetricCard label="当前总余额" value={statistics.totalBalance} />
            <MetricCard label="购课记录数" value={statistics.purchaseCount} />
            <MetricCard label="调整记录数" value={statistics.adjustmentCount} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard
              title="课时消耗与余额"
              description="已消耗 vs 当前总余额"
              isEmpty={balanceData.length === 0}
              emptyMessage="暂无课时数据"
            >
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={balanceData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={56}
                      outerRadius={88}
                      paddingAngle={2}
                    >
                      {balanceData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} 课时`, name]}
                      contentStyle={{
                        borderRadius: "0.75rem",
                        border: "1px solid oklch(0.9 0.015 75)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="记录类型" description="购课与调整记录数">
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={recordTypeData}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="oklch(0.9 0.015 75)"
                    />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      width={32}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} 条`, "记录数"]}
                      contentStyle={{
                        borderRadius: "0.75rem",
                        border: "1px solid oklch(0.9 0.015 75)",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill={CHART_COLORS.secondary}
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          <ChartCard
            title="学员课时余额排行"
            isEmpty={statistics.studentRanks.length === 0}
            emptyMessage="暂无在读学员"
          >
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={rankChartData}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="oklch(0.9 0.015 75)"
                  />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={72}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} 课时`, "余额"]}
                    contentStyle={{
                      borderRadius: "0.75rem",
                      border: "1px solid oklch(0.9 0.015 75)",
                    }}
                  />
                  <Bar
                    dataKey="balance"
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
                    <TableHead>学员</TableHead>
                    <TableHead>已录入</TableHead>
                    <TableHead>已消耗</TableHead>
                    <TableHead>当前余额</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statistics.studentRanks.map((row) => (
                    <TableRow key={row.studentId}>
                      <TableCell className="font-medium">
                        {row.studentName}
                      </TableCell>
                      <TableCell>{row.totalRecorded}</TableCell>
                      <TableCell>{row.totalConsumed}</TableCell>
                      <TableCell>{row.balance}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ChartCard>
        </div>
      )}
    </PageShell>
  )
}
