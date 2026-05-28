import type {
    Country,
    Customizations,
    Gradients,
    ModeratedGame,
    Socials,
    TimingMethodType,
} from "./shared"

// Utilized on /api/v1/games/all
export interface Game {
    id: string
    name: string
    slug: string
    release: string
    boxart: string
    twitch: string
    defaulttime: TimingMethodType
    idefaulttime: TimingMethodType
    pointsmax: number
    ipointsmax: number
    required_methods_fg: TimingMethodType[]
    required_methods_il: TimingMethodType[]
    rules: string | null
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
    defaulttime: TimingMethodType | null
    required_methods: TimingMethodType[] | null
}

// Utilized on /api/v1/games/{gameSlug}?embed=categories,levels,platforms
export interface CategoryVariable {
    id: string
    name: string
    slug: string
    scope: string
    archive: boolean
    values: CategoryVariableValue[]
    defaulttime: TimingMethodType | null
    required_methods: TimingMethodType[] | null
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
    defaulttime: TimingMethodType | null
    required_methods: TimingMethodType[] | null
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

// Utilized on GET /api/v1/games/{slug}/timings
export interface ResolveTimingResponse {
    resolved_required_methods: TimingMethodType[]
    resolved_primary_method: TimingMethodType
}

// Utilized on /api/v1/website/main?embed=latest-wrs,latest-pbs,records
export interface MainPlayer {
    name: string
    nickname: string | null
    country: Country | null
    gradients?: Gradients | null
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

// Utilized on /api/v1/website/main
// Union response since it depends on ?embed= query parameters.
export interface ApiResponse {
    latest_wrs?: LatestRun[]
    latest_pbs?: LatestRun[]
    records?: RecordRun[]
}

// Utilized on /api/v1/streams/live
export interface StreamPlayer {
    id: string
    name: string
    twitch?: string | null
    pfp?: string | null
    gradients?: Gradients | null
}

export interface StreamGame {
    id: string
    name: string
    slug?: string
}

export interface Stream {
    player: StreamPlayer
    game: StreamGame | null
    title: string
    offline_ct: number
    stream_time: string | null
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

// Utilized on /api/v1/players/{playerName}
export interface PlayerInfoEmbed {
    name: string
    nickname: string | null
    pronouns: string | null
    country: Country | null
    pfp: string | null
    ex_stream: boolean
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
    moderated_games: ModeratedGame[] | null
}

// Utilized on /api/v1/players/{playerName}
export interface PlayerResponse {
    id: string
    url: string
    joined: string | null
    player: PlayerInfoEmbed
    socials: Socials
    customizations: Customizations
    stats: PlayerStatsEmbed
    runs: PlayerRunsEmbed
    moderation: PlayerModerationEmbed
}

// Utilized on /api/v1/website/lbs/{gameSlug}/
// Lightweight player shape used in leaderboard run entries.
export interface LbsPlayer {
    name: string
    country: Country | null
    gradients?: Gradients | null
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
    times: {
        time: string
        time_secs: number
        timenl: string | null
        timenl_secs: number | null
        timeigt: string | null
        timeigt_secs: number | null
        p_time: string
        p_time_secs: number
    }
    players: LbsPlayer[]
}

// Utilized on /api/v1/website/lbs/{gameSlug}/
// Player shape embedded in recent-run entries (carries nickname).
export interface LbsRecentPlayer {
    name: string
    nickname: string | null
    country: Country | null
    gradients?: Gradients | null
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
    players: LbsRecentPlayer[]
    v_date: string
    url?: string | null
    video: string | null
    arch_video?: string | null
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

// Player summary embedded in points-leaderboard rows.
// Matches the backend LeaderboardPlayerEmbed shape returned by both
// /website/pointslb and /pointslb/history/...
export interface RankingsPlayer {
    id: string
    name: string
    nickname: string | null
    url: string
    pfp: string | null
    country: Country | null
    gradients?: Gradients | null
}

// Utilized on /api/v1/website/pointslb and /api/v1/website/pointslb/{gameSlug}
// One row of a points-based leaderboard (series-wide or per-game).
export interface RankingsEntry {
    rank: number
    player: RankingsPlayer
    total_points: number
    fg_points: number
    il_points: number
}

// Utilized on /api/v1/website/pointslb/{gameSlug}?embed=oldest-runs
// One entry from the oldest-runs embed: an IL world record sorted by submission age.
// The backend filters to ILs only and caps the list (10 for THPS4, 5 for THPS12/34).
export interface OldestRun {
    player: RankingsPlayer
    game_name: string
    game_slug: string
    category_name: string
    level_name: string | null
    place: number
    time: string
    date: string | null
    days_held: number
}

// Utilized on /api/v1/website/pointslb/{gameSlug}
// The per-game endpoint wraps the entries and may include the oldest-runs embed.
export interface GameRankingsResponse {
    leaderboard: RankingsEntry[]
    oldest_runs?: OldestRun[]
}

// Mode used by the URL/UI for historical leaderboard mode.
export type HistoryMode = "overall" | "monthly" | "yearly"

// Scope discriminator returned by /api/v1/pointslb/history
export type HistoryScope = "all" | "game"

// Utilized on /api/v1/pointslb/history
export interface HistoricalRankingsMeta {
    mode: "cumulative" | "monthly" | "yearly"
    year: number
    month: number
    scope: HistoryScope
    scope_game_id: string | null
    period_start: string
    period_end_exclusive: string
    earliest_possible: string | null
}

// Utilized on /api/v1/pointslb/history
export interface HistoricalRankingsResponse {
    rankings: RankingsEntry[]
    meta: HistoricalRankingsMeta
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

// Utilized on GET /api/v1/runs/{id}
export interface RunDetailTimes {
    time: string | null
    time_secs: number | null
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

export interface RunDetailPlayer {
    id: string
    name: string
    order: number
}

export interface RunDetail {
    id: string
    runtype: "main" | "il"
    place: number
    points: number
    obsolete: boolean
    subcategory: string | null
    platform: string
    times: RunDetailTimes
    video: string | null
    arch_video: string | null
    date: string | null
    v_date: string | null
    url: string | null
    game: string
    category: string
    level: string | null
    players: RunDetailPlayer[]
    variables: Record<string, string>
}
