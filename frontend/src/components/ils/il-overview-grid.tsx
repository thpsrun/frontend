import { Link } from "react-router"

import { Panel } from "@/components/ui/panel"
import { cn } from "@/lib/utils"

import {
    getRankBackground,
    RunPlayers,
    SkeletonRow,
} from "@/lib/leaderboard-helpers"

import type {
    ILOverviewLevel,
    LbsRun,
} from "@/types/api"


interface ILOverviewGridProps {
    gameSlug: string
    levels: ILOverviewLevel[]
    isLoading: boolean
    error: Error | null
    categorySlug: string
    valueSlugs: string[]
    multipleCategories: boolean
}

export const ILOverviewGrid = ({
    gameSlug,
    levels,
    isLoading,
    error,
    categorySlug,
    valueSlugs,
    multipleCategories,
}: ILOverviewGridProps) => {
    if (isLoading) {
        return (
            <div className={cn(
                "grid grid-cols-1 md:grid-cols-2",
                "gap-4",
            )}>
                {[...Array(6)].map((_, i) => (
                    <Panel
                        key={i}
                        className="space-y-3 animate-pulse shadow-none backdrop-blur-none"
                    >
                        <div className="h-5 rounded bg-muted/30 w-2/3" />
                        <div className="space-y-2">
                            {[...Array(5)].map(
                                (_, j) => (
                                    <SkeletonRow
                                        key={j}
                                    />
                                ),
                            )}
                        </div>
                    </Panel>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className={cn(
                "text-sm text-red-500",
                "p-4 border",
                "border-red-500/20 rounded",
            )}>
                Error Loading ILs...
            </div>
        )
    }

    if (levels.length === 0) {
        return (
            <div className={cn(
                "text-sm text-muted-foreground",
                "p-4 border border-dashed",
                "border-border/40 rounded",
            )}>
                No ILs Found...
            </div>
        )
    }

    return (
        <div className={cn(
            "grid grid-cols-1 md:grid-cols-2",
            "gap-4",
        )}>
            {levels.map((level) => {
                const matchedCat = categorySlug
                    ? level.categories.find(
                        (c) => c.slug === categorySlug,
                    )
                    : level.categories[0]
                const runs = matchedCat?.runs ?? []

                const linkParts = [
                    gameSlug,
                    "ils",
                    level.slug,
                    ...(categorySlug
                        ? [categorySlug, ...valueSlugs]
                        : []),
                ]
                const linkTo =
                    `/${linkParts.join("/")}`

                return (
                    <Link
                        key={level.slug}
                        to={linkTo}
                        className={cn(
                            "rounded-lg border",
                            "border-border/40",
                            "bg-background/70",
                            "backdrop-blur-sm",
                            "shadow-sm",
                            "hover:border-border/60",
                            "hover:bg-background/90",
                            "transition",
                            "overflow-hidden",
                        )}
                    >
                        <div className={cn(
                            "px-4 pt-4 pb-2",
                            "border-b",
                            "border-border/40",
                        )}>
                            <h3 className={cn(
                                "text-sm",
                                "font-semibold",
                                "text-white",
                            )}>
                                {level.name}
                            </h3>
                            {matchedCat
                                && multipleCategories && (
                                <span className={cn(
                                    "text-[10px]",
                                    "text-muted-foreground",
                                )}>
                                    {matchedCat.name}
                                </span>
                            )}
                        </div>
                        <div className="p-4">
                            {runs.length === 0 ? (
                                <div className={cn(
                                    "text-xs",
                                    "text-muted-foreground",
                                )}>
                                    No Runs Yet...
                                </div>
                            ) : (
                                <table className={cn(
                                    "w-full",
                                    "text-xs",
                                )}>
                                    <thead>
                                        <tr className="text-muted-foreground">
                                            <th className="text-left w-8 pb-1">
                                                #
                                            </th>
                                            <th className="text-left pb-1">
                                                Player
                                            </th>
                                            <th className="text-right pb-1">
                                                Time
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {runs.map(
                                            (r, i) => (
                                            <ILCardRow
                                                key={
                                                    r.id
                                                }
                                                run={r}
                                                idx={i}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}

const ILCardRow = (
    { run, idx }: { run: LbsRun; idx: number },
) => {
    const rank = run.place > 0
        ? run.place
        : idx + 1
    const player = run.players[0]

    return (
        <tr className={cn(
            idx % 2 === 1 ? "bg-muted/10" : "",
        )}>
            <td className="py-0.5">
                <span className={cn(
                    "inline-flex items-center",
                    "justify-center",
                    "w-5 h-5 rounded-full",
                    "text-[10px] font-semibold",
                    getRankBackground(rank),
                )}>
                    {rank}
                </span>
            </td>
            <td className="py-0.5">
                <RunPlayers
                    players={player ? [player] : []}
                    asLink={false}
                />
            </td>
            <td className={cn(
                "py-0.5 text-right",
                "font-mono tabular-nums",
            )}>
                {run.times.p_time}
            </td>
        </tr>
    )
}
