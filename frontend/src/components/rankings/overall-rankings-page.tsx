import { cn } from "@/lib/utils"
import { Panel } from "@/components/ui/panel"
import { SkeletonRow } from "@/lib/leaderboard-helpers"
import { useOverallRankings } from "@/hooks/leaderboard/useOverallRankings"
import { RankingsTable } from "@/components/rankings/rankings-table"


export const OverallRankingsPage = () => {
    const { data, isLoading, error } = useOverallRankings()

    return (
        <div className="w-full flex flex-col gap-4">
            <Panel>
                <h1 className="text-2xl font-bold mb-1">
                    Overall Rankings
                </h1>
                <p className="text-sm text-muted-foreground">
                    Combined point totals across every THPS game.
                    Only verified, non-obsolete runs count.
                </p>
            </Panel>

            {isLoading && (
                <Panel className="space-y-2">
                    {[...Array(10)].map((_, i) => (
                        <SkeletonRow key={i} />
                    ))}
                </Panel>
            )}

            {error && !isLoading && (
                <Panel className={cn(
                    "text-sm text-red-500 border-red-500/20",
                )}>
                    Error Loading Rankings...
                </Panel>
            )}

            {data && !isLoading && !error && (
                <RankingsTable entries={data} defaultSort="total" />
            )}
        </div>
    )
}
