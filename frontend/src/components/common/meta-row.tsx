import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface Props {
    label: ReactNode
    children: ReactNode
    dense?: boolean
    className?: string
}

export function MetaRow({ label, children, dense, className }: Props) {
    return (
        <div className={cn(
            "flex justify-between",
            dense
                ? "items-baseline gap-3"
                : "items-center gap-4 py-2 border-b border-border/30 last:border-b-0",
            className,
        )}>
            <span className={cn(
                "text-muted-foreground",
                dense ? "text-xs" : "text-sm",
            )}>
                {label}
            </span>
            <div className="text-sm font-medium text-right break-all">
                {children}
            </div>
        </div>
    )
}
