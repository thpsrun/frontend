import { Link, Navigate, useNavigate, useParams } from "react-router"
import { ArrowLeft } from "lucide-react"

import { cn } from "@/lib/utils"
import { Panel } from "@/components/ui/panel"
import { SkeletonRow } from "@/lib/leaderboard-helpers"
import { ApiError } from "@/lib/api-client"
import { useGames } from "@/hooks/game/useGames"
import { useHistoricalRankings } from "@/hooks/leaderboard/useHistoricalRankings"
import { useOldestRuns } from "@/hooks/leaderboard/useOldestRuns"
import { RankingsTable } from "@/components/rankings/rankings-table"
import { OldestRunsList } from "@/components/rankings/oldest-runs-list"
import { GAMES_WITH_OLDEST_RUNS } from "@/components/rankings/oldest-runs-config"
import {
    MonthYearPicker,
    type YearMonth,
} from "@/components/rankings/month-year-picker"
import { ModeToggle } from "@/components/rankings/mode-toggle"
import {
    formatPeriod,
    isHistoryMode,
    parseYearMonth,
} from "@/lib/rankings-modes"
import type { HistoryMode } from "@/types/api"

const todayYearMonth = (): YearMonth => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

const isValidYear = (year: number, max: YearMonth): boolean => {
    return Number.isInteger(year) && year >= 2000 && year <= max.year
}

const isValidMonth = (month: number): boolean => {
    return Number.isInteger(month) && month >= 1 && month <= 12
}

interface ParsedParams {
    mode: HistoryMode
    year: number
    month: number
    gameSlug?: string
}

const parseParams = (
    raw: {
        mode?: string
        year?: string
        month?: string
        gameSlug?: string
    },
    today: YearMonth,
): ParsedParams | null => {
    if (!raw.mode || !isHistoryMode(raw.mode)) return null
    const year = Number.parseInt(raw.year ?? "", 10)
    const month = Number.parseInt(raw.month ?? "", 10)
    if (!isValidYear(year, today)) return null
    if (!isValidMonth(month)) return null
    return {
        mode: raw.mode,
        year,
        month,
        gameSlug: raw.gameSlug,
    }
}

const buildHistoryPath = (
    mode: HistoryMode,
    year: number,
    month: number,
    gameSlug?: string,
): string => {
    const tail = gameSlug ? `/${gameSlug}` : ""
    return `/rankings/history/${mode}/${year}/${month}${tail}`
}

export const HistoricalRankingsPage = () => {
    const raw = useParams<{
        mode: string
        year: string
        month: string
        gameSlug?: string
    }>()
    const navigate = useNavigate()
    const today = todayYearMonth()
    const parsed = parseParams(raw, today)

    // Always call hooks in the same order. When params are invalid,
    // disable the queries; the early-return below redirects.
    const safeMode: HistoryMode = parsed?.mode ?? "overall"
    const safeYear = parsed?.year ?? today.year
    const safeMonth = parsed?.month ?? today.month
    const safeGameSlug = parsed?.gameSlug

    const { data, isLoading, error } = useHistoricalRankings(
        {
            mode: safeMode,
            year: safeYear,
            month: safeMonth,
            gameSlug: safeGameSlug,
        },
        { enabled: parsed !== null },
    )

    const isToday = (
        safeMode === "overall"
        && safeYear === today.year
        && safeMonth === today.month
    )
    const showOldestSidebar = (
        parsed !== null
        && isToday
        && !!safeGameSlug
        && GAMES_WITH_OLDEST_RUNS.includes(safeGameSlug)
    )
    const oldestQuery = useOldestRuns(safeGameSlug ?? "", {
        enabled: showOldestSidebar,
    })

    const { data: games } = useGames()
    const game = games?.find((g) => g.slug === safeGameSlug)

    if (parsed === null) {
        return (
            <Navigate
                to={buildHistoryPath("overall", today.year, today.month)}
                replace
            />
        )
    }

    if (
        error instanceof ApiError
        && error.status === 404
        && safeGameSlug
    ) {
        return (
            <Navigate
                to={buildHistoryPath(safeMode, safeYear, safeMonth)}
                replace
            />
        )
    }

    const min = parseYearMonth(data?.meta.earliest_possible)
    const subtitle = formatPeriod(safeMode, safeYear, safeMonth)
    const gameName = game?.name ?? safeGameSlug?.toUpperCase() ?? ""
    const rankings = data?.rankings ?? []

    const onModeChange = (next: HistoryMode) => {
        navigate(buildHistoryPath(next, safeYear, safeMonth, safeGameSlug))
    }
    const onDateChange = (next: YearMonth) => {
        navigate(
            buildHistoryPath(safeMode, next.year, next.month, safeGameSlug),
        )
    }

    return (
        <div className="w-full flex flex-col gap-4">
            <Panel>
                {safeGameSlug && (
                    <Link
                        to={buildHistoryPath(safeMode, safeYear, safeMonth)}
                        className={cn(
                            "inline-flex items-center gap-1",
                            "text-xs text-muted-foreground",
                            "hover:text-foreground transition mb-2",
                        )}
                    >
                        <ArrowLeft size={12} />
                        Series Rankings
                    </Link>
                )}
                <h1 className="text-2xl font-bold mb-1">
                    {safeGameSlug ? `${gameName} Rankings` : "Rankings"}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {subtitle}
                </p>
            </Panel>

            <Panel className="flex flex-wrap items-center gap-4">
                <ModeToggle value={safeMode} onChange={onModeChange} />
                <MonthYearPicker
                    value={{ year: safeYear, month: safeMonth }}
                    onChange={onDateChange}
                    min={min}
                    max={today}
                />
            </Panel>

            <div className="w-full flex flex-col lg:flex-row gap-4">
                <div className={cn(
                    "flex flex-col gap-2",
                    showOldestSidebar ? "lg:flex-2" : "flex-1",
                )}>
                    {isLoading && (
                        <Panel className="space-y-2">
                            {[...Array(10)].map((_, i) => (
                                <SkeletonRow key={i} />
                            ))}
                        </Panel>
                    )}

                    {error && !isLoading && (
                        <Panel
                            className={cn(
                                "text-sm text-red-500",
                                "border-red-500/20",
                            )}
                        >
                            Error Loading Rankings...
                        </Panel>
                    )}

                    {data && !isLoading && !error && (
                        <RankingsTable
                            entries={rankings}
                            defaultSort="total"
                        />
                    )}
                </div>

                {showOldestSidebar
                    && oldestQuery.data
                    && oldestQuery.data.length > 0 && (
                    <div className="lg:flex-1">
                        <OldestRunsList runs={oldestQuery.data} />
                    </div>
                )}
            </div>
        </div>
    )
}
