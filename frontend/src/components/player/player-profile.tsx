import { Fragment, useMemo, useState } from "react"
import { Link, useParams } from "react-router"
import {
    FaTrophy,
    FaTwitch,
    FaYoutube,
    FaXTwitter,
    FaBluesky,
    FaDiscord,
} from "react-icons/fa6"
import { Cloud, Loader2, Play, User } from "lucide-react"

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
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs"

import { usePlayerProfile, PlayerNotFoundError } from "@/hooks/player/usePlayerProfile"
import { useGames } from "@/hooks/game/useGames"
import { BACKEND_URL } from "@/constants"
import { cn } from "@/lib/utils"
import {
    type CountryCode,
    CountryFlag,
    getRankBackground,
    timeAgo,
    formatLongDate,
} from "@/lib/leaderboard-helpers"

import type { PlayerRun, Game } from "@/types/api"


// Base points for 1st place; points above this are streak bonuses
const FG_BASE_POINTS = 1000
const IL_BASE_POINTS = 250

type SortMode = "latest" | "chronological" | "all"

function groupRunsByGame(runs: PlayerRun[]): Map<string, PlayerRun[]> {
    const grouped = new Map<string, PlayerRun[]>()
    for (const run of runs) {
        const key = run.game.slug
        const existing = grouped.get(key)
        if (existing) {
            existing.push(run)
        } else {
            grouped.set(key, [run])
        }
    }
    return grouped
}

function buildRunLeaderboardPath(r: PlayerRun): string | null {
    if (!r.category) return null
    if (r.level) {
        // IL: /:gameSlug/ils/:levelSlug/:categorySlug/:valueSlugs
        return `/${[
            r.game.slug,
            "ils",
            r.level.slug,
            r.category.slug,
            ...r.value_slugs,
        ].join("/")}`
    }
    // FG: /:gameSlug/:categorySlug/:valueSlugs
    return `/${[
        r.game.slug,
        r.category.slug,
        ...r.value_slugs,
    ].join("/")}`
}

