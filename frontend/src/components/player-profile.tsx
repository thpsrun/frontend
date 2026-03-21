import { useMemo, useState } from "react"
import { Link, useParams } from "react-router"
import {
    FaTrophy,
    FaTwitch,
    FaYoutube,
    FaXTwitter,
    FaBluesky,
    FaDiscord,
} from "react-icons/fa6"
import { Play, User } from "lucide-react"
import * as flags from "country-flag-icons/react/3x2"

import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { usePlayerProfile, PlayerNotFoundError } from "@/hooks/usePlayerProfile"
import { useGames } from "@/hooks/useGames"
import { BACKEND_URL } from "@/constants"
import { cn } from "@/utils"

import type { PlayerRun, Game } from "@/types/api"


type SortMode = "latest" | "chronological"
type CountryCode = keyof typeof flags

const getRankBackground = (place: number) => {
    if (place === 1) return "bg-yellow-500/50"
    if (place === 2) return "bg-gray-300/50"
    if (place === 3) return "bg-orange-500/50"
    return "bg-gray-700"
}

const CountryFlag = ({ countryCode }: { countryCode: CountryCode }) => {
    const FlagIcon = flags[countryCode.toUpperCase() as CountryCode]
    if (!FlagIcon) return null
    return <FlagIcon className="w-7 pl-2 inline" />
}

function formatRelativeDate(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 30) return `${diffDays} Days Ago`

    const diffMonths = Math.floor(diffDays / 30.44)
    if (diffMonths < 12) {
        return diffMonths === 1 ? "1 Month Ago" : `${diffMonths} Months Ago`
    }

    const diffYears = Math.floor(diffDays / 365.25)
    return diffYears === 1 ? "1 Year Ago" : `${diffYears} Years Ago`
}

function groupRunsByGame(runs: PlayerRun[]): Map<string, PlayerRun[]> {
    const grouped = new Map<string, PlayerRun[]>()
    for (const run of runs) {
        const existing = grouped.get(run.game)
        if (existing) {
            existing.push(run)
        } else {
            grouped.set(run.game, [run])
        }
    }
    return grouped
}

function ProfileSkeleton() {
    return (
        <div className="w-full flex flex-col gap-6 animate-pulse">
            <div
                className="rounded-lg border border-border/40
                    bg-background/70 backdrop-blur-sm shadow-sm p-6"
            >
                <div className="flex flex-col items-center gap-4
                    md:flex-row md:items-start md:gap-6"
                >
                    <div className="w-20 h-20 md:w-24 md:h-24
                        rounded-full bg-muted/30"
                    />
                    <div className="flex-1 space-y-3 w-full">
                        <div className="h-6 w-48 rounded bg-muted/30
                            mx-auto md:mx-0"
                        />
                        <div className="h-4 w-32 rounded bg-muted/30
                            mx-auto md:mx-0"
                        />
                        <div className="h-4 w-40 rounded bg-muted/30
                            mx-auto md:mx-0"
                        />
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-4 lg:flex-row">
                <div className="flex-1 space-y-2">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-6 rounded bg-muted/30" />
                    ))}
                </div>
                <div className="flex-1 space-y-2">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-6 rounded bg-muted/30" />
                    ))}
                </div>
            </div>
        </div>
    )
}

