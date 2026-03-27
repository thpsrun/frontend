// API types — organized by endpoint origin

export interface Game {
    id: string
    name: string
    slug: string
    release: string
    boxart: string
    twitch: string
    defaulttime: string
    idefaulttime: string
    pointsmax: number
    ipointsmax: number
}

// Shared embedded sub-types used across multiple endpoints
export interface Award {
    name: string
}

export interface Player {
    id: string
    name: string
    nickname?: string | null
    url: string
    pfp?: string | null
    country: string
    pronouns?: string | null
    twitch?: string | null
    youtube?: string | null
    twitter?: string | null
    ex_stream: boolean
    awards: Award[]
    // Homepage endpoint uses main_pts/il_pts naming
    // (vs fg_points/il_points on the player profile endpoint)
    stats: {
        total_pts: number
        main_pts: number
        il_pts: number
        total_runs: number
    }
}

export interface Times {
    defaulttime: string
    time: string
    time_secs: number
    timenl: string
    timenl_secs: number
    timeigt: string
    timeigt_secs: number
}

export interface System {
    // String in compact responses; object when ?embed=platforms
    platform: string | { id: string; name: string }
    emulated: boolean
}

export interface Status {
    vid_status: string
    approver?: string | null
    v_date: string
    obsolete: boolean
}

export interface Videos {
    video: string
    arch_video?: string | null
}

export interface Meta {
    points: number
    url: string
}

export interface Run {
    id: string
    runtype: string
    game: string // Game ID as string for basic runs
    category: string // Category ID as string
    level: string | null // Level ID as string or null
    subcategory: string
    place: number
    lb_count: number
    players: Player[] // Array of players for multi-player runs
    date: string
    record: string
    times: Times
    system: System
    status: Status
    videos: Videos
    variables: Record<string, string>
    meta: Meta
    description?: string | null
}

// Category variable value (embedded in game detail categories)
export interface CategoryVariableValue {
    value: string
    name: string
    slug: string
    appear_on_main: boolean
    order: number
    archive: boolean
    rules: string | null
}

// Category variable group (embedded in game detail categories)
export interface CategoryVariable {
    id: string
    name: string
    slug: string
    scope: string
    archive: boolean
    values: CategoryVariableValue[]
}

// Game category (embedded in game detail via ?embed=categories)
export interface GameCategory {
    id: string
    name: string
    slug: string
    type: "per-game" | "per-level"
    url: string
    rules: string | null
    appear_on_main: boolean
    archive: boolean
    variables: CategoryVariable[]
}

// Game level (embedded in game detail via ?embed=levels)
export interface GameLevel {
    id: string
    name: string
    slug: string
    url: string
    rules: string | null
    variables: CategoryVariable[]
}

// Player as returned by main page endpoints (latest_wrs, latest_pbs, records)
export interface MainPlayer {
    name: string
    nickname: string | null
    country: { id: string; name: string } | null
}

// Homepage latest WR/PB (game is a flat slug string)
export interface LatestRun {
    id: string
    game_slug: string
    category: { name: string; slug: string }
    level: { name: string; slug: string } | null
    players: MainPlayer[]
    time: string | null
    date: string | null
    video: string | null
    value_slugs: string[]
}

// Homepage record (game is an object with name for display)
export interface RecordRun {
    id: string
    game: { name: string; slug: string }
    category: { name: string; slug: string }
    level: { name: string; slug: string } | null
    players: MainPlayer[]
    time: string | null
    date: string | null
    video: string | null
    value_slugs: string[]
}

export interface Streamer {
    id: string
    name: string
    url: string
}

export interface PlayerAward {
    name: string
    description: string | null
    image: string | null
}

export interface PlayerRun {
    id: string
    game: { name: string; slug: string }
    category: { name: string; slug: string }
    level: { name: string; slug: string } | null
    subcategory: string
    value_slugs: string[]
    place: number
    points: number
    time: string
    date: string
    video: string | null
    arch_video: string | null
    url: string | null
}

export interface PlayerCountry {
    id: string
    name: string
}

// Player profile endpoint uses fg_points/il_points naming
// (vs main_pts/il_pts on the homepage Player.stats)
export interface PlayerStats {
    total_runs: number
    fg_points: number
    il_points: number
}

export interface PlayerProfile {
    id: string
    name: string
    nickname: string | null
    url: string
    pfp: string | null
    pronouns: string | null
    joined: string | null
    twitch: string | null
    youtube: string | null
    twitter: string | null
    bluesky: string | null
    discord: string | null
    ex_stream: boolean
    country: PlayerCountry | null
    stats: PlayerStats | null
    awards: PlayerAward[]
    fg: PlayerRun[]
    il: PlayerRun[]
}

// All-optional bag of homepage response fields. Not a discriminated
// union, so callers must use optional chaining on each field.
export interface ApiResponse {
    latest_wrs?: LatestRun[]
    latest_pbs?: LatestRun[]
    latest?: Run[]
    new_runs?: Run[]
    records?: RecordRun[]
    streamers?: Streamer[]
    runs?: Run[]
}

// Game Detail (from /api/v1/games/{slug}?embed=platforms)
export interface GamePlatform {
    id: string
    name: string
    slug: string
}

// Game Detail (from /api/v1/games/{slug}?embed=categories,levels,platforms)
export interface GameDetail extends Game {
    categories: GameCategory[]
    levels: GameLevel[]
    platforms: GamePlatform[]
}

// Leaderboard (from /api/v1/website/lbs/{game}/{cat}?values=...&embed=stats,recent)
export interface LbsPlayer {
    name: string
    country: { id: string; name: string } | null
}

export interface LbsRun {
    id: string
    place: number
    points: number
    date: string | null
    url: string | null
    video: string | null
    arch_video: string | null
    level: string | null
    times: { p_time: string | null }
    players: LbsPlayer[]
}

export interface LbsRecentRun {
    runtype: string
    category: string
    subcategory: string
    level: string | null
    p_time: string
    p_time_secs: number
    place: number
    player_name: string
    player_country: { id: string; name: string } | null
    v_date: string
    url: string | null
    video: string | null
    arch_video: string | null
    value_slugs: string[] | null
}

export interface LbsStats {
    main_count: number
    il_count: number
    player_count: number
}

export interface LbsResponse {
    runs: LbsRun[]
    stats: LbsStats
    recent: LbsRecentRun[]
}

// IL Overview (from /api/v1/website/lbs/{game}/levels?embed=stats,recent)
export interface ILOverviewCategory {
    name: string
    slug: string
    runs: LbsRun[]
}

export interface ILOverviewLevel {
    name: string
    slug: string
    categories: ILOverviewCategory[]
}

export interface ILOverviewResponse {
    levels: ILOverviewLevel[]
    stats: LbsStats
    recent: LbsRecentRun[]
}

// Navbar endpoint (/api/v1/website/navbar)
export interface NavItem {
    name: string
    url: string | null
    children: NavItem[]
}

export interface SocialLink {
    platform: string
    url: string
}

export interface NavbarResponse {
    nav: NavItem[]
    social: SocialLink[]
}

// WR History (from /api/v1/history/{game}/category/{cat} or /level/{lvl}/{cat})
export interface WRHistoryPlayer {
    name: string
    nickname: string | null
}

export interface WRHistoryEntry {
    run_id: string
    players: WRHistoryPlayer[]
    history_time: string
    history_time_secs: number
    delta: number | null
    video: string | null
    arch_video: string | null
    start_date: string
    end_date: string | null
}

export interface WRHistoryResponse {
    game: string
    category: string
    subcategory: string
    level: string | null
    entries: WRHistoryEntry[]
}
