/**
 * @file attendance-audit-timeline-panel.tsx
 * @feature attendance
 * @purpose 只读 Timeline 侧栏；直接消费 AttendanceAuditTimeline
 */

"use client"

import type { AttendanceAuditTimeline } from "@/features/attendance/types/attendance-audit-timeline.type"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet"

type AttendanceAuditTimelinePanelProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  timeline: AttendanceAuditTimeline | null
  loading: boolean
  error: string | null
}

function formatStatus(status: AttendanceAuditTimeline["currentStatus"]): string {
  return status === "VALID" ? "有效" : "已撤销"
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso))
}

export function AttendanceAuditTimelinePanel({
  open,
  onOpenChange,
  timeline,
  loading,
  error,
}: AttendanceAuditTimelinePanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>签到 Timeline</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6">
          {loading && (
            <p className="text-sm text-muted-foreground">加载中…</p>
          )}
          {!loading && error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {!loading && !error && timeline && (
            <div className="flex flex-col gap-6">
              <dl className="grid gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">学员</dt>
                  <dd className="font-medium">{timeline.studentName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">签到日期</dt>
                  <dd className="font-medium">{timeline.attendanceDate}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">当前状态</dt>
                  <dd className="font-medium">
                    {formatStatus(timeline.currentStatus)}
                  </dd>
                </div>
              </dl>

              <div>
                <h3 className="mb-3 text-sm font-medium">生命周期事件</h3>
                {timeline.events.length === 0 ? (
                  <p className="text-sm text-muted-foreground">暂无事件</p>
                ) : (
                  <ol className="relative flex flex-col gap-4 border-l border-border pl-4">
                    {timeline.events.map((event, index) => (
                      <li key={`${event.occurredAt}-${index}`} className="text-sm">
                        <p className="font-medium">{event.label}</p>
                        <p className="text-muted-foreground">
                          {formatDateTime(event.occurredAt)}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
