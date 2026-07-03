"use server"

import { teacherService } from "@/features/teachers/services/teacher.service"
import type { TeacherSummary } from "@/features/teachers/types/teacher-summary.type"
import type { TeacherActionResult } from "@/features/teachers/services/teacher.service"
import { revalidateSharedAppDataPaths } from "@/shared/lib/revalidate-app-paths"

export async function listTeachersAction(): Promise<
  TeacherActionResult<TeacherSummary[]>
> {
  return teacherService.listTeachers()
}

export async function createTeacherAction(input: {
  name: string
}): Promise<TeacherActionResult<TeacherSummary>> {
  const result = await teacherService.createTeacher(input)
  if (result.success) {
    revalidateSharedAppDataPaths()
  }
  return result
}

export async function updateTeacherAction(input: {
  id: string
  name: string
}): Promise<TeacherActionResult<TeacherSummary>> {
  const result = await teacherService.updateTeacher(input)
  if (result.success) {
    revalidateSharedAppDataPaths()
  }
  return result
}

export async function setDefaultTeacherAction(
  id: string
): Promise<TeacherActionResult<TeacherSummary>> {
  const result = await teacherService.setDefaultTeacher(id)
  if (result.success) {
    revalidateSharedAppDataPaths()
  }
  return result
}

export async function deleteTeacherAction(
  id: string
): Promise<TeacherActionResult<{ id: string }>> {
  const result = await teacherService.deleteTeacher(id)
  if (result.success) {
    revalidateSharedAppDataPaths()
  }
  return result
}
