// Types for the Submissions Hub and Admin Hub API endpoints

// --- Shared sub-types ---

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

export interface SubmissionPlayer {
    id: string
    name: string
    countrycode: string | null
}

export interface SrcSyncEntry {
    action: "verify" | "reject" | "change_players"
    status: "pending" | "failed"
    attempts: number
    last_error: string | null
    updated_at: string
}

// --- GET /auth/submissions ---

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

export interface ModerationGameGroup {
    game_id: string
    game_name: string
    game_slug: string
    pending_count: number
    pending_runs: PendingRun[]
}

export interface SubmissionsResponse {
    pending_runs: PendingRun[]
    edit_notice: string
    moderation_queue: ModerationGameGroup[] | null
}

// --- PUT /auth/submissions/{run_id}/status ---

export interface VerifyRejectRequest {
    status: "verified" | "rejected"
    reason?: string
}

export interface VerifyRejectResponse {
    run_id: string
    status: string
    src_sync_status: string
    message: string
}

// --- PUT /auth/submissions/{run_id}/players ---

export interface ChangePlayerEntry {
    rel: "user" | "guest"
    name: string
}

export interface ChangePlayersRequest {
    players: ChangePlayerEntry[]
}

export interface ChangePlayersResponse {
    run_id: string
    players: SubmissionPlayer[]
    src_sync_status: string
    message: string
}

// --- GET /auth/admin/sync-logs ---

export interface SyncLogRun {
    id: string
    game_name: string
    game_slug: string
    category_name: string
    level_name: string | null
    url: string
}

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

export interface SyncLogsResponse {
    count: number
    results: SyncLogEntry[]
}

export interface SyncLogsParams {
    status?: "pending" | "synced" | "failed"
    action?: "verify" | "reject" | "change_players"
    game_id?: string
    limit?: number
    offset?: number
}

// --- POST /auth/admin/sync-logs/{task_id}/retry ---

export interface RetryResponse {
    task_id: number
    message: string
}
