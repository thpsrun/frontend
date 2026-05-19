import * as flags from "country-flag-icons/react/3x2"
import { Link } from "react-router"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { GradientUsername } from "@/components/profile/gradient-username"

import type {
    GameCategory,
    CategoryVariable,
} from "@/types/api"

import traFlag from "@/assets/flags/tra.png"
import enbyFlag from "@/assets/flags/enby.png"
import priFlag from "@/assets/flags/pri.png"
import eskiFlag from "@/assets/flags/es-ki.png"
import gbEngFlag from "@/assets/flags/gb-eng.png"
import gbNirFlag from "@/assets/flags/gb-nir.png"
import gbSctFlag from "@/assets/flags/gb-sct.png"
import gbWlsFlag from "@/assets/flags/gb-wls.png"
import vhFlag from "@/assets/flags/vh.png"

const customFlags: Record<string, string> = {
    TRA: traFlag,
    ENBY: enbyFlag,
    PRI: priFlag,
    "ES-KI": eskiFlag,
    "GB-ENG": gbEngFlag,
    "GB-NIR": gbNirFlag,
    "GB-SCT": gbSctFlag,
    "GB-WLS": gbWlsFlag,
    VH: vhFlag,
}

export type CountryCode = keyof typeof flags | string

export const getRankBackground = (place: number) => {
    if (place === 1) return "bg-yellow-500/50"
    if (place === 2) return "bg-gray-300/50"
    if (place === 3) return "bg-orange-500/50"
    return "bg-gray-700"
}

export const CountryFlag = (
    { countryCode, flagUrl, title, className }: {
        countryCode: CountryCode;
        flagUrl?: string | null;
        title?: string;
        className?: string;
    },
) => {
    const code = countryCode.toUpperCase()
    const classes = className ?? "w-7 pr-[5px] inline"
    if (flagUrl) {
        return (
            <img
                src={flagUrl}
                alt={title ?? code}
                title={title}
                className={classes}
            />
        )
    }
    const customSrc = customFlags[code]
    if (customSrc) {
        return (
            <img
                src={customSrc}
                alt={title ?? code}
                title={title}
                className={classes}
            />
        )
    }
    const FlagIcon = flags[code as keyof typeof flags]
    if (!FlagIcon) return null
    return (
        <FlagIcon
            className={classes}
            title={title}
        />
    )
}

export const formatLongDate = (
    dateStr: string | null,
): string => {
    if (!dateStr) return ""
    return new Date(dateStr).toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric",
        },
    )
}

export const timeAgo = (dateStr: string | null): string => {
    if (!dateStr) return ""

    const now = new Date()
    const then = new Date(dateStr)
    const diffMs = now.getTime() - then.getTime()
    const days = Math.floor(
        diffMs / (1000 * 60 * 60 * 24),
    )
    if (days < 0) return ""
    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 30) return `${days} Days Ago`

    // Past 30 days, use calendar-aware month math so "11 months and 27
    // days" doesn't fall into the gap between (days/30 = 12) and
    // (days/365.25 = 1) and report as "0 Years Ago".
    let months =
        (now.getFullYear() - then.getFullYear()) * 12
        + (now.getMonth() - then.getMonth())
    if (now.getDate() < then.getDate()) months -= 1
    // Calendar dip near the 30-day boundary; clamp so we never say "0".
    months = Math.max(1, months)

    if (months < 12) {
        if (months === 1) return "1 Month Ago"
        return `${months} Months Ago`
    }

    const years = Math.floor(months / 12)
    if (years === 1) return "1 Year Ago"
    return `${years} Years Ago`
}

export const SkeletonRow = () => (
    <div
        className={cn(
            "h-6 rounded",
            "bg-muted/30 animate-pulse",
        )}
    />
)

export const SidebarSkeleton = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-40 rounded bg-muted/30" />
        <div className="h-4 w-2/3 rounded bg-muted/30" />
        <div className="h-4 w-1/2 rounded bg-muted/30" />
        <div className="h-4 w-3/4 rounded bg-muted/30" />
    </div>
)

// Get variable groups applicable to the category given.
// If a category is archived, it is ignored.
export const getApplicableVariables = (
    cat: GameCategory,
): CategoryVariable[] => {
    return (cat.variables ?? []).filter(
        (v) => !v.archive,
    )
}

export const buildLeaderboardPath = (
    gameSlug: string,
    categorySlug: string,
    valueSlugs: string[],
    levelSlug?: string | null,
): string => {
    const parts = levelSlug
        ? [gameSlug, "ils", levelSlug, categorySlug, ...valueSlugs]
        : [gameSlug, categorySlug, ...valueSlugs]
    return `/${parts.join("/")}`
}

// Base points awarded for a 1st-place run before streak bonuses.
const FG_BASE_POINTS = 1000
const IL_BASE_POINTS = 250

export const StreakDagger = (
    { points, isIl }: { points: number; isIl: boolean },
) => {
    const base = isIl ? IL_BASE_POINTS : FG_BASE_POINTS
    const bonus = points - base
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

export interface RunPlayer {
    name: string | null
    nickname?: string | null
    country?: {
        id: string
        name: string
        flag?: string | null
    } | null
    gradients?: {
        gradient_1: string | null
        gradient_2: string | null
        gradient_3: string | null
    } | null
}

interface RunPlayersProps {
    players: RunPlayer[]
    expectedPlayers?: number
    separator?: ReactNode
    asLink?: boolean
    emptyText?: ReactNode
}

export const RunPlayers = ({
    players,
    expectedPlayers,
    separator = " & ",
    asLink = true,
    emptyText = "Unknown",
}: RunPlayersProps) => {
    if (players.length === 0) return <>{emptyText}</>

    const first = players[0]

    return (
        <>
            {first?.country?.id && (
                <CountryFlag
                    countryCode={first.country.id as CountryCode}
                    flagUrl={first.country.flag}
                    title={first.country.name}
                />
            )}
            {players.map((p, i) => {
                const name = p.name
                if (!name || name === "Anonymous") {
                    return (
                        <span key={`anon-${i}`}>
                            {i > 0 && separator}
                            Anonymous
                        </span>
                    )
                }
                const display = (
                    <GradientUsername
                        name={p.nickname || name}
                        gradients={p.gradients ?? null}
                    />
                )
                return (
                    <span key={name}>
                        {i > 0 && separator}
                        {asLink ? (
                            <Link
                                to={`/player/${name}`}
                                className="text-link hover:underline"
                            >
                                {display}
                            </Link>
                        ) : (
                            display
                        )}
                    </span>
                )
            })}
            {expectedPlayers !== undefined
                && players.length < expectedPlayers
                && <>{separator}Anonymous</>}
        </>
    )
}
