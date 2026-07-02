/**
 * @file lesson-records-query.ts
 * @feature lessons
 */

export type LessonRecordsQuery = {
  studentId?: string
  recordType?: "purchase" | "adjustment"
}

export function buildLessonRecordsHref(
  params: LessonRecordsQuery = {}
): string {
  const search = new URLSearchParams()

  if (params.studentId) {
    search.set("studentId", params.studentId)
  }
  if (params.recordType) {
    search.set("recordType", params.recordType)
  }

  const query = search.toString()
  return query
    ? `/students/lesson-records?${query}`
    : "/students/lesson-records"
}

export function parseLessonRecordTypeFilter(
  value: string | undefined
): LessonRecordsQuery["recordType"] {
  if (value === "purchase" || value === "adjustment") {
    return value
  }
  return undefined
}
