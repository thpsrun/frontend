import { useMemo, useState } from "react"

import { EmptyState } from "@/components/common/empty-state"
import { Trophy } from "lucide-react"
import { MobileListRow, RankBadge } from "@/components/common/mobile-list-row"
import { Panel } from "@/components/ui/panel"
import { RunPlayers } from "@/lib/leaderboard-helpers"
import { cn } from "@/lib/utils"
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

interface RankingsMobileListProps {
    entries: RankingsEntry[]
    metrics?: RankingsMetric[]
    defaultSort?: RankingsMetric
}

export const RankingsMobileList = ({
    entries,
    metrics = ["total", "fg", "il"],
    defaultSort,
}: RankingsMobileListProps) => {
    const initialSort = defaultSort ?? metrics[0] ?? "total"
    const [sortKey, setSortKey] = useState<RankingsMetric>(initialSort)

    const sorted = useMemo(() => {
        if (sortKey === "total") return entries
        const field = METRIC_FIELD[sortKey]
        return [...entries].sort(
            (a, b) => (b[field] as number) - (a[field] as number),
        )
    }, [entries, sortKey])

    if (entries.length === 0) {
        return <EmptyState inset icon={Trophy} title="No rankings found." />
    }

    const otherMetrics = metrics.filter((m) => m !== sortKey)

    return (
        <Panel className="flex flex-col gap-3 p-3">
            {metrics.length > 1 && (
                <div className="flex gap-1 rounded-md bg-muted/20 p-1">
                    {metrics.map((m) => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => setSortKey(m)}
                            className={cn(
                                "flex-1 rounded-sm px-2 py-1.5 text-xs transition",
                                sortKey === m
                                    ? "bg-background font-semibold shadow"
                                    : "text-muted-foreground",
                            )}
                        >
                            {METRIC_LABEL[m]}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex flex-col gap-2">
                {sorted.map((entry, idx) => {
                    const displayRank = sortKey === "total" ? entry.rank : idx + 1
                    const points = entry[METRIC_FIELD[sortKey]] as number
                    return (
                        <MobileListRow
                            key={entry.player.name ?? idx}
                            leading={<RankBadge rank={displayRank} />}
                            title={<RunPlayers players={[entry.player]} />}
                            trailing={<span className="font-mono">{points.toLocaleString()}</span>}
                            trailingSub={METRIC_LABEL[sortKey]}
                            expandable={
                                <div className="flex flex-wrap gap-x-4 gap-y-1">
                                    {otherMetrics.map((m) => (
                                        <span key={m}>
                                            {METRIC_LABEL[m]}{" "}
                                            <span className="font-mono text-foreground">
                                                {(entry[METRIC_FIELD[m]] as number).toLocaleString()}
                                            </span>
                                        </span>
                                    ))}
                                </div>
                            }
                        />
                    )
                })}
            </div>
        </Panel>
    )
}
