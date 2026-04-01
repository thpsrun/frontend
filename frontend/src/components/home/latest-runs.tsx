import { useCallback } from "react"
import { Link } from "react-router"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { buildLeaderboardPath } from "@/lib/leaderboard-helpers"
import { useGameGroupSpans, PlayerCell } from "@/lib/home-table-helpers"
import type React from "react"
import type { LatestRun } from "@/types/api"

// Display name overrides for THPS remake slugs (e.g. thps12 -> THPS1+2)
const DISPLAY_NAME_OVERRIDES: Record<string, string> = {
    "thps12": "THPS1+2",
    "thps12ce": "THPS1+2CE",
    "thps34": "THPS3+4",
    "thps34ce": "THPS3+4CE",
}

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

    return (
        <div className="flex-1 rounded-lg p-6 flex flex-col">
            <h1 className="text-xl font-semibold mb-4">
                {title}
            </h1>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-25">Game</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="w-75">Player</TableHead>
                        <TableHead>Time</TableHead>
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
                                        {DISPLAY_NAME_OVERRIDES[run.game_slug]
                                            ?? run.game_slug.toUpperCase()}
                                    </Link>
                                </TableCell>
                            )}
                            <TableCell>
                                <Link
                                    to={run.level
                                        ? `/${run.game_slug}/ils/${run.level.slug}/${run.category.slug}`
                                        : buildLeaderboardPath(
                                            run.game_slug,
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
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
