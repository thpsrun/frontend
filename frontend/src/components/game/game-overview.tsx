import { useMemo, useEffect, useState } from "react"
import {
    Navigate,
    useParams,
    useNavigate,
} from "react-router"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Panel } from "@/components/ui/panel"

import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table"
import { VariableToggles } from "@/components/leaderboard/variable-toggles"
import {
    GameSidebar,
    GameCardPanel,
    GameStatsPanel,
    GameRecentPanel,
} from "@/components/game/game-sidebar"
import { ILOverview } from "@/components/ils/il-overview"
import { WRHistoryChart } from "@/components/leaderboard/wr-history-chart"
import { GuidesHubPage } from "@/components/guides/guides-hub-page"

import { useGameDetail } from "@/hooks/game/useGameDetail"
import { useLeaderboard } from "@/hooks/leaderboard/useLeaderboard"
import { ApiError } from "@/lib/api-client"

import { useSession } from "@/hooks/auth/useSession"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"
import { useReadByTarget } from "@/hooks/notifications/useReadByTarget"
import { SubmitRunDialog } from "@/components/submissions/submit-run-dialog"

import { cn } from "@/lib/utils"
import { ChartLine, Send } from "lucide-react"

import {
    SkeletonRow,
    getApplicableVariables,
} from "@/lib/leaderboard-helpers"
import { resolveLeaderboardMethods } from "@/lib/timing-inheritance"

import type {
    GameCategory,
    LbsRun,
    LbsRecentRun,
} from "@/types/api"


