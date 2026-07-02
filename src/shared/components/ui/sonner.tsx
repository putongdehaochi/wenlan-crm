"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "rounded-xl border border-border/80 bg-card text-card-foreground shadow-lg",
          title: "text-sm font-medium",
          description: "text-sm text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}
