/**
 * 路由切换时的页面骨架，与 PageShell 布局对齐
 */

function SkeletonBar({
  className,
}: {
  className?: string
}) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted/80 ${className ?? ""}`}
    />
  )
}

export function PageLoadingSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-6 md:p-8">
      <div className="space-y-2">
        <SkeletonBar className="h-8 w-40" />
        <SkeletonBar className="h-4 w-64" />
      </div>

      <SkeletonBar className="h-24 w-full rounded-xl" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SkeletonBar className="h-24 rounded-xl" />
        <SkeletonBar className="h-24 rounded-xl" />
        <SkeletonBar className="h-24 rounded-xl" />
      </div>

      <SkeletonBar className="h-64 w-full rounded-xl" />
    </div>
  )
}
