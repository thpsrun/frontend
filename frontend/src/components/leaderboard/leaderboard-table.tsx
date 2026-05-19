import { Link } from "react-router"
import {
    FaTwitch,
    FaYoutube,
} from "react-icons/fa"
import { Cloud, Play, Trophy } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table"

import { cn } from "@/lib/utils"

import {
    getRankBackground,
    RunPlayers,
    StreakDagger,
    timeAgo,
    formatLongDate,
} from "@/lib/leaderboard-helpers"

import {
    timeForMethod,
    timeSecsForMethod,
} from "@/lib/timing-inheritance"

import type {
    LbsRun,
    LbsRecentRun,
} from "@/types/api"
import type { TimingMethodType } from "@/types/shared"
import { ALL_TIMING_METHODS } from "@/types/shared"

const METHOD_COLUMN_LABEL: Record<TimingMethodType, string> = {
    rta: "RTA",
    lrt: "LRT",
    igt: "IGT",
}


export const LeaderboardTable = (
    {
        runs,
        expectedPlayers,
        requiredMethods,
        primaryMethod,
    }: {
        runs: LbsRun[];
        expectedPlayers?: number;
        requiredMethods: TimingMethodType[];
        primaryMethod: TimingMethodType;
    },
) => {
    if (runs.length === 0) {
        return (
            <EmptyState
                inset
                icon={Trophy}
                title="No Runs Yet??"
            />
        )
    }

    const methodColumns = ALL_TIMING_METHODS.filter(
        (m) => requiredMethods.includes(m),
    )

    return (
        <div className={cn(
            "rounded-md border",
            "border-border/40 overflow-hidden",
        )}>
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/20">
                        <TableHead className="w-16 pl-4">
                            #
                        </TableHead>
                        <TableHead className="w-40">
                            Player
                        </TableHead>
                        {methodColumns.map((method) => (
                            <TableHead
                                key={method}
                                className={cn(
                                    "text-center whitespace-nowrap",
                                    method === primaryMethod
                                        ? "text-foreground font-semibold"
                                        : "text-muted-foreground/70 font-normal",
                                )}
                            >
                                {METHOD_COLUMN_LABEL[method]}
                            </TableHead>
                        ))}
                        <TableHead className="text-center">
                            Points
                        </TableHead>
                        <TableHead className="text-center">
                            Date
                        </TableHead>
                        <TableHead className="text-center">
                            Video
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {runs.map((r, idx) => (
                        <LeaderboardRow
                            key={r.id}
                            run={r}
                            idx={idx}
                            expectedPlayers={
                                expectedPlayers
                            }
                            methodColumns={methodColumns}
                            primaryMethod={primaryMethod}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}


const LeaderboardRow = (
    {
        run: r,
        idx,
        expectedPlayers,
        methodColumns,
        primaryMethod,
    }: {
        run: LbsRun;
        idx: number;
        expectedPlayers?: number;
        methodColumns: TimingMethodType[];
        primaryMethod: TimingMethodType;
    },
) => {
    // place = 0 means unranked/obsolete; fall back to table position
    const rank = r.place > 0 ? r.place : idx + 1

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
                    getRankBackground(rank),
                )}>
                    {rank}
                </div>
            </TableCell>
            <TableCell className="text-sm">
                <RunPlayers
                    players={r.players}
                    expectedPlayers={expectedPlayers}
                />
            </TableCell>
            {methodColumns.map((method) => {
                const isPrimary = method === primaryMethod
                const timeValue = timeForMethod(r.times, method)
                const timeSecs = timeSecsForMethod(r.times, method)
                const hasTime = timeSecs != null && timeSecs > 0
                const display = hasTime && timeValue ? timeValue : "-"
                const linkUrl = hasTime && isPrimary ? r.url : null
                return (
                    <TableCell
                        key={method}
                        className={cn(
                            "text-center font-mono",
                            "tabular-nums tracking-tight",
                            "text-sm whitespace-nowrap",
                            isPrimary
                                ? "text-foreground"
                                : "text-muted-foreground/60",
                        )}
                    >
                        {linkUrl ? (
                            <a
                                href={linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    "text-link",
                                    "hover:underline",
                                )}
                            >
                                {display}
                            </a>
                        ) : (
                            display
                        )}
                    </TableCell>
                )
            })}
            <TableCell className={cn(
                "text-center font-mono",
                "tabular-nums tracking-tight",
                "text-sm",
            )}>
                {r.points > 0 ? r.points : "-"}
                <StreakDagger points={r.points} isIl={r.level !== null} />
            </TableCell>
            <TableCell className="text-center text-xs">
                <span
                    title={formatLongDate(r.date)}
                    className="cursor-help"
                >
                    {timeAgo(r.date)}
                </span>
            </TableCell>
            <TableCell className="text-center">
                <div className={cn(
                    "inline-flex items-center",
                    "justify-center gap-0.5",
                )}>
                    {r.video ? (
                        <a
                            href={r.video}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "inline-flex items-center",
                                "justify-center",
                                "h-6 w-6 rounded",
                                "hover:bg-muted/40",
                            )}
                        >
                            {r.video.includes("youtube.com")
                            || r.video.includes(
                                "youtu.be",
                            ) ? (
                                <FaYoutube size={14} />
                            ) : r.video.includes(
                                "twitch.tv",
                            ) ? (
                                <FaTwitch size={14} />
                            ) : (
                                <Play size={14} />
                            )}
                        </a>
                    ) : (
                        <span className={cn(
                            "text-muted-foreground/50",
                            "text-xs",
                        )}>
                            -
                        </span>
                    )}
                    {r.arch_video && (
                        <a
                            href={r.arch_video}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "inline-flex items-center",
                                "justify-center",
                                "h-6 w-6 rounded",
                                "hover:bg-muted/40",
                                "text-muted-foreground",
                            )}
                            title="Archive Video"
                        >
                            <Cloud size={14} />
                        </a>
                    )}
                </div>
            </TableCell>
        </TableRow>
    )
}


