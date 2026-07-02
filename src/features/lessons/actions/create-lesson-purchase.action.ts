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

export async function createLessonPurchaseAction(
  input: CreateLessonPurchaseInput
): Promise<LessonActionResult<LessonPurchaseResult>> {
  return lessonService.createLessonPurchase(input)
}
