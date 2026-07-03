"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { PageLoadingSkeleton } from "@/shared/components/page-loading-skeleton"

type NavigationPendingContextValue = {
  setPending: (pending: boolean) => void
  isPending: boolean
}

const NavigationPendingContext =
  createContext<NavigationPendingContextValue | null>(null)

export function NavigationPendingProvider({
  children,
}: {
  children: ReactNode
}) {
  const [pendingCount, setPendingCount] = useState(0)

  const setPending = useCallback((pending: boolean) => {
    setPendingCount((count) => {
      if (pending) {
        return count + 1
      }
      return Math.max(0, count - 1)
    })
  }, [])

  const value = useMemo(
    () => ({
      setPending,
      isPending: pendingCount > 0,
    }),
    [pendingCount, setPending]
  )

  return (
    <NavigationPendingContext.Provider value={value}>
      {children}
    </NavigationPendingContext.Provider>
  )
}

/** 在 Link 子组件内上报 pending，供主内容区同步展示骨架屏 */
export function useReportNavigationPending(pending: boolean) {
  const context = useContext(NavigationPendingContext)

  useEffect(() => {
    if (!context) {
      return
    }

    if (pending) {
      context.setPending(true)
    }

    return () => {
      if (pending) {
        context.setPending(false)
      }
    }
  }, [context, pending])
}

export function NavigationPendingContent({
  children,
}: {
  children: ReactNode
}) {
  const context = useContext(NavigationPendingContext)
  const isPending = context?.isPending ?? false

  if (isPending) {
    return <PageLoadingSkeleton />
  }

  return children
}
