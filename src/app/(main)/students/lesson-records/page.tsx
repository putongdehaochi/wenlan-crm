/**
 * @file page.tsx
 * @feature lessons
 */

import { listLessonRecordsAction } from "@/features/lessons/actions/list-lesson-records.action"
import { LessonRecordsPage } from "@/features/lessons/components/lesson-records-page"
import { parseLessonRecordTypeFilter } from "@/features/lessons/lib/lesson-records-query"
import { getStudentAction } from "@/features/students/actions/get-student.action"
import { listStudentsAction } from "@/features/students/actions/list-students.action"

export const dynamic = "force-dynamic"

type LessonRecordsRoutePageProps = {
  searchParams: Promise<{
    studentId?: string
    recordType?: string
  }>
}

export default async function LessonRecordsRoutePage({
  searchParams,
}: LessonRecordsRoutePageProps) {
  const { studentId, recordType } = await searchParams
  const recordTypeFilter = parseLessonRecordTypeFilter(recordType)

  const [studentsResult, recordsResult] = await Promise.all([
    listStudentsAction(),
    listLessonRecordsAction({
      studentId,
      recordType: recordTypeFilter,
    }),
  ])

  let filterStudentName: string | undefined
  if (studentId) {
    const studentResult = await getStudentAction(studentId)
    if (studentResult.success) {
      filterStudentName = studentResult.data.name
    }
  }

  return (
    <LessonRecordsPage
      students={studentsResult.success ? studentsResult.data : []}
      rows={recordsResult.success ? recordsResult.data : []}
      loadError={
        recordsResult.success
          ? undefined
          : (recordsResult.message ?? "加载课时记录失败")
      }
      studentIdFilter={studentId}
      recordTypeFilter={recordTypeFilter}
      filterStudentName={filterStudentName}
    />
  )
}
