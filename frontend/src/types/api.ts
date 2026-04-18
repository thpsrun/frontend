// Utilized on /api/v1/games/all
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

// Shared embedded sub-types used across multiple endpoints - not endpoint-specific
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
    game: string
    category: string
    level: string | null // ILs obviously have levels, full games don't.
    subcategory: string
    place: number
    lb_count: number
    players: Player[]
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

// Utilized on /api/v1/games/{gameSlug}?embed=categories,levels,platforms
// Nested under GameCategory and GameLevel variable definitions.
export interface CategoryVariableValue {
    value: string
    name: string
    slug: string
    appear_on_main: boolean
    order: number
    archive: boolean
    rules: string | null
}

// Utilized on /api/v1/games/{gameSlug}?embed=categories,levels,platforms
export interface CategoryVariable {
    id: string
    name: string
    slug: string
    scope: string
    archive: boolean
    values: CategoryVariableValue[]
}

// Utilized on /api/v1/games/{gameSlug}?embed=categories,levels,platforms
export interface GameCategory {
    id: string
    name: string
    slug: string
    type: "per-game" | "per-level"
    url: string
    rules: string | null
    appear_on_main: boolean
    archive: boolean
    players: number
    variables: CategoryVariable[]
}

// Utilized on /api/v1/games/{gameSlug}?embed=categories,levels,platforms
export interface GameLevel {
    id: string
    name: string
    slug: string
    url: string
    rules: string | null
    variables: CategoryVariable[]
}

// Utilized on /api/v1/website/main?embed=latest-wrs,latest-pbs,records
export interface MainPlayer {
    name: string
    nickname: string | null
    country: { id: string; name: string; flag: string | null } | null
}

// Utilized on /api/v1/website/main?embed=latest-wrs,latest-pbs
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

// Utilized on /api/v1/website/main?embed=records
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

// Utilized on /api/v1/website/main?embed=streamers
export interface Streamer {
    id: string
    name: string
    url: string
}

// Utilized on /api/v1/players/{playerName}?embed=country,awards,profile,stats
export interface PlayerAward {
    name: string
    description: string | null
    image: string | null
}

// Utilized on /api/v1/players/{playerName}?embed=country,awards,profile,stats
// Used for the runs within a player's fg[] and il[] arrays from that endpoint.
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
    obsolete?: boolean
}

// Utilized on /api/v1/players/{playerName}?embed=country,awards,profile,stats
export interface PlayerCountry {
    id: string
    name: string
    flag: string | null
}

// Shared gradients embed used across player-related endpoints
export interface GradientsEmbed {
    gradient_1: string | null
    gradient_2: string | null
    gradient_3: string | null
}

// Utilized on /api/v1/players/{playerName}
export interface PlayerInfoEmbed {
    name: string
    nickname: string | null
    pronouns: string | null
    country: PlayerCountry | null
    pfp: string | null
    ex_stream: boolean
}

// Utilized on /api/v1/players/{playerName}
export interface PlayerSocialsEmbed {
    twitch: string | null
    youtube: string | null
    twitter: string | null
    bluesky: string | null
    discord: string | null
    therun_gg: string | null
}

// Utilized on /api/v1/players/{playerName}
export interface PlayerCustomizationsEmbed {
    gradient_1: string | null
    gradient_2: string | null
    gradient_3: string | null
    tagline: string | null
    profile_bg: string | null
}

// Utilized on /api/v1/players/{playerName}
export interface PlayerStatsEmbed {
    total_runs: number | null
    fg_points: number | null
    il_points: number | null
    awards: PlayerAward[] | null
}

// Utilized on /api/v1/players/{playerName}
export interface PlayerRunsEmbed {
    fg: PlayerRun[] | null
    il: PlayerRun[] | null
}

// Utilized on /api/v1/players/{playerName}
export interface PlayerModerationEmbed {
    moderated_games: { id: string; name: string; slug: string }[] | null
}

