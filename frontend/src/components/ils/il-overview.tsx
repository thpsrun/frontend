import { useMemo, useState } from "react"

import { ILFilterPanel } from "@/components/ils/il-filter-panel"
import { ILOverviewGrid } from "@/components/ils/il-overview-grid"
import { ILDetail } from "@/components/ils/il-detail"
import {
    GameSidebar,
    GameCardPanel,
    GameStatsPanel,
    GameRecentPanel,
} from "@/components/game/game-sidebar"

import { useILOverview } from "@/hooks/leaderboard/useILOverview"
import { useILLeaderboard } from "@/hooks/leaderboard/useILLeaderboard"

import { getApplicableVariables } from "@/lib/leaderboard-helpers"

import type { GameDetail } from "@/types/api"


interface ILOverviewProps {
    gameSlug: string
    gameDetail: GameDetail | undefined
    gameLoading: boolean
    ilSegments: string[]
}

export const ILOverview = ({
    gameSlug,
    gameDetail,
    gameLoading,
    ilSegments,
}: ILOverviewProps) => {
    const levelSlug = ilSegments[0] || ""
    const categorySlug = ilSegments[1] || ""
    const valueSlugs = useMemo(
        () => ilSegments.slice(2),
        [ilSegments],
    )

    // URLs within the project are formatted based on the type of run it is.
    // ILs -> /:gameSlug:/ils/:levelSlug:/:catSlug:/:val1:

    const ilCategories = useMemo(
        () => (gameDetail?.categories ?? []).filter(
            (c) => c.type === "per-level",
        ),
        [gameDetail],
    )

    const defaultCatSlug =
        ilCategories[0]?.slug ?? ""
    const defaultValues = useMemo(() => {
        const cat = ilCategories[0]
        if (!cat) return []
        const vars = getApplicableVariables(cat)
        return vars
            .map((v) => v.values[0]?.slug || "")
            .filter(Boolean)
    }, [ilCategories])

    const [overviewCatSlug, setOverviewCatSlug] =
        useState("")

    const [overviewValues, setOverviewValues] =
        useState<string[]>([])

    // Use defaults until user makes a selection
    const effectiveCatSlug =
        overviewCatSlug || defaultCatSlug
    const effectiveValues =
        overviewValues.length > 0
            ? overviewValues
            : defaultValues

    // Active overview category + variables
    const overviewCategory = useMemo(
        () => ilCategories.find(
            (c) => c.slug === effectiveCatSlug,
        ),
        [ilCategories, effectiveCatSlug],
    )
    const overviewVariables = useMemo(
        () => overviewCategory
            ? getApplicableVariables(overviewCategory)
            : [],
        [overviewCategory],
    )

    // Quick check to see if the filter panel needs to be shown.
    const hasFilters =
        ilCategories.length > 1
        || overviewVariables.length > 0

    const {
        data: overview,
        isLoading: overviewLoading,
    } = useILOverview({
        gameSlug,
        valueSlugs: effectiveValues.length > 0
            ? effectiveValues
            : undefined,
    })

    // Displays IL leaderboard data (for detailed view and sidebar
    // stats when the level is selected.)
    const {
        data: ilLbData,
        isLoading: ilLbLoading,
        error: ilLbError,
    } = useILLeaderboard(
        {
            gameSlug,
            levelSlug,
            categorySlug,
            valueSlugs,
        },
        {
            enabled: !!levelSlug && !!categorySlug,
        },
    )

    const handleOverviewCatChange = (
        newCatSlug: string,
    ) => {
        setOverviewCatSlug(newCatSlug)
        const cat = ilCategories.find(
            (c) => c.slug === newCatSlug,
        )
        const vars = cat
            ? getApplicableVariables(cat)
            : []
        const defaults = vars
            .map((v) => v.values[0]?.slug || "")
            .filter(Boolean)
        setOverviewValues(defaults)
    }

    const handleOverviewValueChange = (
        groupIndex: number,
        newValueSlug: string,
    ) => {
        setOverviewValues((prev) =>
            overviewVariables.map((variable, i) => {
                if (i === groupIndex) {
                    return newValueSlug
                }
                return (
                    prev[i]
                    || variable.values[0]?.slug
                    || ""
                )
            }),
        )
    }

    const sidebarStats = levelSlug
        ? ilLbData?.stats
        : overview?.stats
    const sidebarRecent = levelSlug
        ? (ilLbData?.recent ?? []).slice(0, 5)
        : (overview?.recent ?? []).slice(0, 5)
    const sidebarLoading = levelSlug
        ? ilLbLoading
        : overviewLoading

    return (
        <>
            <div className="flex-1 min-w-0 flex flex-col gap-6">
                <div className="lg:hidden">
                    <GameCardPanel
                        gameSlug={gameSlug}
                        gameDetail={gameDetail}
                        gameLoading={gameLoading}
                        isILView={true}
                    />
                </div>
                {levelSlug ? (
                    <ILDetail
                        gameSlug={gameSlug}
                        gameDetail={gameDetail}
                        levelSlug={levelSlug}
                        categorySlug={categorySlug}
                        valueSlugs={valueSlugs}
                        lbData={ilLbData}
                        lbLoading={ilLbLoading}
                        lbError={ilLbError}
                    />
                ) : (
                    <>
                        {hasFilters && !gameLoading && (
                            <ILFilterPanel
                                ilCategories={
                                    ilCategories
                                }
                                activeCatSlug={
                                    effectiveCatSlug
                                }
                                variables={
                                    overviewVariables
                                }
                                valueSlugs={
                                    effectiveValues
                                }
                                onCategoryChange={
                                    handleOverviewCatChange
                                }
                                onValueChange={
                                    handleOverviewValueChange
                                }
                            />
                        )}
                        <ILOverviewGrid
                            gameSlug={gameSlug}
                            levels={
                                overview?.levels ?? []
                            }
                            isLoading={overviewLoading}
                            error={null}
                            categorySlug={
                                effectiveCatSlug
                            }
                            valueSlugs={
                                effectiveValues
                            }
                            multipleCategories={
                                ilCategories.length > 1
                            }
                        />
                    </>
                )}
                <div className="flex flex-col gap-6 lg:hidden">
                    <GameStatsPanel
                        stats={sidebarStats}
                        statsLoading={sidebarLoading}
                        statsError={
                            levelSlug ? !!ilLbError : false
                        }
                    />
                    <GameRecentPanel
                        gameSlug={gameSlug}
                        gameDetail={gameDetail}
                        recentRuns={sidebarRecent}
                        statsLoading={sidebarLoading}
                        statsError={
                            levelSlug ? !!ilLbError : false
                        }
                    />
                </div>
            </div>

            <div className="hidden lg:block">
                <GameSidebar
                    gameSlug={gameSlug}
                    gameDetail={gameDetail}
                    gameLoading={gameLoading}
                    stats={sidebarStats}
                    recentRuns={sidebarRecent}
                    statsLoading={sidebarLoading}
                    statsError={
                        levelSlug
                            ? !!ilLbError
                            : false
                    }
                    isILView={true}
                />
            </div>
        </>
    )
}
