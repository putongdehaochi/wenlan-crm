import { AppShell } from "@/shared/components/app-shell"

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AppShell>{children}</AppShell>
}
