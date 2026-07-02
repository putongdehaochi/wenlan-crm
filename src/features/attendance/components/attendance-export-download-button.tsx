/**
 * @file attendance-export-download-button.tsx
 * @feature attendance
 * @purpose Export Action → Blob 下载；不拼 CSV
 */

"use client"

import { useState } from "react"

import { downloadAttendanceExportPayload } from "@/features/attendance/lib/attendance-export-download"
import type { AttendanceExportPayload } from "@/features/attendance/types/attendance-export-payload.type"
import { Button } from "@/shared/components/ui/button"
import { appToast } from "@/shared/lib/toast"
import type { AttendanceActionResult } from "@/shared/types/action-result.type"

type AttendanceExportDownloadButtonProps = {
  label?: string
  onExport: () => Promise<AttendanceActionResult<AttendanceExportPayload>>
}

export function AttendanceExportDownloadButton({
  label = "导出 CSV",
  onExport,
}: AttendanceExportDownloadButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)

    const result = await onExport()
    setLoading(false)

    if (result.success) {
      downloadAttendanceExportPayload(result.data)
      appToast.success("导出成功", result.data.fileName)
      return
    }

    if (result.errorType === "VALIDATION_ERROR" && result.fieldErrors) {
      const firstError = Object.values(result.fieldErrors)[0]
      const message = firstError ?? "导出参数无效"
      setError(message)
      appToast.error(message)
      return
    }

    const message = result.message ?? "导出失败，请稍后重试"
    setError(message)
    appToast.error(message)
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        type="button"
        variant="outline"
        disabled={loading}
        onClick={handleClick}
      >
        {loading ? "导出中…" : label}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
