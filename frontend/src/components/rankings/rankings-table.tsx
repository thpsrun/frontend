import { useMemo, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table"
import { Panel } from "@/components/ui/panel"

import { cn } from "@/lib/utils"
import {
    getRankBackground,
    RunPlayers,
} from "@/lib/leaderboard-helpers"

import type { RankingsEntry } from "@/types/api"


type RankingsMetric = "total" | "fg" | "il"

const METRIC_FIELD: Record<RankingsMetric, keyof RankingsEntry> = {
    total: "total_points",
    fg: "fg_points",
    il: "il_points",
}

const METRIC_LABEL: Record<RankingsMetric, string> = {
    total: "Total",
    fg: "Full-Game",
    il: "Individual Levels",
}

interface RankingsTableProps {
    entries: RankingsEntry[]
    metrics?: RankingsMetric[]
    defaultSort?: RankingsMetric
}

export const RankingsTable = (
    {
        entries,
        metrics = ["total", "fg", "il"],
        defaultSort,
    }: RankingsTableProps,
) => {
    const initialSort = defaultSort ?? metrics[0] ?? "total"
    const [sortKey, setSortKey] = useState<RankingsMetric>(initialSort)
    const sortable = metrics.length > 1

    const sorted = useMemo(() => {
        if (sortKey === "total") return entries
        const field = METRIC_FIELD[sortKey]
        return [...entries].sort(
            (a, b) => (b[field] as number) - (a[field] as number),
        )
    }, [entries, sortKey])

    if (entries.length === 0) {
        return (
            <Panel className="text-sm text-muted-foreground">
                No rankings found.
            </Panel>
        )
    }

    return (
        <Panel className="p-0 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/20">
                        <TableHead className="w-16 pl-4">
                            #
                        </TableHead>
                        <TableHead>
                            Player
                        </TableHead>
                        {metrics.map((m) => (
                            <MetricHeader
                                key={m}
                                metric={m}
                                active={sortKey}
                                sortable={sortable}
                                onSelect={setSortKey}
                            />
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sorted.map((entry, idx) => {
                        const displayRank = sortKey === "total"
                            ? entry.rank
                            : idx + 1
                        return (
                            <RankingsRow
                                key={entry.player.name}
                                entry={entry}
                                metrics={metrics}
                                emphasize={sortKey}
                                displayRank={displayRank}
                                idx={idx}
                            />
                        )
                    })}
                </TableBody>
            </Table>
        </Panel>
    )
}


interface MetricHeaderProps {
    metric: RankingsMetric
    active: RankingsMetric
    sortable: boolean
    onSelect: (m: RankingsMetric) => void
}

const MetricHeader = (
    { metric, active, sortable, onSelect }: MetricHeaderProps,
) => {
    const isActive = active === metric
    if (!sortable) {
        return (
            <TableHead className="text-center">
                {METRIC_LABEL[metric]}
            </TableHead>
        )
    }
    return (
        <TableHead className="text-center">
            <button
                type="button"
                onClick={() => onSelect(metric)}
                className={cn(
                    "inline-flex items-center justify-center gap-1",
                    "w-full select-none cursor-pointer",
                    "hover:text-foreground transition",
                    isActive
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground",
                )}
            >
                {METRIC_LABEL[metric]}
                {isActive ? (
                    <ChevronDown size={12} />
                ) : (
                    <ChevronUp size={12} className="opacity-30" />
                )}
            </button>
        </TableHead>
    )
}


interface RankingsRowProps {
    entry: RankingsEntry
    metrics: RankingsMetric[]
    emphasize: RankingsMetric
    displayRank: number
    idx: number
}

const RankingsRow = (
    { entry, metrics, emphasize, displayRank, idx }: RankingsRowProps,
) => {
    return (
        <TableRow className={cn(
            "transition hover:bg-muted/30",
            idx % 2 === 1 ? "bg-muted/10" : "",
        )}>
            <TableCell className="pl-4 w-16">
                <div className={cn(
                    "flex items-center justify-center",
                    "w-8 h-8 rounded-full text-center",
                    "text-xs font-semibold",
                    getRankBackground(displayRank),
                )}>
                    {displayRank}
                </div>
            </TableCell>
            <TableCell className="text-sm">
                <RunPlayers players={[entry.player]} />
            </TableCell>
            {metrics.map((m) => (
                <PointsCell
                    key={m}
                    points={entry[METRIC_FIELD[m]] as number}
                    emphasized={emphasize === m}
                />
            ))}
        </TableRow>
    )
}


const PointsCell = (
    { points, emphasized }: { points: number; emphasized: boolean },
) => (
    <TableCell className={cn(
        "text-center font-mono tabular-nums tracking-tight text-sm",
        emphasized
            ? "text-foreground font-semibold"
            : "text-muted-foreground",
    )}>
        {points.toLocaleString()}
    </TableCell>
)
