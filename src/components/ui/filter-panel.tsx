import * as React from "react"
import { cn } from "@/lib/utils"

interface FilterPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function FilterPanel({ children, className, ...props }: FilterPanelProps) {
  return (
    <div 
      className={cn(
        "flex flex-wrap items-center gap-3 mb-4 bg-slate-100 p-3 rounded-lg border border-slate-300 text-sm shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface FilterItemProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  children: React.ReactNode
}

export function FilterItem({ label, children, className, ...props }: FilterItemProps) {
  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      {label && <div className="font-bold text-slate-700">{label}</div>}
      {children}
    </div>
  )
}
