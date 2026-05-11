export type ReorderScope = "category" | "level" | "variable_value"

export type VisibilityTargetType = "category" | "variable_value"

export interface DisplayItem {
    id: string
    name: string
    order: number
    appear_on_main: boolean | null
}

export interface VariableGroup {
    variable_id: string
    variable_name: string
    values: DisplayItem[]
}

export interface GameDisplayResponse {
    game_id: string
    game_name: string
    categories: DisplayItem[]
    levels: DisplayItem[]
    variable_groups: VariableGroup[]
    page_loaded_at: string
}

export interface ReorderRequest {
    scope: ReorderScope
    ordered_ids: string[]
    var_id: string | null
}

export interface VisibilityRequest {
    target_type: VisibilityTargetType
    target_id: string
    value: boolean
}
