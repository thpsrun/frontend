import type { TimingMethodType } from "./shared"

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
    primary_method_override: TimingMethodType | null
    resolved_primary_method: TimingMethodType
    resolved_allowed_methods: TimingMethodType[]
    resolved_required_methods: TimingMethodType[]
    resolved_optional_methods: TimingMethodType[]
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


export interface MissingTimingMethodsIssue {
    type: "missing_timing_methods"
    methods: TimingMethodType[]
}

export interface InvalidVideoHostIssue {
    type: "invalid_video_host"
    url: string
}

export interface UnknownImportIssue {
    type: string
}

export type ImportIssue =
    | MissingTimingMethodsIssue
    | InvalidVideoHostIssue
    | UnknownImportIssue

// Utilized on /api/v1/auth/submissions
export type VidStatus = "new" | "verified" | "rejected" | "review"
export interface PendingRun {
    id: string
    runtype: string
    place: number
    points: number
    obsolete: boolean
    arch_video: string | null
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
    vid_status: VidStatus
    review_notes: string
    description: string | null
    src_sync: SrcSyncEntry[]
    import_issues: ImportIssue[]
    has_import_issues: boolean
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
export interface ReviewGameGroup {
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
    review_groups: ReviewGameGroup[] | null
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

// Utilized on POST /api/v1/auth/submissions/{runId}/review
export interface SendBackForReviewRequest {
    notes: string
}

// Utilized on POST /api/v1/auth/submissions/{runId}/review
export interface SendBackForReviewResponse {
    run_id: string
    vid_status: "review"
    review_notes: string
    message: string
}

// Utilized on POST /api/v1/auth/submissions/{runId}/resubmit
export interface ResubmitRunResponse {
    run_id: string
    vid_status: "new"
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

// Utilized on PUT /api/v1/runs/{id}
// Time fields are sent as numeric *_secs only; the backend formats the
// display strings (time/timenl/timeigt) canonically from those.
export interface RunUpdateRequest {
    category_id?: string
    level_id?: string | null
    runtype?: "main" | "il"
    time_secs?: number | null
    timenl_secs?: number | null
    timeigt_secs?: number | null
    video?: string | null
    arch_video?: string | null
    platform_id?: string
    description?: string | null
    emulated?: boolean
    date?: string | null
    url?: string | null
    variable_values?: Record<string, string> | null
    primary_method_override?: TimingMethodType | null
}

// Utilized on PUT /api/v1/runs/{id}
export interface RunUpdateResponse {
    id: string
    runtype: "main" | "il"
    place: number
    obsolete: boolean
}
