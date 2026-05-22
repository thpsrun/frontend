import type {
    CategoryVariableValue,
    GameCategory,
    GameDetail,
    GameLevel,
} from "@/types/api"

export interface RulesSection {
    kind: "game" | "category" | "level" | "value"
    label: string
    title: string
    body: string
}

export interface RulesView {
    sections: RulesSection[]
    hasAny: boolean
}

export interface ActiveSelection {
    category: GameCategory | undefined
    level: GameLevel | undefined
    values: Record<string, CategoryVariableValue | undefined>
}

function nonEmpty(s: string | null | undefined): s is string {
    return typeof s === "string" && s.trim().length > 0
}

export function buildActiveSelection(
    activeCategory: GameCategory | undefined,
    activeLevel: GameLevel | undefined | null,
    valueSlugs: string[],
): ActiveSelection {
    const values: Record<string, CategoryVariableValue | undefined> = {}

    if (activeCategory) {
        const vars = activeCategory.variables.filter(
            (v) => !v.archive,
        )
        vars.forEach((variable, i) => {
            const slug = valueSlugs[i]
            const matched = variable.values.find(
                (val) => val.slug === slug,
            )
            values[variable.id] = matched
        })
    }

    return {
        category: activeCategory,
        level: activeLevel ?? undefined,
        values,
    }
}

export function buildRulesSections(
    game: GameDetail,
    active: ActiveSelection,
): RulesView {
    const sections: RulesSection[] = []

    if (nonEmpty(game.rules)) {
        sections.push({
            kind: "game",
            label: "Game",
            title: game.name,
            body: game.rules,
        })
    }

    if (active.category && nonEmpty(active.category.rules)) {
        sections.push({
            kind: "category",
            label: "Category",
            title: active.category.name,
            body: active.category.rules,
        })
    }

    if (active.level && nonEmpty(active.level.rules)) {
        sections.push({
            kind: "level",
            label: "Level",
            title: active.level.name,
            body: active.level.rules,
        })
    }

    if (active.category) {
        const vars = active.category.variables.filter(
            (v) => !v.archive,
        )
        for (const variable of vars) {
            const value = active.values[variable.id]
            if (value && nonEmpty(value.rules)) {
                sections.push({
                    kind: "value",
                    label: variable.name,
                    title: value.name,
                    body: value.rules,
                })
            }
        }
    }

    return { sections, hasAny: sections.length > 0 }
}