// Utilized on /api/v1/players/{playerName}
export interface PlayerResponse {
    id: string
    url: string
    joined: string | null
    player: PlayerInfoEmbed
    socials: PlayerSocialsEmbed
    customizations: PlayerCustomizationsEmbed
    stats: PlayerStatsEmbed
    runs: PlayerRunsEmbed
    moderation: PlayerModerationEmbed
}

// Utilized on point leaderboard endpoints
export interface PointLeaderboardEntry {
    rank: number
    player_id: string
    player_name: string
    player_url: string
    player_pfp: string | null
    total_points: number
    fg_points: number
    il_points: number
    gradients: GradientsEmbed | null
}

// Utilized on /api/v1/website/main
// Union response since it depends on ?embed= query parameters.
export interface ApiResponse {
    latest_wrs?: LatestRun[]
    latest_pbs?: LatestRun[]
    latest?: Run[]
    new_runs?: Run[]
    records?: RecordRun[]
    streamers?: Streamer[]
    runs?: Run[]
}

// Utilized on /api/v1/games/{gameSlug}?embed=categories,levels,platforms
export interface GamePlatform {
    id: string
    name: string
    slug: string
}

// Utilized on /api/v1/games/{gameSlug}?embed=categories,levels,platforms
export interface GameDetail extends Game {
    categories: GameCategory[]
    levels: GameLevel[]
    platforms: GamePlatform[]
}

// Utilized on /api/v1/website/lbs/{gameSlug}/
// Lightweight player shape used in leaderboard run entries.
export interface LbsPlayer {
    name: string
    country: { id: string; name: string; flag: string | null } | null
    gradients?: GradientsEmbed | null
}

// Utilized on /api/v1/website/lbs/{gameSlug}/
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

// Utilized on /api/v1/website/lbs/{gameSlug}/
export interface LbsRecentRun {
    runtype: string
    category: string
    subcategory: string
    level: string | null
    p_time: string
    p_time_secs: number
    place: number
    player_name: string
    player_country: { id: string; name: string; flag: string | null } | null
    v_date: string
    url: string | null
    video: string | null
    arch_video: string | null
    value_slugs: string[] | null
}

// Utilized on /api/v1/website/lbs/{gameSlug}/
export interface LbsStats {
    main_count: number
    il_count: number
    player_count: number
}

// Utilized on /api/v1/website/lbs/{gameSlug}/category/{categorySlug}
// Also used for /api/v1/website/lbs/{gameSlug}/level/{levelSlug}/{categorySlug}
export interface LbsResponse {
    runs: LbsRun[]
    stats: LbsStats
    recent: LbsRecentRun[]
}

// Utilized on /api/v1/website/lbs/{gameSlug}/levels
export interface ILOverviewCategory {
    name: string
    slug: string
    runs: LbsRun[]
}

// Utilized on /api/v1/website/lbs/{gameSlug}/levels
export interface ILOverviewLevel {
    name: string
    slug: string
    categories: ILOverviewCategory[]
}

// Utilized on /api/v1/website/lbs/{gameSlug}/levels
export interface ILOverviewResponse {
    levels: ILOverviewLevel[]
    stats: LbsStats
    recent: LbsRecentRun[]
}

// Utilized on /api/v1/website/navbar
export interface NavItem {
    name: string
    url: string | null
    children: NavItem[]
}

// Utilized on /api/v1/website/navbar
export interface SocialLink {
    platform: string
    url: string
}

// Utilized on /api/v1/website/navbar
export interface NavbarResponse {
    nav: NavItem[]
    social: SocialLink[]
}

// Utilized on /api/v1/history/{gameSlug}/category/{categorySlug}
// Also used for /api/v1/history/{gameSlug}/level/{levelSlug}/{categorySlug}
export interface WRHistoryPlayer {
    name: string
    nickname: string | null
}

// Utilized on /api/v1/history/{gameSlug}/...
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

// Utilized on /api/v1/history/{gameSlug}/category/{categorySlug}
// Also used for /api/v1/history/{gameSlug}/level/{levelSlug}/{categorySlug}
export interface WRHistoryResponse {
    game: string
    category: string
    subcategory: string
    level: string | null
    entries: WRHistoryEntry[]
}
