import { useMemo, useEffect, useState } from "react"
import { useNavigate } from "react-router"

import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table"
import { WRHistoryChart } from "@/components/leaderboard/wr-history-chart"
import { VariableToggles } from "@/components/leaderboard/variable-toggles"
import { Button } from "@/components/ui/button"
import { ChartLine, Send } from "lucide-react"

import { useAuth } from "@/hooks/auth/useAuth"
import { SubmitRunDialog } from "@/components/submissions/submit-run-dialog"

import { cn } from "@/lib/utils"

import {
    SkeletonRow,
    getApplicableVariables,
} from "@/lib/leaderboard-helpers"

import type {
    GameDetail,
    GameCategory,
    LbsResponse,
} from "@/types/api"


interface ILDetailProps {
    gameSlug: string
    gameDetail: GameDetail | undefined
    levelSlug: string
    categorySlug: string
    valueSlugs: string[]
    lbData: LbsResponse | undefined
    lbLoading: boolean
    lbError: Error | null | undefined
}

export const ILDetail = ({
    gameSlug,
    gameDetail,
    levelSlug,
    categorySlug,
    valueSlugs,
    lbData,
    lbLoading,
    lbError,
}: ILDetailProps) => {
    const navigate = useNavigate()

    const ilCategories = useMemo(
        () => (gameDetail?.categories ?? []).filter(
            (c) => c.type === "per-level",
        ),
        [gameDetail],
    )

    const levels = gameDetail?.levels ?? []

    // Sets the active category (and variables) to show on the UI
    // AND also update the URL.
    const activeCategory: GameCategory | undefined =
        useMemo(
            () => ilCategories.find(
                (c) => c.slug === categorySlug,
            ),
            [ilCategories, categorySlug],
        )

    const applicableVariables = useMemo(
        () => activeCategory
            ? getApplicableVariables(activeCategory)
            : [],
        [activeCategory],
    )

    useEffect(() => {
        if (ilCategories.length === 0) return

        const targetCat = categorySlug
            ? ilCategories.find(
                (c) => c.slug === categorySlug,
            )
            : ilCategories[0]
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
            gameSlug,
            "ils",
            levelSlug,
            targetCat.slug,
            ...defaultValues,
        ].join("/")}`

        navigate(path, { replace: true })
    }, [
        ilCategories, categorySlug,
        valueSlugs, gameSlug,
        levelSlug, navigate,
    ])

    const handleLevelChange = (
        newLevelSlug: string,
    ) => {
        const firstCat = ilCategories[0]
        const catSlug = firstCat?.slug || ""
        const vars = firstCat
            ? getApplicableVariables(firstCat)
            : []
        const defaultValues = vars
            .map((v) => v.values[0]?.slug || "")
            .filter(Boolean)

        navigate(`/${[
            gameSlug,
            "ils",
            newLevelSlug,
            catSlug,
            ...defaultValues,
        ].join("/")}`)
    }

    const handleCategoryChange = (
        newCatSlug: string,
    ) => {
        const cat = ilCategories.find(
            (c) => c.slug === newCatSlug,
        )
        const vars = cat
            ? getApplicableVariables(cat)
            : []
        const defaultValues = vars
            .map((v) => v.values[0]?.slug || "")
            .filter(Boolean)

        navigate(`/${[
            gameSlug,
            "ils",
            levelSlug,
            newCatSlug,
            ...defaultValues,
        ].join("/")}`)
    }

    const handleValueChange = (
        groupIndex: number,
        newValueSlug: string,
    ) => {
        const updated = applicableVariables.map(
            (variable, i) => {
                if (i === groupIndex) {
                    return newValueSlug
                }
                return (
                    valueSlugs[i]
                    || variable.values[0]?.slug
                    || ""
                )
            },
        )
        navigate(`/${[
            gameSlug,
            "ils",
            levelSlug,
            categorySlug,
            ...updated,
        ].join("/")}`)
    }

    const runs = lbData?.runs ?? []
    const [showHistory, setShowHistory] = useState(false)
    const [showSubmit, setShowSubmit] = useState(false)
    const { isAuthenticated, player } = useAuth()

    const activeLevel = useMemo(
        () => levels.find((lvl) => lvl.slug === levelSlug) ?? null,
        [levels, levelSlug],
    )

    if (!categorySlug) {
        return (
            <div className={cn(
                "flex items-center",
                "justify-center p-12",
            )}>
                <div className="text-muted-foreground">
                    Loading...
                </div>
            </div>
        )
    }

    return (
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
                <div className="w-full max-w-xs">
                    <Select
                        value={levelSlug}
                        onValueChange={
                            handleLevelChange
                        }
                    >
                        <SelectTrigger
                            className="h-9 text-sm"
                        >
                            <SelectValue
                                placeholder="Select level"
                            />
                        </SelectTrigger>
                        <SelectContent
                            className="max-h-72"
                        >
                            {levels.map((lvl) => (
                                <SelectItem
                                    key={lvl.id}
                                    value={lvl.slug}
                                    className="truncate"
                                >
                                    {lvl.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {ilCategories.length > 1 && (
                    <Tabs
                        value={categorySlug}
                        onValueChange={
                            handleCategoryChange
                        }
                    >
                        <TabsList className={cn(
                            "flex flex-wrap gap-1",
                            "bg-muted/20 p-1",
                            "rounded-md",
                        )}>
                            {ilCategories.map(
                                (cat) => (
                                <TabsTrigger
                                    key={cat.id}
                                    value={cat.slug}
                                    className={cn(
                                        "px-3 py-1",
                                        "rounded-sm",
                                        "text-xs",
                                        "data-[state=active]:bg-background",
                                        "data-[state=active]:shadow",
                                    )}
                                >
                                    {cat.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                )}

                <div className="flex items-start gap-3">
                    <div className="flex-1">
                        {activeCategory && (
                            <VariableToggles
                                variables={
                                    applicableVariables
                                }
                                valueSlugs={valueSlugs}
                                onValueChange={
                                    handleValueChange
                                }
                            />
                        )}
                    </div>
                    {isAuthenticated && (
                        <span
                            title={
                                !player?.has_src_key
                                    ? "A valid SRC API Key is required to submit runs"
                                    : undefined
                            }
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowSubmit(true)}
                                disabled={!player?.has_src_key}
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
                    gameSlug={gameSlug}
                    categorySlug={categorySlug}
                    levelSlug={levelSlug}
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
                    && categorySlug && (
                    <LeaderboardTable
                        runs={runs}
                        expectedPlayers={
                            activeCategory?.players
                        }
                    />
                )}
            </div>

            {isAuthenticated && activeCategory && gameDetail && activeLevel && (
                <SubmitRunDialog
                    open={showSubmit}
                    onOpenChange={setShowSubmit}
                    gameDetail={gameDetail}
                    activeCategory={activeCategory}
                    valueSlugs={valueSlugs}
                    activeLevel={activeLevel}
                />
            )}
        </div>
    )
}
