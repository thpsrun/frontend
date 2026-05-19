import type { TimingMethodType } from "./shared"

// Utilized on /api/v1/runs/all and /api/v1/runs/{id}
export interface RunTimes {
    time: string
    time_secs: number
    timenl: string | null
    timenl_secs: number | null
    timeigt: string | null
    timeigt_secs: number | null
    p_time: string
    p_time_secs: number
    primary_method_override: TimingMethodType | null
    resolved_primary_method: TimingMethodType
    resolved_required_methods: TimingMethodType[]
}

// Embedded shapes returned when ?embed=game,category,level is used.
export interface RunGameEmbed {
    id: string
    name: string
    slug: string
    release: string | null
    boxart: string | null
    twitch: string | null
    defaulttime: TimingMethodType | null
    idefaulttime: TimingMethodType | null
    pointsmax: number
    ipointsmax: number
    required_methods_fg: TimingMethodType[]
    required_methods_il: TimingMethodType[]
}

export interface RunCategoryEmbed {
    id: string
    name: string
    slug: string
    type: string
    url: string | null
    rules: string | null
    appear_on_main: boolean
    archive: boolean
}

export interface RunLevelEmbed {
    id: string
    name: string
    slug: string
}

export interface RunPlayer {
    id: string
    name: string
    url: string | null
    country: string | null
    pronouns: string | null
    twitch: string | null
    youtube: string | null
    twitter: string | null
    bluesky: string | null
}

export type RunType = "main" | "il"
export type RunStatus = "verified" | "new" | "rejected"

export interface RunVariableEmbedEntry {
    variable: {
        id: string
        name: string
        slug: string
        scope: string
    }
    value: {
        value: string
        name: string
        slug: string
    }
}

// Utilized on /api/v1/runs/all
export interface Run {
    id: string
    runtype: RunType
    place: number
    points: number
    obsolete: boolean
    subcategory: string | null
    times: RunTimes
    platform: string | null
    emulated: boolean
    description: string | null
    video: string | null
    arch_video: string | null
    date: string
    v_date: string | null
    url: string | null
    game: string | RunGameEmbed
    category: string | RunCategoryEmbed | null
    level: string | RunLevelEmbed | null
    players: RunPlayer[]
    variables: Record<string, string> | RunVariableEmbedEntry[]
    bonus?: number
}

// Utilized on /api/v1/runs/all
export interface AllRunsParams {
    game_id?: string
    category_id?: string
    level_id?: string
    player_id?: string
    runtype?: RunType
    place?: number
    status?: RunStatus
    search?: string
    embed?: string
    limit?: number
    offset?: number
}