function RunsColumn({
    title,
    runs,
    isIL,
    games,
}: {
    title: string
    runs: PlayerRun[]
    isIL: boolean
    games?: Game[]
}) {
    const [sortMode, setSortMode] = useState<SortMode>("latest")

    const grouped = useMemo(() => {
        const byGame = groupRunsByGame(runs)
        if (sortMode === "chronological" && games) {
            const gameOrder = new Map(
                games.map((g, i) => [g.name, i]),
            )
            const entries = Array.from(byGame.entries())
            entries.sort((a, b) => {
                const orderA = gameOrder.get(a[0]) ?? Infinity
                const orderB = gameOrder.get(b[0]) ?? Infinity
                return orderA - orderB
            })
            return new Map(entries)
        }
        return byGame
    }, [runs, sortMode, games])

    if (runs.length === 0) {
        return (
            <div className="flex-1 rounded-lg border border-border/40 bg-background/70 backdrop-blur-sm shadow-sm">
                <h3 className="text-sm font-semibold px-4 py-3">{title}</h3>
                <div className="text-sm text-muted-foreground px-4 pb-4">
                    No runs recorded.
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 rounded-lg border border-border/40 bg-background/70 backdrop-blur-sm shadow-sm overflow-hidden">
            <div className="flex items-center justify-between
                gap-2 px-4 py-3"
            >
                <h3 className="text-sm font-semibold min-w-0
                    truncate"
                >
                    {title}
                </h3>
                <Select
                    value={sortMode}
                    onValueChange={(v) => setSortMode(v as SortMode)}
                >
                    <SelectTrigger size="sm" className="w-auto text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="latest">Latest</SelectItem>
                        <SelectItem value="chronological">
                            Chronological
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/20">
                            <TableHead>Category</TableHead>
                            <TableHead className="w-16 text-center">
                                #
                            </TableHead>
                            <TableHead className="text-right">Time</TableHead>
                            <TableHead className="text-right hidden sm:table-cell">
                                Date
                            </TableHead>
                            <TableHead className="text-right pr-4">
                                Video
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from(grouped.entries()).map(
                            ([game, gameRuns]) => (
                                <>
                                    <TableRow key={`header-${game}`}>
                                        <TableCell
                                            colSpan={5}
                                            className="bg-muted/30 text-center
                                                font-semibold text-sm py-1.5"
                                        >
                                            {game}
                                        </TableCell>
                                    </TableRow>
                                    {gameRuns.map((r, idx) => {
                                        const relativeDate = r.date
                                            ? formatRelativeDate(r.date)
                                            : ""
                                        const categoryText = isIL && r.level
                                            ? r.category
                                            : r.category
                                        const parenMatch = categoryText.match(
                                            /^(.+)\s+\(([^)]+)\)$/,
                                        )
                                        return (
                                            <TableRow
                                                key={r.id}
                                                className={cn(
                                                    "transition hover:bg-muted/30",
                                                    idx % 2 === 1
                                                        ? "bg-muted/10"
                                                        : "",
                                                )}
                                            >
                                                <TableCell className="text-sm">
                                                    {parenMatch ? (
                                                        <>
                                                            {parenMatch[1]}
                                                            <br />
                                                            <span className="text-xs text-muted-foreground">
                                                                {parenMatch[2]}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        categoryText
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div
                                                        className={cn(
                                                            "flex items-center justify-center",
                                                            "w-8 h-8 rounded-full text-center",
                                                            "text-xs font-semibold mx-auto",
                                                            getRankBackground(
                                                                r.place,
                                                            ),
                                                        )}
                                                    >
                                                        {r.place}
                                                    </div>
                                                </TableCell>
                                                <TableCell
                                                    className="text-right font-mono
                                                        tabular-nums tracking-tight text-sm"
                                                >
                                                    {r.url ? (
                                                        <a
                                                            href={r.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="hover:underline"
                                                        >
                                                            {r.time}
                                                        </a>
                                                    ) : (
                                                        r.time
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right text-xs
                                                    hidden sm:table-cell"
                                                >
                                                    {relativeDate}
                                                </TableCell>
                                                <TableCell className="pr-4 text-right">
                                                    {r.video ? (
                                                        <a
                                                            href={r.video}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center
                                                                justify-center h-6 w-6 rounded
                                                                hover:bg-muted/40"
                                                        >
                                                            <Play size={14} />
                                                        </a>
                                                    ) : (
                                                        <span
                                                            className="text-muted-foreground/50
                                                                text-xs"
                                                        >
                                                            -
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </>
                            ),
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}


const socialIconClass =
    "w-5 h-5 cursor-pointer text-ring hover:text-white transition-colors duration-200"


export function PlayerProfile() {
    const { playerName } = useParams<{ playerName: string }>()
    const {
        data: profile,
        isLoading,
        error,
    } = usePlayerProfile(playerName || "")
    const { data: games } = useGames()

    const placements = useMemo(() => {
        if (!profile) return { first: 0, second: 0, third: 0, total: 0 }
        const allRuns = [...profile.fg, ...profile.il]
        const first = allRuns.filter((r) => r.place === 1).length
        const second = allRuns.filter((r) => r.place === 2).length
        const third = allRuns.filter((r) => r.place === 3).length
        return { first, second, third, total: first + second + third }
    }, [profile])

    if (isLoading) return <ProfileSkeleton />

    if (error instanceof PlayerNotFoundError) {
        return (
            <div
                className="rounded-lg border border-border/40 bg-background/70
                    backdrop-blur-sm shadow-sm p-8 text-center"
            >
                <h2 className="text-xl font-semibold mb-2">
                    Player not found
                </h2>
                <p className="text-muted-foreground mb-4">
                    No player exists with that name.
                </p>
                <Link to="/" className="text-sm underline hover:text-white">
                    Back to home
                </Link>
            </div>
        )
    }

    if (error) {
        return (
            <div
                className="text-sm text-red-500 p-4
                    border border-red-500/20 rounded"
            >
                Error loading player profile. If this problem persits, contact
                Anastasia on the THPS Speedrun Discord.
            </div>
        )
    }

    if (!profile) return null

    const displayName = profile.nickname || profile.name
    const totalPoints =
        (profile.stats?.fg_points ?? 0) + (profile.stats?.il_points ?? 0)
    const hasFG = profile.fg.length > 0
    const hasIL = profile.il.length > 0

    return (
        <div className="w-full flex flex-col gap-6">
            <div
                className="rounded-lg border border-border/40 bg-background/70
                    backdrop-blur-sm shadow-sm p-4 md:p-6"
            >
                <div className="flex flex-col items-center gap-4
                    md:flex-row md:items-center md:gap-6"
                >
                    <div className="shrink-0">
                        {profile.pfp ? (
                            <img
                                src={`${BACKEND_URL}${profile.pfp}`}
                                alt={displayName}
                                className="w-20 h-20 md:w-24 md:h-24
                                    rounded-full object-cover
                                    border border-border/40"
                            />
                        ) : (
                            <div
                                className="w-20 h-20 md:w-24 md:h-24
                                    rounded-full bg-muted/30
                                    flex items-center justify-center
                                    border border-border/40"
                            >
                                <User size={36}
                                    className="text-muted-foreground"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0 text-center md:text-left">
                        <div className="flex items-center justify-center
                            md:justify-start gap-2 flex-wrap"
                        >
                            <h1 className="text-xl md:text-2xl font-bold">
                                {displayName}
                            </h1>
                            {profile.pronouns && (
                                <span className="text-sm text-muted-foreground">
                                    ({profile.pronouns})
                                </span>
                            )}
                            {profile.country && (
                                <span className="flex items-center gap-1
                                    text-sm text-muted-foreground"
                                >
                                    <CountryFlag
                                        countryCode={
                                            profile.country.id as CountryCode
                                        }
                                    />
                                    {profile.country.name}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center justify-center
                            md:justify-start gap-3 mt-2"
                        >
                            {profile.twitch && (
                                <a
                                    href={profile.twitch}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FaTwitch className={socialIconClass} />
                                </a>
                            )}
                            {profile.youtube && (
                                <a
                                    href={profile.youtube}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FaYoutube className={socialIconClass} />
                                </a>
                            )}
                            {profile.twitter && (
                                <a
                                    href={profile.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FaXTwitter className={socialIconClass} />
                                </a>
                            )}
                            {profile.bluesky && (
                                <a
                                    href={profile.bluesky}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FaBluesky className={socialIconClass} />
                                </a>
                            )}
                            {profile.url && (
                                <a
                                    href={profile.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FaTrophy />
                                </a>
                            )}
                            {profile.discord && (
                                <span
                                    className="cursor-default"
                                    title={profile.discord}
                                >
                                    <FaDiscord />
                                </span>
                            )}
                        </div>

                        {profile.stats && (
                            <>
                                <div className="flex items-center justify-center
                                    md:justify-start gap-4 mt-3 text-sm"
                                >
                                    <span>
                                        <span className="text-muted-foreground">
                                            Total Points:{" "}
                                        </span>
                                        <span className="font-semibold">
                                            {totalPoints.toLocaleString()}
                                        </span>
                                    </span>
                                </div>
                                <div className="flex items-center justify-center
                                    md:justify-start gap-4 mt-1 text-sm"
                                >
                                    <span>
                                        <span className="text-muted-foreground">
                                            Total Runs:{" "}
                                        </span>
                                        <span className="font-semibold">
                                            {profile.stats.total_runs.toLocaleString()}
                                        </span>
                                    </span>
                                    <span>
                                        <span className="text-muted-foreground">
                                            Current:{" "}
                                        </span>
                                        <span className="font-semibold">
                                            {(profile.fg.length + profile.il.length).toLocaleString()}
                                        </span>
                                    </span>
                                    <span>
                                        <span className="text-muted-foreground">
                                            Obsoleted:{" "}
                                        </span>
                                        <span className="font-semibold">
                                            {(profile.stats.total_runs - profile.fg.length - profile.il.length).toLocaleString()}
                                        </span>
                                    </span>
                                </div>
                            </>
                        )}

                        {placements.total > 0 && (
                            <div className="flex items-center justify-center
                                md:justify-start gap-4 mt-1.5 text-sm"
                            >
                                <span>
                                    <span className="text-muted-foreground">
                                        Trophies:{" "}
                                    </span>
                                    <span className="font-semibold">
                                        {placements.total}
                                    </span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="inline-flex items-center
                                        justify-center w-5 h-5 rounded-full
                                        text-xs font-semibold
                                        bg-yellow-500/50"
                                    >
                                        1
                                    </span>
                                    <span className="font-semibold">
                                        {placements.first}
                                    </span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="inline-flex items-center
                                        justify-center w-5 h-5 rounded-full
                                        text-xs font-semibold
                                        bg-gray-300/50"
                                    >
                                        2
                                    </span>
                                    <span className="font-semibold">
                                        {placements.second}
                                    </span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="inline-flex items-center
                                        justify-center w-5 h-5 rounded-full
                                        text-xs font-semibold
                                        bg-orange-500/50"
                                    >
                                        3
                                    </span>
                                    <span className="font-semibold">
                                        {placements.third}
                                    </span>
                                </span>
                            </div>
                        )}
                    </div>

                    {profile.awards.length > 0 && (
                        <div className="shrink-0 text-center md:text-left">
                            <h3 className="text-xs font-medium
                                text-muted-foreground uppercase
                                tracking-wide mb-1"
                            >
                                Awards
                            </h3>
                            <div className="flex flex-wrap justify-center
                                md:flex-col md:justify-start gap-1"
                            >
                                {profile.awards.map((award, i) => (
                                    <span
                                        key={i}
                                        className="text-sm"
                                        title={
                                            award.description || undefined
                                        }
                                    >
                                        {award.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {(hasFG || hasIL) && (
                <div className="flex flex-col gap-4 lg:flex-row">
                    {hasFG && (
                        <RunsColumn
                            title={`Full Game Speedruns${
                                profile.stats
                                    ? ` - Points: ${profile.stats.fg_points.toLocaleString()}`
                                    : ""
                            }`}
                            runs={profile.fg}
                            isIL={false}
                            games={games}
                        />
                    )}
                    {hasIL && (
                        <RunsColumn
                            title={`IL Speedruns${
                                profile.stats
                                    ? ` - Points: ${profile.stats.il_points.toLocaleString()}`
                                    : ""
                            }`}
                            runs={profile.il}
                            isIL={true}
                            games={games}
                        />
                    )}
                </div>
            )}

            {!hasFG && !hasIL && (
                <div
                    className="text-sm text-muted-foreground p-4
                        border border-dashed border-border/40 rounded text-center"
                >
                    This player has no recorded speedruns (or their first is awaiting approval).
                </div>
            )}
        </div>
    )
}
