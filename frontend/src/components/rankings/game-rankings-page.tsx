import { Link, Navigate, useParams } from "react-router"
import { ArrowLeft } from "lucide-react"

import { cn } from "@/lib/utils"
import { Panel } from "@/components/ui/panel"
import { SkeletonRow } from "@/lib/leaderboard-helpers"
import { ApiError } from "@/lib/api-client"
import { useGameRankings } from "@/hooks/leaderboard/useGameRankings"
import { useGames } from "@/hooks/game/useGames"
import { RankingsTable } from "@/components/rankings/rankings-table"
import { OldestRunsList } from "@/components/rankings/oldest-runs-list"
import { GAMES_WITH_OLDEST_RUNS } from "@/components/rankings/oldest-runs-config"


export const GameRankingsPage = () => {
    const { gameSlug = "" } = useParams<{ gameSlug: string }>()
    const showOldest = GAMES_WITH_OLDEST_RUNS.includes(gameSlug)

    const { data, isLoading, error } = useGameRankings({
        gameSlug,
        withOldest: showOldest,
    })

    const { data: games } = useGames()
    const game = games?.find((g) => g.slug === gameSlug)
    const gameName = game?.name ?? gameSlug.toUpperCase()

    if (error instanceof ApiError && error.status === 404) {
        return <Navigate to="/" replace />
    }

    const oldestRuns = data?.oldest_runs ?? []
    const showOldestColumn = showOldest && oldestRuns.length > 0

    return (
        <div className="w-full flex flex-col gap-4">
            <Panel className="flex items-start justify-between gap-4">
                <div>
                    <Link
                        to="/rankings"
                        className={cn(
                            "inline-flex items-center gap-1",
                            "text-xs text-muted-foreground",
                            "hover:text-foreground transition mb-2",
                        )}
                    >
                        <ArrowLeft size={12} />
                        Overall Rankings
                    </Link>
                    <h1 className="text-2xl font-bold mb-1">
                        {gameName} IL Rankings
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Players ranked by total individual-level
                        points for {gameName}.
                    </p>
                </div>
            </Panel>

            <div className={cn(
                "w-full flex flex-col lg:flex-row gap-4",
            )}>
                <div className={cn(
                    "flex flex-col gap-2",
                    showOldestColumn ? "lg:flex-2" : "flex-1",
                )}>
                    {isLoading && (
                        <Panel className="space-y-2">
                            {[...Array(10)].map((_, i) => (
                                <SkeletonRow key={i} />
                            ))}
                        </Panel>
                    )}

                    {error && !isLoading && (
                        <Panel
                            className={cn(
                                "text-sm text-red-500",
                                "border-red-500/20",
                            )}
                        >
                            Error Loading Rankings...
                        </Panel>
                    )}

                    {data && !isLoading && !error && (
                        <RankingsTable
                            entries={data.leaderboard}
                            metrics={["il"]}
                            defaultSort="il"
                        />
                    )}
                </div>

                {showOldestColumn && (
                    <div className="lg:flex-1">
                        <OldestRunsList runs={oldestRuns} />
                    </div>
                )}
            </div>
        </div>
    )
}
