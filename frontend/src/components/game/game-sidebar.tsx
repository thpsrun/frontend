import { useNavigate } from "react-router"

import { Badge } from "@/components/ui/badge"
import { Panel } from "@/components/ui/panel"

import { ManageButton } from "@/components/manage/manage-button"
import { RecentRunItem } from "@/components/leaderboard/leaderboard-table"

import { BACKEND_URL } from "@/constants"
import { cn } from "@/lib/utils"

import {
    formatLongDate,
    SidebarSkeleton,
} from "@/lib/leaderboard-helpers"

import type {
    GameDetail,
    LbsStats,
    LbsRecentRun,
} from "@/types/api"


// Recent-runs API returns category/level IDs (not slugs), so reconstruct
// the URL by matching against gameDetail.
const buildLeaderboardUrl = (
    gameSlug: string,
    run: LbsRecentRun,
    gameDetail: GameDetail | undefined,
): string | undefined => {
    if (!gameDetail) return undefined

    const cat = gameDetail.categories?.find(
        (c) => c.id === run.category,
    )
    if (!cat) return undefined

    if (run.level) {
        const lvl = gameDetail.levels?.find(
            (l) => l.name === run.level,
        )
        if (!lvl) return undefined
        return `/${[
            gameSlug, "ils", lvl.slug,
            cat.slug, ...(run.value_slugs ?? []),
        ].join("/")}`
    }

    return `/${[
        gameSlug, cat.slug, ...(run.value_slugs ?? []),
    ].join("/")}`
}


interface GameCardPanelProps {
    gameSlug: string
    gameDetail: GameDetail | undefined
    gameLoading: boolean
    isILView: boolean
    isGuidesView?: boolean
    isManageView?: boolean
    className?: string
}

