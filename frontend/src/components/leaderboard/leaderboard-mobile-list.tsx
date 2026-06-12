import { Trophy } from "lucide-react"

import { EmptyState } from "@/components/common/empty-state"
import { MobileListRow, RankBadge } from "@/components/common/mobile-list-row"
import {
    RunPlayers,
    StreakDagger,
    formatLongDate,
} from "@/lib/leaderboard-helpers"
import {
    timeForMethod,
    timeSecsForMethod,
} from "@/lib/timing-inheritance"
import type { LbsRun } from "@/types/api"
import type { TimingMethodType } from "@/types/shared"
import { ALL_TIMING_METHODS } from "@/types/shared"

const METHOD_LABEL: Record<TimingMethodType, string> = {
    rta: "RTA",
    lrt: "LRT",
    igt: "IGT",
}

interface LeaderboardMobileListProps {
    runs: LbsRun[]
    expectedPlayers?: number
    requiredMethods: TimingMethodType[]
    primaryMethod: TimingMethodType
}

export const LeaderboardMobileList = ({
    runs,
    expectedPlayers,
    requiredMethods,
    primaryMethod,
}: LeaderboardMobileListProps) => {
    if (runs.length === 0) {
        return <EmptyState inset icon={Trophy} title="No Runs Yet" />
    }

    const methodColumns = ALL_TIMING_METHODS.filter((m) => requiredMethods.includes(m))
    const secondaryMethods = methodColumns.filter((m) => m !== primaryMethod)

    return (
        <div className="flex flex-col gap-2">
            {runs.map((r, idx) => {
                const rank = r.place > 0 ? r.place : idx + 1
                const primaryTime = timeForMethod(r.times, primaryMethod)
                const primarySecs = timeSecsForMethod(r.times, primaryMethod)
                const hasPrimary = primarySecs != null && primarySecs > 0

                // Each row is always expandable: line 1 = secondary timing
                // methods (when present), line 2 = the exact date set, line 3 =
                // video links (when present).
                const expandable = (
                    <div className="flex flex-col gap-1.5">
                        {secondaryMethods.length > 0 && (
                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                                {secondaryMethods.map((m) => {
                                    const t = timeForMethod(r.times, m)
                                    const s = timeSecsForMethod(r.times, m)
                                    return (
                                        <span key={m}>
                                            {METHOD_LABEL[m]}{" "}
                                            <span className="font-mono text-foreground">
                                                {s != null && s > 0 && t ? t : "-"}
                                            </span>
                                        </span>
                                    )
                                })}
                            </div>
                        )}
                        <div>
                            Set{" "}
                            <span className="text-foreground">{formatLongDate(r.date)}</span>
                        </div>
                        {(r.video || r.arch_video) && (
                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                                {r.video && (
                                    <a
                                        href={r.video}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-link"
                                    >
                                        Watch ▶
                                    </a>
                                )}
                                {r.arch_video && (
                                    <a
                                        href={r.arch_video}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-link"
                                    >
                                        Archive ▶
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                )

                return (
                    <MobileListRow
                        key={r.id}
                        leading={<RankBadge rank={rank} />}
                        title={<RunPlayers players={r.players} expectedPlayers={expectedPlayers} />}
                        subtitle={
                            <span>
                                {r.points > 0 ? r.points : "-"}
                                <StreakDagger points={r.points} isIl={r.level !== null} /> pts
                            </span>
                        }
                        trailing={
                            hasPrimary && r.url ? (
                                <a
                                    href={r.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-link font-mono"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {primaryTime}
                                </a>
                            ) : (
                                <span className="font-mono">
                                    {hasPrimary && primaryTime ? primaryTime : "-"}
                                </span>
                            )
                        }
                        trailingSub={METHOD_LABEL[primaryMethod]}
                        expandable={expandable}
                    />
                )
            })}
        </div>
    )
}
