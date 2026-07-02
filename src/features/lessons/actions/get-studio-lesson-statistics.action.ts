/**
 * @file get-studio-lesson-statistics.action.ts
 * @feature lessons
 */

"use server"

import { lessonService } from "@/features/lessons/services/lesson.service"
import type { StudioLessonStatistics } from "@/features/lessons/types/lesson-record-list-row.type"
import type { LessonActionResult } from "@/shared/types/action-result.type"

export async function getStudioLessonStatisticsAction(): Promise<
  LessonActionResult<StudioLessonStatistics>
> {
  return lessonService.getStudioLessonStatistics()
}
