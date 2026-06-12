import { useState } from "react"
import type { ReactNode } from "react"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { getRankBackground } from "@/lib/leaderboard-helpers"

export const RankBadge = ({ rank }: { rank: number }) => (
    <div
        className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full shrink-0",
            "text-xs font-semibold",
            getRankBackground(rank),
        )}
    >
        {rank}
    </div>
)

interface MobileListRowProps {
    leading?: ReactNode
    title: ReactNode
    subtitle?: ReactNode
    trailing?: ReactNode
    trailingSub?: ReactNode
    expandable?: ReactNode
    className?: string
}

export const MobileListRow = ({
    leading,
    title,
    subtitle,
    trailing,
    trailingSub,
    expandable,
    className,
}: MobileListRowProps) => {
    const [open, setOpen] = useState(false)
    const canExpand = expandable != null

    return (
        <div className={cn("rounded-xl border border-border/60 bg-card/60", className)}>
            <div
                role={canExpand ? "button" : undefined}
                tabIndex={canExpand ? 0 : undefined}
                aria-expanded={canExpand ? open : undefined}
                onClick={canExpand ? () => setOpen((v) => !v) : undefined}
                onKeyDown={
                    canExpand
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault()
                                setOpen((v) => !v)
                            }
                        }
                        : undefined
                }
                className={cn(
                    "flex items-center gap-3 px-3 py-2.5 min-h-12",
                    canExpand && "cursor-pointer select-none",
                )}
            >
                {leading}
                <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate flex items-center gap-1.5">
                        {title}
                    </div>
                    {subtitle && (
                        <div className="text-xs text-muted-foreground truncate">{subtitle}</div>
                    )}
                </div>
                {(trailing || trailingSub) && (
                    <div className="text-right shrink-0">
                        {trailing && (
                            <div className="text-sm font-semibold tabular-nums">{trailing}</div>
                        )}
                        {trailingSub && (
                            <div className="text-[10px] text-muted-foreground">{trailingSub}</div>
                        )}
                    </div>
                )}
                {canExpand && (
                    <ChevronRight
                        className={cn(
                            "size-4 shrink-0 text-muted-foreground transition-transform",
                            open && "rotate-90",
                        )}
                    />
                )}
            </div>
            {canExpand && open && (
                <div className="border-t border-border/40 px-3 py-2.5 text-xs text-muted-foreground">
                    {expandable}
                </div>
            )}
        </div>
    )
}
