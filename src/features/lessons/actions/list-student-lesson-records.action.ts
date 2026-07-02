/**
 * @file list-student-lesson-records.action.ts
 * @feature lessons
 * @purpose 查询学员课时记录与统计
 */

"use server"

import { lessonService } from "@/features/lessons/services/lesson.service"
import type { StudentLessonRecords } from "@/features/lessons/types/lesson-record-row.type"
import type { LessonActionResult } from "@/shared/types/action-result.type"

export async function listStudentLessonRecordsAction(
  studentId: string
): Promise<LessonActionResult<StudentLessonRecords>> {
  return lessonService.listStudentLessonRecords(studentId)
}
