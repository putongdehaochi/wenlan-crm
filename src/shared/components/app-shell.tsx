"use client"

import { AppSidebar } from "@/shared/components/app-sidebar"
import {
  NavigationPendingContent,
  NavigationPendingProvider,
} from "@/shared/components/navigation-pending"

type AppShellProps = {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <NavigationPendingProvider>
      <div className="flex min-h-full bg-background">
        <AppSidebar />
        <main className="flex min-h-full min-w-0 flex-1 flex-col">
          <NavigationPendingContent>{children}</NavigationPendingContent>
        </main>
      </div>
    </NavigationPendingProvider>
  )
}