interface RecentRunItemProps {
    run: LbsRecentRun
    leaderboardUrl?: string
}

export const RecentRunItem = ({
    run: r,
    leaderboardUrl,
}: RecentRunItemProps) => {
    // IL runs: "Level: {name}", full-game runs: subcategory
    const label = r.level
        ? `Level: ${r.level}`
        : r.subcategory

    return (
        <div className={cn(
            "flex flex-col gap-0.5",
            "text-xs border-b border-border/20",
            "pb-2 last:border-0 last:pb-0",
        )}>
            <div className="text-muted-foreground truncate">
                {leaderboardUrl ? (
                    <Link
                        to={leaderboardUrl}
                        className={cn(
                            "text-link",
                            "hover:underline",
                        )}
                    >
                        {label}
                    </Link>
                ) : label}
            </div>
            <div className="flex items-center gap-1">
                <span className={cn(
                    "font-semibold",
                    r.place <= 3
                        ? "text-yellow-400"
                        : "",
                )}>
                    #{r.place}
                </span>
                <RunPlayers players={r.players} />
            </div>
            <div className={cn(
                "flex justify-between items-center",
                "text-muted-foreground",
            )}>
                <div className="flex items-center gap-1">
                    {r.p_time_secs > 0 ? (
                        r.url ? (
                            <a
                                href={r.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    "font-mono",
                                    "text-link",
                                    "hover:underline",
                                )}
                            >
                                {r.p_time}
                            </a>
                        ) : (
                            <span className="font-mono">
                                {r.p_time}
                            </span>
                        )
                    ) : (
                        <span className="font-mono">-</span>
                    )}
                    {r.video && (
                        <a
                            href={r.video}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "inline-flex items-center",
                                "justify-center",
                                "h-5 w-5 rounded",
                                "hover:bg-muted/40",
                            )}
                        >
                            {r.video.includes("youtube.com")
                            || r.video.includes(
                                "youtu.be",
                            ) ? (
                                <FaYoutube size={11} />
                            ) : r.video.includes(
                                "twitch.tv",
                            ) ? (
                                <FaTwitch size={11} />
                            ) : (
                                <Play size={11} />
                            )}
                        </a>
                    )}
                    {r.arch_video && (
                        <a
                            href={r.arch_video}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "inline-flex items-center",
                                "justify-center",
                                "h-5 w-5 rounded",
                                "hover:bg-muted/40",
                                "text-muted-foreground",
                            )}
                            title="Archive Video"
                        >
                            <Cloud size={11} />
                        </a>
                    )}
                </div>
                <span
                    title={formatLongDate(r.v_date)}
                    className="cursor-help"
                >
                    {timeAgo(r.v_date)}
                </span>
            </div>
        </div>
    )
}
