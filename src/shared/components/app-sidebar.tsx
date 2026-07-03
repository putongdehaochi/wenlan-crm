"use client"

import Link, { useLinkStatus } from "next/link"
import { usePathname } from "next/navigation"
import type { ComponentType } from "react"
import {
  BarChart3,
  ClipboardCheck,
  ClipboardList,
  History,
  Loader2,
  PieChart,
  ShieldCheck,
  UserRound,
  Users,
  UsersRound,
} from "lucide-react"

import { cn } from "@/shared/lib/utils"
import { useReportNavigationPending } from "@/shared/components/navigation-pending"

type NavItem = {
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
  match: (pathname: string) => boolean
}

const STUDENTS_NAV: NavItem[] = [
  {
    href: "/students",
    label: "学生管理",
    icon: Users,
    match: (pathname) => pathname === "/students",
  },
  {
    href: "/students/lesson-records",
    label: "课时记录",
    icon: ClipboardList,
    match: (pathname) => pathname.startsWith("/students/lesson-records"),
  },
  {
    href: "/students/lesson-statistics",
    label: "课时统计",
    icon: PieChart,
    match: (pathname) => pathname.startsWith("/students/lesson-statistics"),
  },
  {
    href: "/students/groups",
    label: "学员分组",
    icon: UsersRound,
    match: (pathname) => pathname.startsWith("/students/groups"),
  },
  {
    href: "/students/teachers",
    label: "老师管理",
    icon: UserRound,
    match: (pathname) => pathname.startsWith("/students/teachers"),
  },
]

const ATTENDANCE_NAV: NavItem[] = [
  {
    href: "/attendance",
    label: "今日签到",
    icon: ClipboardCheck,
    match: (pathname) => pathname === "/attendance",
  },
  {
    href: "/attendance/history",
    label: "签到历史",
    icon: History,
    match: (pathname) => pathname.startsWith("/attendance/history"),
  },
  {
    href: "/attendance/audit",
    label: "签到审计",
    icon: ShieldCheck,
    match: (pathname) => pathname.startsWith("/attendance/audit"),
  },
  {
    href: "/attendance/statistics",
    label: "签到统计",
    icon: BarChart3,
    match: (pathname) => pathname.startsWith("/attendance/statistics"),
  },
]

function NavLinkInner({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const { pending } = useLinkStatus()
  useReportNavigationPending(pending)
  const active = item.match(pathname) || pending
  const Icon = item.icon

  return (
    <span
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground shadow-sm"
          : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
      )}
      aria-current={active ? "page" : undefined}
    >
      {pending ? (
        <Loader2 className="size-4 shrink-0 animate-spin opacity-70" />
      ) : (
        <Icon className="size-4 shrink-0 opacity-80" />
      )}
      <span className={cn(pending && "opacity-80")}>{item.label}</span>
      {pending && <span className="sr-only">正在加载</span>}
    </span>
  )
}

function NavLink({ item }: { item: NavItem }) {
  return (
    <Link href={item.href} prefetch className="block rounded-lg">
      <NavLinkInner item={item} />
    </Link>
  )
}

export function AppSidebar() {
  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="border-b border-sidebar-border px-5 py-5">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          文岚书法
        </p>
        <h1 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
          工作室管理
        </h1>
      </div>

      <nav className="flex flex-1 flex-col gap-6 p-4">
        <div className="space-y-1">
          <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">
            学员
          </p>
          <div className="space-y-0.5">
            {STUDENTS_NAV.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">
            签到
          </p>
          <div className="space-y-0.5">
            {ATTENDANCE_NAV.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </div>
      </nav>
    </aside>
  )
}
