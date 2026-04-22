// Utilized on /api/v1/auth/submissions
export interface SubmissionTimes {
    time: string
    time_secs: number
    timenl: string | null
    timenl_secs: number | null
    timeigt: string | null
    timeigt_secs: number | null
    p_time: string
    p_time_secs: number
}

// Utilized on /api/v1/auth/submissions
export interface SubmissionPlayer {
    id: string
    name: string
    countrycode: string | null
}

// Utilized on /api/v1/auth/submissions
export interface SrcSyncEntry {
    action: "verify" | "reject" | "change_players"
    status: "pending" | "failed"
    attempts: number
    last_error: string | null
    updated_at: string
}

// Utilized on /api/v1/auth/submissions
export interface PendingRun {
    id: string
    runtype: string
    place: number
    points: number
    subcategory: string
    times: SubmissionTimes
    video: string | null
    date: string
    v_date: string | null
    url: string | null
    game: { name: string; slug: string }
    category: { name: string; slug: string }
    level: { name: string; slug: string } | null
    players: SubmissionPlayer[]
    vid_status: string
    description: string | null
    src_sync: SrcSyncEntry[]
}

// Utilized on /api/v1/auth/submissions
export interface ModerationGameGroup {
    game_id: string
    game_name: string
    game_slug: string
    pending_count: number
    pending_runs: PendingRun[]
}

// Utilized on /api/v1/auth/submissions
export interface SubmissionsResponse {
    pending_runs: PendingRun[]
    edit_notice: string
    moderation_queue: ModerationGameGroup[] | null
}

// Utilized on PUT /api/v1/auth/submissions/{runId}/status
export interface VerifyRejectRequest {
    status: "verified" | "rejected"
    reason?: string
}

// Utilized on PUT /api/v1/auth/submissions/{runId}/status
export interface VerifyRejectResponse {
    run_id: string
    status: string
    src_sync_status: string
    message: string
}

// Utilized on PUT /api/v1/auth/submissions/{runId}/players
export interface ChangePlayerEntry {
    rel: "user" | "guest"
    name: string
}

// Utilized on PUT /api/v1/auth/submissions/{runId}/players
export interface ChangePlayersRequest {
    players: ChangePlayerEntry[]
}

// Utilized on PUT /api/v1/auth/submissions/{runId}/players
export interface ChangePlayersResponse {
    run_id: string
    players: SubmissionPlayer[]
    src_sync_status: string
    message: string
}

// Utilized on /api/v1/auth/admin/sync-logs
export interface SyncLogRun {
    id: string
    game_name: string
    game_slug: string
    category_name: string
    level_name: string | null
    url: string
}

// Utilized on /api/v1/auth/admin/sync-logs
export interface SyncLogEntry {
    id: number
    run: SyncLogRun
    action: "verify" | "reject" | "change_players"
    status: "pending" | "synced" | "failed"
    payload: Record<string, unknown>
    moderator_name: string
    attempts: number
    max_attempts: number
    last_error: string | null
    created_at: string
    updated_at: string
}

// Utilized on /api/v1/auth/admin/sync-logs
export interface SyncLogsResponse {
    count: number
    results: SyncLogEntry[]
}

// Utilized on /api/v1/auth/admin/sync-logs
export interface SyncLogsParams {
    status?: "pending" | "synced" | "failed"
    action?: "verify" | "reject" | "change_players"
    game_id?: string
    limit?: number
    offset?: number
}

// Utilized on POST /api/v1/auth/admin/sync-logs/{taskId}/retry
export interface RetryResponse {
    task_id: number
    message: string
}

// Utilized on POST /api/v1/auth/submissions/submit
export interface SubmitPlayerEntry {
    rel: "user" | "guest"
    id: string | null
    name: string | null
}

// Utilized on POST /api/v1/auth/submissions/submit
export interface SubmitRunPayload {
    game_id: string
    category_id: string
    level_id: string | null
    platform_id: string
    emulated: boolean
    players: SubmitPlayerEntry[]
    time: string | null
    timenl: string | null
    timeigt: string | null
    video: string
    comment: string | null
    date: string | null
    variable_values: Record<string, string> | null
}

// Utilized on POST /api/v1/auth/submissions/submit
export interface SubmitRunResponse {
    run_id: string
    src_url: string
    vid_status: string
    message: string
}

// Utilized on /api/v1/players/search?q={query}&limit=10
export interface PlayerSearchResult {
    id: string
    name: string
    nickname: string | null
    country_id: string | null
}
