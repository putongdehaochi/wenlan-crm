import { AppSidebar } from "@/shared/components/app-sidebar"

type AppShellProps = {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-full bg-background">
      <AppSidebar />
      <main className="flex min-h-full min-w-0 flex-1 flex-col">{children}</main>
    </div>
  )
}
