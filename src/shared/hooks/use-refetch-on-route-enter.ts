/**
 * @file use-refetch-on-route-enter.ts
 * @purpose 客户端切菜单时 Next.js 可能复用页面实例，mount effect 不会重跑；进入目标路由时再拉数据
 */

"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

export function useRefetchOnRouteEnter(
  routePath: string,
  refetch: () => void | Promise<void>
): void {
  const pathname = usePathname()
  const refetchRef = useRef(refetch)
  refetchRef.current = refetch

  useEffect(() => {
    if (pathname === routePath) {
      void refetchRef.current()
    }
  }, [pathname, routePath])
}
