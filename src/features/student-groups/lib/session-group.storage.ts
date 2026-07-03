/**
 * @purpose SESSION 分组仅存于浏览器 sessionStorage，不入库
 *
 * studentIds 为空数组表示「全部在读学员」；非空则为自定义筛选子集。
 */

import type { SessionStudentGroup } from "@/features/student-groups/types/student-group-summary.type"

const STORAGE_KEY = "wenlan-crm:session-student-group"

/** SSR 与 hydration 首屏用的稳定默认值，不读 sessionStorage */
export function createDefaultSessionStudentGroup(): SessionStudentGroup {
  return {
    id: "session-default",
    name: "本次签到",
    type: "SESSION",
    studentIds: [],
    createdAt: "",
  }
}

function createNewSessionGroup(): SessionStudentGroup {
  return {
    id: `session-${Date.now()}`,
    name: "本次签到",
    type: "SESSION",
    studentIds: [],
    createdAt: new Date().toISOString(),
  }
}

export function loadSessionStudentGroup(): SessionStudentGroup {
  if (typeof window === "undefined") {
    return createDefaultSessionStudentGroup()
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const created = createNewSessionGroup()
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(created))
      return created
    }

    const parsed = JSON.parse(raw) as SessionStudentGroup
    if (parsed.type !== "SESSION" || !Array.isArray(parsed.studentIds)) {
      return createNewSessionGroup()
    }

    return parsed
  } catch {
    return createNewSessionGroup()
  }
}

export function saveSessionStudentGroup(group: SessionStudentGroup): void {
  if (typeof window === "undefined") {
    return
  }

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(group))
}

export function resetSessionStudentGroup(name = "本次签到"): SessionStudentGroup {
  const group = createNewSessionGroup()
  group.name = name
  saveSessionStudentGroup(group)
  return group
}

export function setSessionStudentIds(studentIds: string[]): SessionStudentGroup {
  const current = loadSessionStudentGroup()
  const next: SessionStudentGroup = {
    ...current,
    studentIds: [...new Set(studentIds)],
  }
  saveSessionStudentGroup(next)
  return next
}

export function cloneSavedGroupAsSession(
  saved: { name: string; studentIds: string[] }
): SessionStudentGroup {
  const group: SessionStudentGroup = {
    id: `session-${Date.now()}`,
    name: saved.name,
    type: "SESSION",
    studentIds: [...saved.studentIds],
    createdAt: new Date().toISOString(),
  }
  saveSessionStudentGroup(group)
  return group
}
