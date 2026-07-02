/**
 * @file page.tsx
 * @feature lessons
 */

import { getStudioLessonStatisticsAction } from "@/features/lessons/actions/get-studio-lesson-statistics.action"
import { LessonStatisticsPage } from "@/features/lessons/components/lesson-statistics-page"

export default async function LessonStatisticsRoutePage() {
  const result = await getStudioLessonStatisticsAction()

  return (
    <LessonStatisticsPage
      statistics={result.success ? result.data : null}
      loadError={
        result.success ? undefined : (result.message ?? "加载课时统计失败")
      }
    />
  )
}