export const GameCardPanel = ({
    gameSlug,
    gameDetail,
    gameLoading,
    isILView,
    isGuidesView = false,
    isManageView = false,
    className,
}: GameCardPanelProps) => {
    const navigate = useNavigate()
    const hasLevels = (gameDetail?.levels?.length ?? 0) > 0
    const hasFullGame = (gameDetail?.categories ?? []).some(
        (c) => c.type === "per-game",
    )

    if (gameLoading) {
        return (
            <div className={className}>
                <SidebarSkeleton />
            </div>
        )
    }

    if (!gameDetail) return null

    return (
        <Panel className={cn("overflow-hidden p-0", className)}>
            {gameDetail.boxart && (
                <img
                    src={`${BACKEND_URL}${gameDetail.boxart}`}
                    alt={gameDetail.name}
                    className={cn(
                        "max-h-40 mx-auto",
                        "object-contain p-2",
                    )}
                />
            )}
            <div className={cn(
                "flex flex-col gap-1 p-2",
                "border-b border-border/40",
                "bg-muted/10",
                "outline outline-border/40",
                "rounded-md",
            )}>
                {(hasFullGame || hasLevels) && (
                    <div className="flex gap-1">
                        {hasFullGame && (
                            <button
                                onClick={() => navigate(
                                    `/${gameSlug}`,
                                )}
                                className={cn(
                                    "flex-1 px-3 py-1.5",
                                    "text-xs font-semibold",
                                    "rounded-md transition",
                                    !isILView && !isGuidesView && !isManageView
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "text-muted-foreground hover:text-white hover:bg-muted/40",
                                )}
                            >
                                Full Game
                            </button>
                        )}
                        {hasLevels && (
                            <button
                                onClick={() => navigate(
                                    `/${gameSlug}/ils`,
                                )}
                                className={cn(
                                    "flex-1 px-3 py-1.5",
                                    "text-xs font-semibold",
                                    "rounded-md transition",
                                    isILView
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "text-muted-foreground hover:text-white hover:bg-muted/40",
                                )}
                            >
                                Individual Levels
                            </button>
                        )}
                    </div>
                )}
                <button
                    onClick={() => navigate(
                        `/${gameSlug}/guides`,
                    )}
                    className={cn(
                        "w-full px-3 py-1.5",
                        "text-xs font-semibold",
                        "rounded-md transition",
                        isGuidesView
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-muted-foreground hover:text-white hover:bg-muted/40",
                    )}
                >
                    Guides
                </button>
                <ManageButton
                    gameSlug={gameSlug}
                    isActive={isManageView}
                />
            </div>
            <div className="p-4 space-y-2 text-center">
                <h2 className={cn(
                    "text-lg font-bold",
                    "text-white",
                )}>
                    {gameDetail.name}
                </h2>
                {gameDetail.release && (
                    <p className={cn(
                        "text-xs",
                        "text-muted-foreground",
                    )}>
                        Released{" "}
                        {formatLongDate(
                            gameDetail.release,
                        )}
                    </p>
                )}
                {gameDetail.platforms
                    && gameDetail.platforms
                        .length > 0 && (
                    <div className={cn(
                        "flex flex-wrap justify-center",
                        "gap-1 pt-1",
                    )}>
                        {gameDetail.platforms
                            .map((p) => (
                            <Badge
                                key={p.id}
                                variant="outline"
                                className="text-[10px]"
                            >
                                {p.name}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </Panel>
    )
}


interface GameStatsPanelProps {
    stats: LbsStats | undefined
    statsLoading: boolean
    statsError: boolean
}

export const GameStatsPanel = ({
    stats,
    statsLoading,
    statsError,
}: GameStatsPanelProps) => {
    return (
        <Panel className="p-4 space-y-2">
            <h3 className={cn(
                "text-sm font-semibold",
                "text-muted-foreground",
                "uppercase tracking-wide",
                "text-center",
            )}>
                Stats
            </h3>
            {statsLoading && (
                <div className="space-y-2 animate-pulse">
                    <div className="h-4 rounded bg-muted/30 w-2/3" />
                    <div className="h-4 rounded bg-muted/30 w-1/2" />
                    <div className="h-4 rounded bg-muted/30 w-3/4" />
                </div>
            )}
            {!statsLoading && !statsError && stats && (
                <div className={cn(
                    "grid gap-2 text-center",
                    stats.il_count > 0
                        ? "grid-cols-3"
                        : "grid-cols-2",
                )}>
                    <div>
                        <div className="text-lg font-bold">
                            {stats.player_count}
                        </div>
                        <div className={cn(
                            "text-[10px]",
                            "text-muted-foreground",
                        )}>
                            Players
                        </div>
                    </div>
                    <div>
                        <div className="text-lg font-bold">
                            {stats.main_count}
                        </div>
                        <div className={cn(
                            "text-[10px]",
                            "text-muted-foreground",
                        )}>
                            Full Game Runs
                        </div>
                    </div>
                    {stats.il_count > 0 && (
                        <div>
                            <div className="text-lg font-bold">
                                {stats.il_count}
                            </div>
                            <div className={cn(
                                "text-[10px]",
                                "text-muted-foreground",
                            )}>
                                IL Runs
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Panel>
    )
}


interface GameRecentPanelProps {
    gameSlug: string
    gameDetail: GameDetail | undefined
    recentRuns: LbsRecentRun[]
    statsLoading: boolean
    statsError: boolean
}

export const GameRecentPanel = ({
    gameSlug,
    gameDetail,
    recentRuns,
    statsLoading,
    statsError,
}: GameRecentPanelProps) => {
    return (
        <Panel className="p-4 space-y-3">
            <h3 className={cn(
                "text-sm font-semibold",
                "text-muted-foreground",
                "uppercase tracking-wide",
                "text-center",
            )}>
                Recent Speedruns
            </h3>
            {statsLoading && (
                <div className="space-y-3 animate-pulse">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="space-y-1"
                        >
                            <div className="h-3 rounded bg-muted/30 w-1/2" />
                            <div className="h-3 rounded bg-muted/30 w-3/4" />
                            <div className="h-3 rounded bg-muted/30 w-1/3" />
                        </div>
                    ))}
                </div>
            )}
            {!statsLoading && !statsError
                && recentRuns.length > 0 && (
                recentRuns.map((r, i) => (
                    <RecentRunItem
                        key={i}
                        run={r}
                        leaderboardUrl={
                            buildLeaderboardUrl(
                                gameSlug,
                                r,
                                gameDetail,
                            )
                        }
                    />
                ))
            )}
            {!statsLoading && !statsError
                && recentRuns.length === 0 && (
                <div className="text-xs text-muted-foreground">
                    No Recent Speedruns
                </div>
            )}
        </Panel>
    )
}


interface GameSidebarProps {
    gameSlug: string
    gameDetail: GameDetail | undefined
    gameLoading: boolean
    stats: LbsStats | undefined
    recentRuns: LbsRecentRun[]
    statsLoading: boolean
    statsError: boolean
    isILView: boolean
    isGuidesView?: boolean
}

export const GameSidebar = ({
    gameSlug,
    gameDetail,
    gameLoading,
    stats,
    recentRuns,
    statsLoading,
    statsError,
    isILView,
    isGuidesView = false,
}: GameSidebarProps) => {
    return (
        <div className={cn(
            "w-full lg:w-80 shrink-0",
            "flex flex-col gap-6",
            "lg:sticky lg:top-6 lg:self-start",
        )}>
            <GameCardPanel
                gameSlug={gameSlug}
                gameDetail={gameDetail}
                gameLoading={gameLoading}
                isILView={isILView}
                isGuidesView={isGuidesView}
            />
            {!isGuidesView && (
                <GameStatsPanel
                    stats={stats}
                    statsLoading={statsLoading}
                    statsError={statsError}
                />
            )}
            {!isGuidesView && (
                <GameRecentPanel
                    gameSlug={gameSlug}
                    gameDetail={gameDetail}
                    recentRuns={recentRuns}
                    statsLoading={statsLoading}
                    statsError={statsError}
                />
            )}
        </div>
    )
}
