import { useEffect, useMemo } from "react"
import { Label } from "@/components/ui/label"
import { useGameDetail } from "@/hooks/game/useGameDetail"
import { GamePicker } from "./game-picker"
import { CategoryPicker } from "./category-picker"
import { LevelPicker } from "./level-picker"
import { VariablePickers } from "./variable-pickers"
import type {
    Game, GameCategory, GameLevel, CategoryVariable,
} from "@/types/api"

export interface BuilderValue {
    game: Game | null
    category: GameCategory | null
    level: GameLevel | null
    variableValues: Record<string, string>
}

interface Props {
    value: BuilderValue
    onChange: (value: BuilderValue) => void
    disabled?: boolean
}

export function LeaderboardTargetBuilder({
    value,
    onChange,
    disabled,
}: Props) {
    const gameSlug = value.game?.slug ?? ""
    const isPerLevel = value.category?.type === "per-level"

    const gameDetailQuery = useGameDetail(gameSlug, {
        enabled: Boolean(gameSlug),
    })
    const gameDetail = gameDetailQuery.data
    const detailLoading = gameDetailQuery.isLoading
    const detailError = gameDetailQuery.error ?? null

    const categories = useMemo(
        () => (gameDetail?.categories ?? []).filter((c) => !c.archive),
        [gameDetail],
    )
    const levels = gameDetail?.levels ?? []

    const liveCategory = useMemo<GameCategory | null>(() => {
        if (!value.category || !gameDetail) return value.category
        return categories.find((c) => c.id === value.category!.id)
            ?? value.category
    }, [gameDetail, categories, value.category])

    const liveLevel = useMemo<GameLevel | null>(() => {
        if (!value.level || !gameDetail) return value.level
        return levels.find((l) => l.id === value.level!.id) ?? value.level
    }, [gameDetail, levels, value.level])

    // When the fresh game detail lands (or refreshes), swap stale category/level
    // references for the live copies so consumers see the embedded variables.
    useEffect(() => {
        if (liveCategory === value.category && liveLevel === value.level) return
        onChange({
            ...value,
            category: liveCategory,
            level: liveLevel,
        })
    }, [liveCategory, liveLevel, value, onChange])

    const variables = useMemo<CategoryVariable[]>(() => {
        const fromCategory = liveCategory?.variables ?? []
        const fromLevel = isPerLevel ? liveLevel?.variables ?? [] : []
        const merged = [...fromCategory]
        const seen = new Set(fromCategory.map((v) => v.id))
        for (const v of fromLevel) {
            if (!seen.has(v.id)) {
                merged.push(v)
                seen.add(v.id)
            }
        }
        return merged
    }, [liveCategory, liveLevel, isPerLevel])

    function handleGameChange(game: Game | null) {
        onChange({
            game,
            category: null,
            level: null,
            variableValues: {},
        })
    }

    function handleCategoryChange(category: GameCategory | null) {
        onChange({
            ...value,
            category,
            level: category?.type === "per-level" ? value.level : null,
            variableValues: {},
        })
    }

    function handleLevelChange(level: GameLevel | null) {
        onChange({ ...value, level, variableValues: {} })
    }

    function handleVariableValuesChange(next: Record<string, string>) {
        onChange({ ...value, variableValues: next })
    }

    return (
        <div className="space-y-3 rounded-md border border-border/40 bg-muted/10 p-3">
            <div className="space-y-1.5">
                <Label>Game</Label>
                <GamePicker
                    selected={value.game}
                    onSelect={handleGameChange}
                    disabled={disabled}
                />
            </div>

            {value.game && (
                <div className="space-y-1.5">
                    <Label>Category</Label>
                    <CategoryPicker
                        items={categories}
                        isLoading={detailLoading}
                        error={detailError}
                        hasGame
                        selected={value.category}
                        onSelect={handleCategoryChange}
                        disabled={disabled}
                    />
                </div>
            )}

            {isPerLevel && (
                <div className="space-y-1.5">
                    <Label>Level</Label>
                    <LevelPicker
                        items={levels}
                        isLoading={detailLoading}
                        error={detailError}
                        hasGame
                        selected={value.level}
                        onSelect={handleLevelChange}
                        disabled={disabled}
                    />
                </div>
            )}

            {value.category && (!isPerLevel || value.level) && (
                <div className="space-y-1.5 pt-1">
                    <Label>Variables</Label>
                    <VariablePickers
                        variables={variables}
                        values={value.variableValues}
                        onChange={handleVariableValuesChange}
                        disabled={disabled}
                    />
                </div>
            )}
        </div>
    )
}
