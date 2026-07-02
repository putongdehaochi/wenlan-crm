/**
 * @file list-lesson-records.action.ts
 * @feature lessons
 */

"use server"

import { lessonService } from "@/features/lessons/services/lesson.service"
import type { FindLessonRecordsInput } from "@/features/lessons/types/lesson-record-list-row.type"
import type { LessonRecordListRow } from "@/features/lessons/types/lesson-record-list-row.type"
import type { LessonActionResult } from "@/shared/types/action-result.type"

export async function listLessonRecordsAction(
  input: FindLessonRecordsInput = {}
): Promise<LessonActionResult<LessonRecordListRow[]>> {
  return lessonService.listLessonRecords(input)
}