export const GameOverview = () => {
    const { gameSlug, "*": splat } = useParams()
    const navigate = useNavigate()
    const safeGameSlug = gameSlug || ""

    useReadByTarget("game", safeGameSlug || null)

    // URLs within the project are formatted based on the type of run it is.
    // Full-Game -> /:gameSlug:/:categorySlug:/:val1:/:val2:
    // ILs -> /:gameSlug:/ils/:levelSlug:/:catSlug:/:val1:

    const segments = useMemo(
        () => (splat || "")
            .split("/")
            .filter(Boolean),
        [splat],
    )
    const isILView = segments[0] === "ils"
    const isGuidesView = segments[0] === "guides"
    const ilSegments = useMemo(
        () => isILView ? segments.slice(1) : [],
        [segments, isILView],
    )

    const categorySlug = (isILView || isGuidesView)
        ? ""
        : (segments[0] || "")
    const valueSlugs = useMemo(
        () => (isILView || isGuidesView) ? [] : segments.slice(1),
        [segments, isILView, isGuidesView],
    )

    const {
        data: gameDetail,
        isLoading: gameLoading,
        error: gameError,
    } = useGameDetail(safeGameSlug)

    const {
        data: lbData,
        isLoading: lbLoading,
        error: lbError,
    } = useLeaderboard(
        {
            gameSlug: safeGameSlug,
            categorySlug,
            valueSlugs,
        },
        { enabled: !!safeGameSlug && !!categorySlug && !isILView && !isGuidesView },
    )

    const categories = useMemo(
        () => (gameDetail?.categories ?? []).filter(
            (c) => c.type === "per-game",
        ),
        [gameDetail],
    )

    // Automatically sets a specific category (and the applicable variables)
    // so you can navigate to it via URL.
    const activeCategory: GameCategory | undefined =
        useMemo(
            () => categories.find(
                (c) => c.slug === categorySlug,
            ),
            [categories, categorySlug],
        )

    const applicableVariables = useMemo(
        () => activeCategory
            ? getApplicableVariables(activeCategory)
            : [],
        [activeCategory],
    )

    const variableSelections = useMemo(
        () => applicableVariables
            .map((variable, i) => {
                const valueSlug = valueSlugs[i]
                const value = variable.values.find(
                    (v) => v.slug === valueSlug,
                )
                if (!value) return null
                return { variable, value }
            })
            .filter(
                (s): s is NonNullable<typeof s> => s !== null,
            ),
        [applicableVariables, valueSlugs],
    )

    const leaderboardMethods = useMemo(
        () => {
            if (!gameDetail || !activeCategory) return null
            return resolveLeaderboardMethods({
                scope: "fg",
                game: gameDetail,
                category: activeCategory,
                selections: variableSelections,
            })
        },
        [gameDetail, activeCategory, variableSelections],
    )

    const runs: LbsRun[] = lbData?.runs ?? []
    const stats = lbData?.stats
    const recentRuns: LbsRecentRun[] = (
        lbData?.recent ?? []
    ).slice(0, 5)

    const hasLevels = (gameDetail?.levels?.length ?? 0) > 0
    const [showHistory, setShowHistory] = useState(false)
    const { isAuthenticated } = useSession()
    const { player } = useCurrentPlayer()
    const [showSubmit, setShowSubmit] = useState(false)

    // Redirects /:gameSlug:/ils back to /:gameSlug: when the game has
    // no individual levels. Sometimes this happens for games (like THP8).
    useEffect(() => {
        if (isILView && !gameLoading && gameDetail && !hasLevels) {
            navigate(`/${safeGameSlug}`, { replace: true })
        }
    }, [isILView, gameLoading, gameDetail, hasLevels, safeGameSlug, navigate])

    // The inverse of the above function - /:gameSlug: to /:gameSlug:/ils when
    // game has no full-game categories, but it does have ILs. THPS3+4CE is
    // one example of this.
    useEffect(() => {
        if (
            !isILView
            && !isGuidesView
            && !gameLoading
            && gameDetail
            && categories.length === 0
            && hasLevels
        ) {
            navigate(`/${safeGameSlug}/ils`, { replace: true })
        }
    }, [
        isILView, isGuidesView, gameLoading, gameDetail,
        categories, hasLevels, safeGameSlug, navigate,
    ])

    // Default redirect when category or required variable value slugs are missing from URL
    useEffect(() => {
        if (isILView || isGuidesView) return
        if (categories.length === 0) return

        const targetCat = categorySlug
            ? categories.find(
                (c) => c.slug === categorySlug,
            )
            : categories[0]
        if (!targetCat) return

        const vars = getApplicableVariables(targetCat)
        const defaultValues = vars
            .map((v) => v.values[0]?.slug || "")
            .filter(Boolean)

        if (
            categorySlug === targetCat.slug
            && (vars.length === 0
                || valueSlugs.length >= vars.length)
        ) return

        const path = `/${[
            safeGameSlug,
            targetCat.slug,
            ...defaultValues,
        ].join("/")}`

        navigate(path, { replace: true })
    }, [
        isILView, isGuidesView, categories, categorySlug,
        valueSlugs, safeGameSlug, navigate,
    ])

    const handleCategoryChange = (
        newCategorySlug: string,
    ) => {
        const cat = categories.find(
            (c) => c.slug === newCategorySlug,
        )
        const vars = cat
            ? getApplicableVariables(cat)
            : []
        const defaultValues = vars
            .map((v) => v.values[0]?.slug || "")
            .filter(Boolean)

        const path = `/${[
            safeGameSlug,
            newCategorySlug,
            ...defaultValues,
        ].join("/")}`

        navigate(path)
    }

    const handleValueChange = (
        groupIndex: number,
        newValueSlug: string,
    ) => {
        const updated = applicableVariables.map(
            (variable, i) => {
                if (i === groupIndex) return newValueSlug
                return (
                    valueSlugs[i]
                    || variable.values[0]?.slug
                    || ""
                )
            },
        )
        const path = `/${[
            safeGameSlug,
            categorySlug,
            ...updated,
        ].join("/")}`
        navigate(path)
    }

    if (!gameSlug) return <Navigate to="/" replace />

    if (gameError instanceof ApiError && gameError.isNotFound) {
        return <Navigate to="/" replace />
    }

    if (!categorySlug && !isILView && !isGuidesView) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-muted-foreground">
                    Loading...
                </div>
            </div>
        )
    }

    return (
        <div className="w-full flex flex-col lg:flex-row gap-8">
            {isGuidesView ? (
                <>
                    <div className="flex-1 min-w-0 flex flex-col gap-6">
                        <div className="lg:hidden">
                            <GameCardPanel
                                gameSlug={safeGameSlug}
                                gameDetail={gameDetail}
                                gameLoading={gameLoading}
                                isILView={false}
                                isGuidesView
                            />
                        </div>
                        <GuidesHubPage pinnedGameSlug={safeGameSlug} />
                    </div>
                    <div className="hidden lg:block">
                        <GameSidebar
                            gameSlug={safeGameSlug}
                            gameDetail={gameDetail}
                            gameLoading={gameLoading}
                            stats={undefined}
                            recentRuns={[]}
                            statsLoading={false}
                            statsError={false}
                            isILView={false}
                            isGuidesView={true}
                        />
                    </div>
                </>
            ) : isILView ? (
                <ILOverview
                    gameSlug={safeGameSlug}
                    gameDetail={gameDetail}
                    gameLoading={gameLoading}
                    ilSegments={ilSegments}
                />
            ) : (
            <>
            <div className="flex-1 min-w-0 flex flex-col gap-6">
                <div className="lg:hidden">
                    <GameCardPanel
                        gameSlug={safeGameSlug}
                        gameDetail={gameDetail}
                        gameLoading={gameLoading}
                        isILView={false}
                    />
                </div>
                <Panel className="p-0">
                    <div className={cn(
                        "border-b border-border/40",
                        "px-4 pt-4 pb-2",
                        "flex flex-col gap-3",
                    )}>
                        <Tabs
                            value={categorySlug}
                            onValueChange={
                                handleCategoryChange
                            }
                        >
                            <TabsList className={cn(
                                "flex flex-wrap gap-1",
                                "bg-muted/20 p-1 rounded-md",
                                "max-h-32 overflow-y-auto",
                            )}>
                                {gameLoading && (
                                    <TabsTrigger
                                        disabled
                                        value="loading"
                                    >
                                        Loading...
                                    </TabsTrigger>
                                )}
                                {!gameLoading
                                    && categories.map((cat) => (
                                    <TabsTrigger
                                        key={cat.id}
                                        value={cat.slug}
                                        className={cn(
                                            "px-3 py-1",
                                            "rounded-sm text-xs",
                                            "data-[state=active]:bg-background",
                                            "data-[state=active]:shadow",
                                        )}
                                    >
                                        {cat.name}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>

                        <div className="flex items-start gap-3">
                            <div className="flex-1">
                                {activeCategory && (
                                    <VariableToggles
                                        variables={
                                            applicableVariables
                                        }
                                        valueSlugs={
                                            valueSlugs
                                        }
                                        onValueChange={
                                            handleValueChange
                                        }
                                        dropdownThreshold={6}
                                    />
                                )}
                            </div>
                            {isAuthenticated && (
                                <span
                                    title={
                                        !player?.moderation.has_src_key
                                            ? "Valid SRC API Key is required to submit runs."
                                            : undefined
                                    }
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowSubmit(true)}
                                        disabled={!player?.moderation.has_src_key}
                                        className="shrink-0 text-xs"
                                    >
                                        <Send className="size-3.5" />
                                        Submit Run
                                    </Button>
                                </span>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setShowHistory(
                                        (prev) => !prev,
                                    )
                                }
                                className="shrink-0 text-xs"
                            >
                                <ChartLine className="size-3.5" />
                                WR History Graph
                            </Button>
                        </div>
                    </div>

                    {showHistory && (
                        <WRHistoryChart
                            gameSlug={safeGameSlug}
                            categorySlug={categorySlug}
                            valueSlugs={valueSlugs}
                        />
                    )}

                    <div className="p-4">
                        {lbLoading && (
                            <div className="space-y-2">
                                {[...Array(6)].map(
                                    (_, i) => (
                                        <SkeletonRow
                                            key={i}
                                        />
                                    ),
                                )}
                            </div>
                        )}
                        {lbError && !lbLoading && (
                            <div className={cn(
                                "text-sm text-red-500",
                                "p-4 border",
                                "border-red-500/20",
                                "rounded",
                            )}>
                                Error Loading Leaderboard...
                            </div>
                        )}
                        {!lbLoading && !lbError
                            && categorySlug
                            && leaderboardMethods && (
                            <LeaderboardTable
                                runs={runs}
                                expectedPlayers={
                                    activeCategory?.players
                                }
                                requiredMethods={
                                    leaderboardMethods.requiredMethods
                                }
                                primaryMethod={
                                    leaderboardMethods.primaryMethod
                                }
                            />
                        )}
                    </div>
                </Panel>

                <div className="flex flex-col gap-6 lg:hidden">
                    <GameStatsPanel
                        stats={stats}
                        statsLoading={lbLoading}
                        statsError={!!lbError}
                    />
                    <GameRecentPanel
                        gameSlug={safeGameSlug}
                        gameDetail={gameDetail}
                        recentRuns={recentRuns}
                        statsLoading={lbLoading}
                        statsError={!!lbError}
                    />
                </div>
            </div>

            <div className="hidden lg:block">
                <GameSidebar
                    gameSlug={safeGameSlug}
                    gameDetail={gameDetail}
                    gameLoading={gameLoading}
                    stats={stats}
                    recentRuns={recentRuns}
                    statsLoading={lbLoading}
                    statsError={!!lbError}
                    isILView={false}
                />
            </div>
            {isAuthenticated && player && activeCategory && gameDetail && (
                <SubmitRunDialog
                    open={showSubmit}
                    onOpenChange={setShowSubmit}
                    gameDetail={gameDetail}
                    activeCategory={activeCategory}
                    valueSlugs={valueSlugs}
                />
            )}
            </>
            )}
        </div>
    )
}
