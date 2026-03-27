import { useMemo, useEffect, useState } from "react"
import {
    Navigate,
    useParams,
    useNavigate,
} from "react-router"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table"
import { VariableToggles } from "@/components/leaderboard/variable-toggles"
import { GameSidebar } from "@/components/game/game-sidebar"
import { ILOverview } from "@/components/ils/il-overview"
import { WRHistoryChart } from "@/components/leaderboard/wr-history-chart"

import { useGameDetail } from "@/hooks/game/useGameDetail"
import { useLeaderboard } from "@/hooks/leaderboard/useLeaderboard"

import { cn } from "@/lib/utils"
import { ChartLine } from "lucide-react"

import {
    SkeletonRow,
    getApplicableVariables,
} from "@/lib/leaderboard-helpers"

import type {
    GameCategory,
    LbsRun,
    LbsRecentRun,
} from "@/types/api"


export const GameOverview = () => {
    const { gameSlug, "*": splat } = useParams()
    const navigate = useNavigate()
    const safeGameSlug = gameSlug || ""

    // URL format:
    //   /:gameSlug/:categorySlug/:val1/:val2  (full-game)
    //   /:gameSlug/ils/:levelSlug/:catSlug/:val1  (ILs)
    const segments = useMemo(
        () => (splat || "")
            .split("/")
            .filter(Boolean),
        [splat],
    )
    const isILView = segments[0] === "ils"
    const ilSegments = useMemo(
        () => isILView ? segments.slice(1) : [],
        [segments, isILView],
    )

    const categorySlug = isILView
        ? ""
        : (segments[0] || "")
    const valueSlugs = useMemo(
        () => isILView ? [] : segments.slice(1),
        [segments, isILView],
    )

    // ---- Data hooks ----
    const {
        data: gameDetail,
        isLoading: gameLoading,
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
        { enabled: !!safeGameSlug && !!categorySlug && !isILView },
    )

    const categories = useMemo(
        () => (gameDetail?.categories ?? []).filter(
            (c) => c.type === "per-game",
        ),
        [gameDetail],
    )

    const activeCategory: GameCategory | undefined =
        useMemo(
            () => categories.find(
                (c) => c.slug === categorySlug,
            ),
            [categories, categorySlug],
        )

    // Variable groups applicable to the active category
    const applicableVariables = useMemo(
        () => activeCategory
            ? getApplicableVariables(activeCategory)
            : [],
        [activeCategory],
    )

    const runs: LbsRun[] = lbData?.runs ?? []
    const stats = lbData?.stats
    const recentRuns: LbsRecentRun[] = (
        lbData?.recent ?? []
    ).slice(0, 5)

    const hasLevels = (gameDetail?.levels?.length ?? 0) > 0
    const [showHistory, setShowHistory] = useState(false)

    // Redirect /:gameSlug/ils back to /:gameSlug when
    // the game has no individual levels.
    useEffect(() => {
        if (isILView && !gameLoading && gameDetail && !hasLevels) {
            navigate(`/${safeGameSlug}`, { replace: true })
        }
    }, [isILView, gameLoading, gameDetail, hasLevels, safeGameSlug, navigate])

    // Redirect /:gameSlug to /:gameSlug/ils when the game
    // has no full-game categories but does have levels.
    useEffect(() => {
        if (
            !isILView
            && !gameLoading
            && gameDetail
            && categories.length === 0
            && hasLevels
        ) {
            navigate(`/${safeGameSlug}/ils`, { replace: true })
        }
    }, [
        isILView, gameLoading, gameDetail,
        categories, hasLevels, safeGameSlug, navigate,
    ])

    // ---- Default redirect ----
    // Redirect when: no category selected, OR category
    // has variables but URL is missing value slugs.
    // Skip entirely when in IL view — ILOverview handles
    // its own redirects.
    useEffect(() => {
        if (isILView) return
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

        // Already has the right slug segments — skip
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
        isILView, categories, categorySlug,
        valueSlugs, safeGameSlug, navigate,
    ])

    // ---- Navigation handlers ----
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

    // Rebuild the full values array: replace the changed
    // group's slug, preserve existing selections for other
    // groups, fall back to each variable's first value.
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

    // Early return AFTER all hooks
    if (!gameSlug) return <Navigate to="/" replace />

    // Loading spinner before redirect completes
    if (!categorySlug && !isILView) {
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
            {isILView ? (
                <ILOverview
                    gameSlug={safeGameSlug}
                    gameDetail={gameDetail}
                    gameLoading={gameLoading}
                    ilSegments={ilSegments}
                />
            ) : (
            <>
            {/* ---------- Main area ---------- */}
            <div className="flex-1 flex flex-col gap-6">
                {/* Category tabs */}
                <div className={cn(
                    "rounded-lg border border-border/40",
                    "bg-background/70 backdrop-blur-sm",
                    "shadow-sm",
                )}>
                    <div className={cn(
                        "border-b border-border/40",
                        "px-4 pt-4 pb-2",
                        "flex flex-col gap-3",
                    )}>
                        {/* Category row */}
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

                        {/* Variable selectors + WR History button */}
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

                    {/* WR History chart */}
                    {showHistory && (
                        <WRHistoryChart
                            gameSlug={safeGameSlug}
                            categorySlug={categorySlug}
                            valueSlugs={valueSlugs}
                        />
                    )}

                    {/* Leaderboard table */}
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
                                Error loading leaderboard.
                            </div>
                        )}
                        {!lbLoading && !lbError
                            && categorySlug && (
                            <LeaderboardTable
                                runs={runs}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* ---------- Right sidebar ---------- */}
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
            </>
            )}
        </div>
    )
}
