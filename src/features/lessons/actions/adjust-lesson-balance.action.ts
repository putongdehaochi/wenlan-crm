/**
 * @file adjust-lesson-balance.action.ts
 * @feature lessons
 * @purpose 课时调整 Server Action
 */

"use server"

import { lessonService } from "@/features/lessons/services/lesson.service"
import type { AdjustLessonBalanceInput } from "@/features/lessons/types/adjust-lesson-balance-input.type"
import type { LessonPurchaseResult } from "@/features/lessons/types/lesson-purchase-result.type"
import type { LessonActionResult } from "@/shared/types/action-result.type"

export async function adjustLessonBalanceAction(
  input: AdjustLessonBalanceInput
): Promise<LessonActionResult<LessonPurchaseResult>> {
  return lessonService.adjustLessonBalance(input)
}
