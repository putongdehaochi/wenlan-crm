/**
 * @file create-lesson-purchase.action.ts
 * @feature lessons
 * @purpose 录入购课课时；仅调用 Service
 */

"use server"

import { lessonService } from "@/features/lessons/services/lesson.service"
import type { CreateLessonPurchaseInput } from "@/features/lessons/types/create-lesson-purchase-input.type"
import type { LessonPurchaseResult } from "@/features/lessons/types/lesson-purchase-result.type"
import type { LessonActionResult } from "@/shared/types/action-result.type"
import { revalidateSharedAppDataPaths } from "@/shared/lib/revalidate-app-paths"

export async function createLessonPurchaseAction(
  input: CreateLessonPurchaseInput
): Promise<LessonActionResult<LessonPurchaseResult>> {
  const result = await lessonService.createLessonPurchase(input)
  if (result.success) {
    revalidateSharedAppDataPaths()
  }
  return result
}
