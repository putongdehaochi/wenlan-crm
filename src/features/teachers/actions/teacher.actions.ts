"use server"

import { teacherService } from "@/features/teachers/services/teacher.service"
import type { TeacherSummary } from "@/features/teachers/types/teacher-summary.type"
import type { TeacherActionResult } from "@/features/teachers/services/teacher.service"

export async function listTeachersAction(): Promise<
  TeacherActionResult<TeacherSummary[]>
> {
  return teacherService.listTeachers()
}

export async function createTeacherAction(input: {
  name: string
}): Promise<TeacherActionResult<TeacherSummary>> {
  return teacherService.createTeacher(input)
}

export async function updateTeacherAction(input: {
  id: string
  name: string
}): Promise<TeacherActionResult<TeacherSummary>> {
  return teacherService.updateTeacher(input)
}

export async function setDefaultTeacherAction(
  id: string
): Promise<TeacherActionResult<TeacherSummary>> {
  return teacherService.setDefaultTeacher(id)
}

export async function deleteTeacherAction(
  id: string
): Promise<TeacherActionResult<{ id: string }>> {
  return teacherService.deleteTeacher(id)
}
