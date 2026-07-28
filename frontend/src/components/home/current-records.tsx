import { useCallback } from "react"
import { Link } from "react-router"
import { Trophy } from "lucide-react"
import { useTHPSRuns } from "@/hooks/home/useTHPSData"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { buildLeaderboardPath, formatLongDate } from "@/lib/leaderboard-helpers"
import { useGameGroupSpans, PlayerCell } from "@/lib/home-table-helpers"
import { EmptyState } from "@/components/common/empty-state"
import { MobileListRow } from "@/components/common/mobile-list-row"
import { QueryErrorBanner } from "@/components/common/query-error-banner"
import { TableSkeleton } from "@/components/common/table-skeleton"
import { useIsMobile } from "@/hooks/useIsMobile"
import type { RecordRun } from "@/types/api"

export const CurrentRecords = () => {
    const { data: runs, isLoading, error, refetch } = useTHPSRuns()

    const getGameKey = useCallback(
        (run: RecordRun) => run.game.slug,
        [],
    )
    const { gameSpans, hoveredGroup, setHoveredGroup } =
        useGameGroupSpans(runs, getGameKey)
    const isMobile = useIsMobile()

    return (
        <div className="flex-1 min-w-0 rounded-lg p-4 md:p-6 flex flex-col">
            <h2 className="text-xl font-semibold mb-4">
                Current Records
            </h2>
            {isLoading ? (
                <TableSkeleton
                    columns={isMobile ? 2 : 5}
                    rows={8}
                    headers={isMobile
                        ? undefined
                        : ["Game", "Category", "Player", "Time", "Date"]}
                />
            ) : error ? (
                <QueryErrorBanner error={error} onRetry={refetch} />
            ) : runs.length === 0 ? (
                <EmptyState inset icon={Trophy} title="No records yet." />
            ) : isMobile ? (
                <div className="flex flex-col gap-2">
                    {runs.map((run, i) => (
                        <div key={run.id} className="flex flex-col gap-2">
                            {gameSpans[i]?.show && (
                                <Link
                                    to={`/${run.game.slug}`}
                                    className="px-1 pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                                >
                                    {run.game.name}
                                </Link>
                            )}
                            <MobileListRow
                                title={
                                    <Link
                                        to={run.level
                                            ? `/${run.game.slug}/ils/${run.level.slug}/${run.category.slug}`
                                            : buildLeaderboardPath(
                                                run.game.slug,
                                                run.category.slug,
                                                run.value_slugs,
                                            )}
                                        className="text-link hover:underline truncate"
                                    >
                                        {run.level?.name ?? run.category.name}
                                    </Link>
                                }
                                subtitle={<PlayerCell players={run.players} compact />}
                                trailing={
                                    run.video ? (
                                        <a
                                            href={run.video}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-link font-mono"
                                        >
                                            {run.time}
                                        </a>
                                    ) : (
                                        <span className="font-mono">{run.time}</span>
                                    )
                                }
                                trailingSub={formatLongDate(run.date)}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <Table containerClassName="overflow-x-hidden">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-25">Game</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="w-50">Player</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody onMouseLeave={() => setHoveredGroup(null)}>
                    {runs.map((run, i) => (
                        <TableRow
                            key={run.id}
                            className={cn(
                                "hover:bg-transparent",
                                hoveredGroup === gameSpans[i]?.groupIndex
                                    && "[&>td]:bg-muted/50",
                                gameSpans[i]?.show && i > 0
                                    && "border-t-2 border-t-border",
                            )}
                            onMouseEnter={() =>
                                setHoveredGroup(
                                    gameSpans[i]?.groupIndex ?? null,
                                )
                            }
                        >
                            {gameSpans[i]?.show && (
                                <TableCell
                                    className={cn(
                                        "font-medium align-middle",
                                        hoveredGroup === gameSpans[i]?.groupIndex
                                            && "bg-muted/50",
                                    )}
                                    rowSpan={gameSpans[i].rowSpan}
                                >
                                    <Link
                                        to={`/${run.game.slug}`}
                                        className="hover:underline"
                                    >
                                        {run.game.name}
                                    </Link>
                                </TableCell>
                            )}
                            <TableCell>
                                <Link
                                    to={run.level
                                        ? `/${run.game.slug}/ils/${run.level.slug}/${run.category.slug}`
                                        : buildLeaderboardPath(
                                            run.game.slug,
                                            run.category.slug,
                                            run.value_slugs,
                                        )
                                    }
                                    className="text-link hover:underline"
                                >
                                    {run.level?.name ?? run.category.name}
                                </Link>
                            </TableCell>
                            <TableCell className="flex items-center">
                                <PlayerCell players={run.players} />
                            </TableCell>
                            <TableCell>
                                {run.video ? (
                                    <a
                                        href={run.video}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-link hover:underline"
                                    >
                                        {run.time}
                                    </a>
                                ) : (
                                    run.time
                                )}
                            </TableCell>
                            <TableCell>
                                {formatLongDate(run.date)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                </Table>
            )}
        </div>
    )
}
