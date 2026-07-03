/**
 * @file revalidate-app-paths.ts
 * @purpose 变更共享数据后失效相关 RSC 页面缓存
 */

import { revalidatePath } from "next/cache"

const SHARED_DATA_PATHS = [
  "/students",
  "/students/groups",
  "/students/teachers",
  "/students/lesson-records",
  "/attendance",
  "/attendance/history",
] as const

export function revalidateSharedAppDataPaths(): void {
  for (const path of SHARED_DATA_PATHS) {
    revalidatePath(path)
  }
}
