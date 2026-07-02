/**
 * @file toast.ts
 * @purpose 统一操作反馈（Sonner）
 */

import { toast } from "sonner"

export const appToast = {
  success(message: string, description?: string) {
    toast.success(message, { description })
  },
  error(message: string, description?: string) {
    toast.error(message, { description })
  },
  info(message: string, description?: string) {
    toast(message, { description })
  },
}