function ProfileSkeleton() {
    return (
        <div className="w-full flex flex-col lg:flex-row gap-6 animate-pulse">
            <div className="order-first lg:order-last lg:w-80 shrink-0
                flex flex-col gap-4"
            >
                <div className="rounded-lg border border-border/40
                    bg-background/70 backdrop-blur-sm shadow-sm p-4
                    flex flex-col items-center gap-3"
                >
                    <div className="w-20 h-20 md:w-24 md:h-24
                        rounded-full bg-muted/30"
                    />
                    <div className="h-5 w-32 rounded bg-muted/30" />
                    <div className="h-3 w-20 rounded bg-muted/30" />
                    <div className="flex gap-2">
                        {[...Array(4)].map((_, i) => (
                            <div key={i}
                                className="w-5 h-5 rounded bg-muted/30"
                            />
                        ))}
                    </div>
                    <div className="w-full border-t border-border/40
                        mt-1 pt-3 space-y-2"
                    >
                        <div className="h-4 w-24 rounded bg-muted/30
                            mx-auto"
                        />
                        <div className="h-6 w-16 rounded bg-muted/30
                            mx-auto"
                        />
                        <div className="h-3 w-40 rounded bg-muted/30
                            mx-auto"
                        />
                        <div className="h-3 w-36 rounded bg-muted/30
                            mx-auto"
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 min-w-0 rounded-lg border
                border-border/40 bg-background/70 backdrop-blur-sm
                shadow-sm overflow-hidden"
            >
                <div className="flex gap-4 px-4 py-3 border-b
                    border-border/40"
                >
                    <div className="h-4 w-24 rounded bg-muted/30" />
                    <div className="h-4 w-16 rounded bg-muted/30" />
                </div>
                <div className="space-y-0">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-10 border-b
                            border-border/20 px-4 flex items-center"
                        >
                            <div className="h-3 rounded bg-muted/30"
                                style={{
                                    width: `${40 + (i % 3) * 20}%`,
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function RunsColumn({
    runs,
    games,
    sortMode,
}: {
    runs: PlayerRun[]
    games?: Game[]
    sortMode: SortMode
}) {
    const grouped = useMemo(() => {
        const byGame = groupRunsByGame(runs)
        if (sortMode === "chronological" && games && games.length > 0) {
            const gameOrder = new Map(
                games.map((g, i) => [g.slug, i]),
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
            <div className="text-sm text-muted-foreground
                px-4 py-8 text-center"
            >
                No runs recorded.
            </div>
        )
    }

    return (
        <Table className="table-fixed">
            <TableHeader>
                <TableRow className="bg-muted/20 text-sm">
                    <TableHead className="w-[40%]">
                        Category
                    </TableHead>
                    <TableHead className="w-16 text-center">
                        #
                    </TableHead>
                    <TableHead className="w-[20%] text-center">
                        Time
                    </TableHead>
                    <TableHead className="w-[20%] text-center
                        hidden sm:table-cell"
                    >
                        Date
                    </TableHead>
                    <TableHead className="w-[15%] text-center
                        hidden sm:table-cell"
                    >
                        Points
                    </TableHead>
                    <TableHead className="w-20 text-center">
                        Video
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {Array.from(grouped.entries()).map(
                    ([gameSlug, gameRuns]) => (
                        <Fragment key={gameSlug}>
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="bg-muted/30 text-center
                                        font-semibold text-sm py-1.5"
                                >
                                    <Link
                                        to={`/${gameSlug}`}
                                        className="text-link
                                            hover:underline"
                                    >
                                        {gameRuns[0].game.name}
                                    </Link>
                                </TableCell>
                            </TableRow>
                            {gameRuns.map((r, idx) => {
                                const relativeDate = r.date
                                    ? timeAgo(r.date)
                                    : ""
                                const categoryText = r.subcategory ?? ""
                                // Parse "Category (Variable)" format from API
                                const parenMatch = categoryText.match(
                                    /^(.+)\s+\(([^)]+)\)$/,
                                )
                                const leaderboardPath =
                                    buildRunLeaderboardPath(r)
                                return (
                                    <TableRow
                                        key={r.id}
                                        className={cn(
                                            "transition hover:bg-muted/30",
                                            "h-12",
                                            idx % 2 === 1
                                                ? "bg-muted/10"
                                                : "",
                                        )}
                                    >
                                        <TableCell
                                            className="text-sm py-1
                                                overflow-hidden"
                                        >
                                            {leaderboardPath ? (
                                                <Link
                                                    to={leaderboardPath}
                                                    className="hover:underline
                                                        text-link"
                                                >
                                                    <div className="truncate">
                                                        {parenMatch
                                                            ? parenMatch[1]
                                                            : categoryText}
                                                    </div>
                                                </Link>
                                            ) : (
                                                <div className="truncate">
                                                    {categoryText || "-"}
                                                </div>
                                            )}
                                            {parenMatch && (
                                                <div className="truncate
                                                    text-xs
                                                    text-muted-foreground"
                                                >
                                                    {parenMatch[2]}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {r.obsolete ? (
                                                <span className="text-xs
                                                    text-muted-foreground"
                                                >
                                                    -
                                                </span>
                                            ) : (
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
                                            )}
                                        </TableCell>
                                        <TableCell
                                            className="text-center font-mono
                                                tabular-nums tracking-tight text-sm"
                                        >
                                            {r.url ? (
                                                <a
                                                    href={r.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-link
                                                        hover:underline"
                                                >
                                                    {r.time}
                                                </a>
                                            ) : (
                                                r.time
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center text-xs
                                            hidden sm:table-cell"
                                        >
                                            <span
                                                title={formatLongDate(
                                                    r.date,
                                                )}
                                                className="cursor-help"
                                            >
                                                {relativeDate}
                                            </span>
                                        </TableCell>
                                        <TableCell className={cn(
                                            "text-center font-mono",
                                            "tabular-nums tracking-tight",
                                            "text-sm hidden sm:table-cell",
                                        )}>
                                            {r.obsolete ? (
                                                <span className="text-xs
                                                    text-muted-foreground"
                                                >
                                                    -
                                                </span>
                                            ) : (
                                                <>
                                                    {r.points}
                                                    {(() => {
                                                        const base =
                                                            r.level === null
                                                                ? FG_BASE_POINTS
                                                                : IL_BASE_POINTS
                                                        const bonus =
                                                            r.points - base
                                                        if (bonus <= 0) {
                                                            return null
                                                        }
                                                        return (
                                                            <sup
                                                                className={cn(
                                                                    "text-[0.6em]",
                                                                    "text-muted-foreground",
                                                                    "cursor-help ml-0.5",
                                                                )}
                                                                title={
                                                                    `Streak Bonus: ${bonus} points`
                                                                }
                                                            >
                                                                †
                                                            </sup>
                                                        )
                                                    })()}
                                                </>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="inline-flex
                                                items-center gap-1
                                                justify-center"
                                            >
                                                {r.video ? (
                                                    <a
                                                        href={r.video}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex
                                                            items-center
                                                            justify-center
                                                            h-6 w-6 rounded
                                                            hover:bg-muted/40"
                                                    >
                                                        {r.video.includes(
                                                            "youtube.com",
                                                        )
                                                        || r.video.includes(
                                                            "youtu.be",
                                                        ) ? (
                                                            <FaYoutube
                                                                size={14}
                                                            />
                                                        ) : r.video.includes(
                                                            "twitch.tv",
                                                        ) ? (
                                                            <FaTwitch
                                                                size={14}
                                                            />
                                                        ) : (
                                                            <Play size={14} />
                                                        )}
                                                    </a>
                                                ) : (
                                                    <span
                                                        className="text-muted-foreground/50
                                                            text-xs"
                                                    >
                                                        -
                                                    </span>
                                                )}
                                                {r.arch_video && (
                                                    <a
                                                        href={r.arch_video}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex
                                                            items-center
                                                            justify-center
                                                            h-6 w-6 rounded
                                                            hover:bg-muted/40
                                                            text-muted-foreground"
                                                        title="Archive video"
                                                    >
                                                        <Cloud size={14} />
                                                    </a>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </Fragment>
                    ),
                )}
            </TableBody>
        </Table>
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

    const [fgSort, setFgSort] = useState<SortMode>("latest")
    const [ilSort, setIlSort] = useState<SortMode>("latest")
    const [activeTab, setActiveTab] = useState("fg")

    const showObsolete = fgSort === "all" || ilSort === "all"
    const {
        data: obsoleteProfile,
        isFetching: isObsoleteFetching,
    } = usePlayerProfile(playerName || "", {
        includeObsolete: true,
        enabled: showObsolete,
    })

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
                <Link to="/" className="text-sm text-link hover:underline">
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
                Error loading player profile. If this problem persists, contact
                Anastasia on the THPS Speedrun Discord.
            </div>
        )
    }

    if (!profile) return null

    const displayName = profile.nickname || profile.name
    const totalPoints =
        (profile.stats?.fg_points ?? 0) + (profile.stats?.il_points ?? 0)
    const fgRuns = fgSort === "all" && obsoleteProfile
        ? obsoleteProfile.fg : profile.fg
    const ilRuns = ilSort === "all" && obsoleteProfile
        ? obsoleteProfile.il : profile.il
    const hasFG = fgRuns.length > 0
    const hasIL = ilRuns.length > 0

    return (
        <div className="w-full flex flex-col lg:flex-row gap-6">
            <div className="order-first lg:order-last lg:w-80
                shrink-0 flex flex-col gap-4
                lg:sticky lg:top-6 lg:self-start"
            >
                <div className="rounded-lg border border-border/40
                    bg-background/70 backdrop-blur-sm shadow-sm
                    p-4 text-center"
                >
                    <div className="flex justify-center mb-3">
                        {profile.pfp ? (
                            <img
                                src={`${BACKEND_URL}${profile.pfp}`}
                                alt={displayName}
                                className="w-20 h-20 md:w-24 md:h-24
                                    rounded-full object-cover
                                    border border-border/40"
                            />
                        ) : (
                            <div className="w-20 h-20 md:w-24 md:h-24
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

                    <div className="flex items-center justify-center
                        gap-2 flex-wrap"
                    >
                        {profile.country && (
                            <span className="flex items-center gap-1
                                text-sm text-muted-foreground"
                            >
                                <CountryFlag
                                    countryCode={
                                        profile.country.id as CountryCode
                                    }
                                    flagUrl={profile.country.flag}
                                    title={profile.country.name}
                                />
                            </span>
                        )}
                        <h1
                            className="text-xl font-bold"
                            title={profile.nickname
                                ? profile.name : undefined}
                        >
                            {displayName}
                        </h1>
                    </div>

                    {profile.pronouns && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                            ({profile.pronouns})
                        </p>
                    )}

                    {profile.joined && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Skater since{" "}
                            {new Date(profile.joined).toLocaleDateString(
                                "en-US",
                                {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                },
                            )}
                        </p>
                    )}

                    <div className="flex items-center justify-center
                        gap-3 mt-3"
                    >
                        {profile.twitch && (
                            <a href={profile.twitch} target="_blank"
                                rel="noopener noreferrer">
                                <FaTwitch className={socialIconClass} />
                            </a>
                        )}
                        {profile.youtube && (
                            <a href={profile.youtube} target="_blank"
                                rel="noopener noreferrer">
                                <FaYoutube className={socialIconClass} />
                            </a>
                        )}
                        {profile.twitter && (
                            <a href={profile.twitter} target="_blank"
                                rel="noopener noreferrer">
                                <FaXTwitter className={socialIconClass} />
                            </a>
                        )}
                        {profile.bluesky && (
                            <a href={profile.bluesky} target="_blank"
                                rel="noopener noreferrer">
                                <FaBluesky className={socialIconClass} />
                            </a>
                        )}
                        {profile.url && (
                            <a href={profile.url} target="_blank"
                                rel="noopener noreferrer">
                                <FaTrophy className={socialIconClass} />
                            </a>
                        )}
                        {profile.discord && (
                            <span className="cursor-default"
                                title={profile.discord}>
                                <FaDiscord className={socialIconClass} />
                            </span>
                        )}
                    </div>

                    <div className="border-t border-border/40 my-3" />

                    {profile.stats && (
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="text-muted-foreground">
                                    Total Points
                                </span>
                                <div className="font-bold text-lg">
                                    {totalPoints.toLocaleString()}
                                </div>
                            </div>

                            <div className="text-xs">
                                <span className="text-muted-foreground">
                                    Total Runs{" "}
                                </span>
                                <span className="font-semibold">
                                    {profile.stats.total_runs.toLocaleString()}
                                </span>
                                <span
                                    className="text-muted-foreground/50 mx-1"
                                >
                                    |
                                </span>
                                <span className="text-muted-foreground">
                                    Current{" "}
                                </span>
                                <span className="font-semibold">
                                    {(profile.fg.length
                                        + profile.il.length).toLocaleString()}
                                </span>
                                <span
                                    className="text-muted-foreground/50 mx-1"
                                >
                                    |
                                </span>
                                <span className="text-muted-foreground">
                                    Obsoleted{" "}
                                </span>
                                <span className="font-semibold">
                                    {(profile.stats.total_runs
                                        - profile.fg.length
                                        - profile.il.length).toLocaleString()}
                                </span>
                            </div>

                            {placements.total > 0 && (
                                <div className="text-xs">
                                    <span className="text-muted-foreground">
                                        Trophies{" "}
                                    </span>
                                    <span className="font-semibold">
                                        {placements.total}
                                    </span>
                                    <div className="flex items-center
                                        justify-center gap-3 mt-1"
                                    >
                                        <span
                                            className="flex items-center gap-1"
                                        >
                                            <span className="inline-flex
                                                items-center justify-center
                                                w-5 h-5 rounded-full
                                                text-xs font-semibold
                                                bg-yellow-500/50"
                                            >
                                                1
                                            </span>
                                            {placements.first}
                                        </span>
                                        <span
                                            className="flex items-center gap-1"
                                        >
                                            <span className="inline-flex
                                                items-center justify-center
                                                w-5 h-5 rounded-full
                                                text-xs font-semibold
                                                bg-gray-300/50"
                                            >
                                                2
                                            </span>
                                            {placements.second}
                                        </span>
                                        <span
                                            className="flex items-center gap-1"
                                        >
                                            <span className="inline-flex
                                                items-center justify-center
                                                w-5 h-5 rounded-full
                                                text-xs font-semibold
                                                bg-orange-500/50"
                                            >
                                                3
                                            </span>
                                            {placements.third}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {profile.awards.length > 0 && (
                    <div className="rounded-lg border border-border/40
                        bg-background/70 backdrop-blur-sm shadow-sm p-4"
                    >
                        <h3 className="text-xs font-medium
                            text-muted-foreground uppercase
                            tracking-wide mb-2 text-center"
                        >
                            Awards
                        </h3>
                        <div className="flex flex-wrap justify-center
                            gap-1 lg:flex-col lg:items-center"
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

            <div className="flex-1 min-w-0">
                {(hasFG || hasIL) ? (
                    <div className="rounded-lg border border-border/40
                        bg-background/70 backdrop-blur-sm shadow-sm
                        overflow-hidden"
                    >
                        <Tabs
                            defaultValue="fg"
                            className="gap-0"
                            onValueChange={setActiveTab}
                        >
                            <div className="flex items-center
                                justify-between border-b
                                border-border/40 px-4"
                            >
                                <TabsList className="bg-transparent
                                    rounded-none p-0 h-auto"
                                >
                                    <TabsTrigger
                                        value="fg"
                                        className="rounded-none border-b-2
                                            border-transparent
                                            data-[state=active]:border-primary
                                            data-[state=active]:bg-transparent
                                            data-[state=active]:shadow-none
                                            px-4 py-3 text-sm"
                                    >
                                        <span className="hidden sm:inline">
                                            Full Game
                                            {profile.stats
                                                ? ` \u2010 ${profile.stats.fg_points.toLocaleString()} pts`
                                                : ""}
                                        </span>
                                        <span className="sm:hidden">
                                            FG
                                        </span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="il"
                                        className="rounded-none border-b-2
                                            border-transparent
                                            data-[state=active]:border-primary
                                            data-[state=active]:bg-transparent
                                            data-[state=active]:shadow-none
                                            px-4 py-3 text-sm"
                                    >
                                        <span className="hidden sm:inline">
                                            IL
                                            {profile.stats
                                                ? ` \u2010 ${profile.stats.il_points.toLocaleString()} pts`
                                                : ""}
                                        </span>
                                        <span className="sm:hidden">
                                            IL
                                        </span>
                                    </TabsTrigger>
                                </TabsList>

                                <Select
                                    value={
                                        activeTab === "fg"
                                            ? fgSort
                                            : ilSort
                                    }
                                    onValueChange={(v) => {
                                        if (activeTab === "fg") {
                                            setFgSort(v as SortMode)
                                        } else {
                                            setIlSort(v as SortMode)
                                        }
                                    }}
                                >
                                    <SelectTrigger
                                        size="sm"
                                        className="w-auto text-xs"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="latest">
                                            Latest
                                        </SelectItem>
                                        <SelectItem value="chronological">
                                            Chronological
                                        </SelectItem>
                                        <SelectItem value="all">
                                            All Runs
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="relative">
                                {showObsolete && isObsoleteFetching && (
                                    <div className="absolute inset-0
                                        bg-background/80 z-10
                                        flex items-center justify-center"
                                    >
                                        <div className="flex items-center
                                            gap-2 text-sm
                                            text-muted-foreground"
                                        >
                                            <Loader2
                                                size={16}
                                                className="animate-spin"
                                            />
                                            Loading...
                                        </div>
                                    </div>
                                )}
                                <TabsContent
                                    value="fg"
                                    className="mt-0"
                                >
                                    <RunsColumn
                                        runs={fgRuns}
                                        games={games}
                                        sortMode={fgSort}
                                    />
                                </TabsContent>
                                <TabsContent
                                    value="il"
                                    className="mt-0"
                                >
                                    <RunsColumn
                                        runs={ilRuns}
                                        games={games}
                                        sortMode={ilSort}
                                    />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                ) : (
                    <div className="text-sm text-muted-foreground p-4
                        border border-dashed border-border/40
                        rounded text-center"
                    >
                        This player has no recorded speedruns
                        (or their first is awaiting approval).
                    </div>
                )}
            </div>
        </div>
    )
}
