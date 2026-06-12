import { useCallback } from "react"
import { Link } from "react-router"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { buildLeaderboardPath } from "@/lib/leaderboard-helpers"
import { useGameGroupSpans, PlayerCell } from "@/lib/home-table-helpers"
import { gameShortName } from "@/lib/game-name"
import { MobileListRow } from "@/components/common/mobile-list-row"
import { useIsMobile } from "@/hooks/useIsMobile"
import type React from "react"
import type { LatestRun } from "@/types/api"

type LatestRunsProps = {
    title: string
    data: LatestRun[]
}

export const LatestRuns: React.FC<LatestRunsProps> = ({ title, data }) => {
    const getGameKey = useCallback(
        (run: LatestRun) => run.game_slug,
        [],
    )
    const { gameSpans, hoveredGroup, setHoveredGroup } =
        useGameGroupSpans(data, getGameKey)
    const isMobile = useIsMobile()

    return (
        <div className="flex-1 min-w-0 rounded-lg p-3 md:p-4 flex flex-col">
            <h1 className="text-xl font-semibold mb-4">
                {title}
            </h1>
            {isMobile ? (
                <div className="flex flex-col gap-2">
                    {data.map((run, i) => {
                        const fullName = run.level?.name ?? run.category.name
                        return (
                            <div key={run.id} className="flex flex-col gap-2">
                                {gameSpans[i]?.show && (
                                    <Link
                                        to={`/${run.game_slug}`}
                                        className="px-1 pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                                    >
                                        {gameShortName(run.game_slug)}
                                    </Link>
                                )}
                                <MobileListRow
                                    title={
                                        <Link
                                            to={run.level
                                                ? `/${run.game_slug}/ils/${run.level.slug}/${run.category.slug}`
                                                : buildLeaderboardPath(
                                                    run.game_slug,
                                                    run.category.slug,
                                                    run.value_slugs,
                                                )}
                                            title={fullName}
                                            className="text-link hover:underline truncate"
                                        >
                                            {fullName}
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
                                />
                            </div>
                        )
                    })}
                </div>
            ) : (
                <Table
                    containerClassName="overflow-x-hidden"
                    className="table-fixed [&_th]:h-8 [&_th]:px-1.5 [&_td]:px-1.5 [&_td]:py-1.5"
                >
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[20%]">Game</TableHead>
                        <TableHead className="w-[25%]">Category</TableHead>
                        <TableHead className="w-[30%]">Player</TableHead>
                        <TableHead className="w-[25%]">Time</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody onMouseLeave={() => setHoveredGroup(null)}>
                    {data.map((run, i) => (
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
                                        to={`/${run.game_slug}`}
                                        className="hover:underline"
                                    >
                                        {gameShortName(run.game_slug)}
                                    </Link>
                                </TableCell>
                            )}
                            <TableCell>
                                {(() => {
                                    const fullName = run.level?.name ?? run.category.name
                                    return (
                                        <Link
                                            to={run.level
                                                ? `/${run.game_slug}/ils/${run.level.slug}/${run.category.slug}`
                                                : buildLeaderboardPath(
                                                    run.game_slug,
                                                    run.category.slug,
                                                    run.value_slugs,
                                                )
                                            }
                                            title={fullName}
                                            className="block truncate text-link hover:underline"
                                        >
                                            {fullName}
                                        </Link>
                                    )
                                })()}
                            </TableCell>
                            <TableCell className="flex items-center min-w-0 overflow-hidden">
                                <PlayerCell players={run.players} compact />
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
                        </TableRow>
                    ))}
                </TableBody>
                </Table>
            )}
        </div>
    )
}
