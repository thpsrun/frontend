import * as flags from "country-flag-icons/react/3x2"

import { cn } from "@/lib/utils"

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
    if (dateStr === null) return "Unknown"

    const now = new Date()
    const then = new Date(dateStr)
    const diffMs = now.getTime() - then.getTime()
    const days = Math.floor(
        diffMs / (1000 * 60 * 60 * 24),
    )
    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 30) return `${days} Days Ago`

    // Months vary by month, obviously, so just round to 30.
    const months = Math.floor(days / 30)
    if (months === 1) return "1 Month Ago"
    if (months < 12) return `${months} Months Ago`

    // Accounts for leap years, in case someone wants to be "umm akshully"
    const years = Math.floor(days / 365.25)
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
): string => {
    const parts = [gameSlug, categorySlug, ...valueSlugs]
    return `/${parts.join("/")}`
}
