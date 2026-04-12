import { Link } from "react-router"
import {
    FaTwitch,
    FaYoutube,
} from "react-icons/fa"
import { Cloud, Play } from "lucide-react"

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
    type CountryCode,
    getRankBackground,
    CountryFlag,
    timeAgo,
    formatLongDate,
} from "@/lib/leaderboard-helpers"

import type {
    LbsRun,
    LbsRecentRun,
} from "@/types/api"


export const LeaderboardTable = (
    { runs, expectedPlayers }: {
        runs: LbsRun[];
        expectedPlayers?: number;
    },
) => {
    if (runs.length === 0) {
        return (
            <div className={cn(
                "text-sm text-muted-foreground",
                "p-4 border border-dashed",
                "border-border/40 rounded",
            )}>
                No runs found.
            </div>
        )
    }

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
                        <TableHead className="text-center">
                            Time
                        </TableHead>
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
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}


const LeaderboardRow = (
    { run: r, idx, expectedPlayers }: {
        run: LbsRun;
        idx: number;
        expectedPlayers?: number;
    },
) => {
    // place <= 0 means unranked/obsolete; fall back to table position
    const rank = r.place > 0 ? r.place : idx + 1
    const firstPlayer = r.players[0] ?? null

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
                {firstPlayer?.country?.id && (
                    <CountryFlag
                        countryCode={
                            firstPlayer
                                .country.id as CountryCode
                        }
                        flagUrl={firstPlayer.country.flag}
                        title={firstPlayer.country.name}
                    />
                )}
                {r.players.length > 0 ? (
                    <>
                        {r.players.map((p, i) => (
                            <span key={p.name}>
                                {i > 0 && " & "}
                                <Link
                                    to={`/player/${p.name}`}
                                    className={cn(
                                        "text-link",
                                        "hover:underline",
                                    )}
                                >
                                    {p.name || "Anonymous"}
                                </Link>
                            </span>
                        ))}
                        {expectedPlayers
                            && r.players.length
                                < expectedPlayers
                            && " & Anonymous"}
                    </>
                ) : "Unknown"}
            </TableCell>
            <TableCell className={cn(
                "text-center font-mono",
                "tabular-nums tracking-tight",
                "text-sm",
            )}>
                {r.url ? (
                    <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            "text-link",
                            "hover:underline",
                        )}
                    >
                        {r.times.p_time}
                    </a>
                ) : r.times.p_time}
            </TableCell>
            <TableCell className={cn(
                "text-center font-mono",
                "tabular-nums tracking-tight",
                "text-sm",
            )}>
                {r.points}
                <StreakDagger run={r} />
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


// Base points awarded for a 1st-place run before streak bonuses
const FG_BASE_POINTS = 1000
const IL_BASE_POINTS = 250

const StreakDagger = ({ run }: { run: LbsRun }) => {
    const base = run.level === null
        ? FG_BASE_POINTS
        : IL_BASE_POINTS
    const bonus = run.points - base

    if (bonus <= 0) return null

    return (
        <sup
            className="text-[0.6em] text-muted-foreground cursor-help ml-0.5"
            title={`Streak Bonus: ${bonus} points`}
        >
            †
        </sup>
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
                {r.player_country?.id && (
                    <CountryFlag
                        countryCode={
                            r.player_country.id as CountryCode
                        }
                        flagUrl={r.player_country.flag}
                        title={r.player_country.name}
                    />
                )}
                <Link
                    to={`/player/${r.player_name}`}
                    className={cn(
                        "font-medium",
                        "text-link",
                        "hover:underline",
                    )}
                >
                    {r.player_name}
                </Link>
            </div>
            <div className={cn(
                "flex justify-between items-center",
                "text-muted-foreground",
            )}>
                <div className="flex items-center gap-1">
                    {r.url ? (
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
                            title="Archive video"
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
