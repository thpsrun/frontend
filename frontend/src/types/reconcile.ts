export type ReconcileScope = "RUN" | "LEADERBOARD" | "GAME" | "SERIES"

export type SourceOfTruth = "SRC" | "THPS_RUN"

export type ReconcileStatus =
    | "PENDING"
    | "IN_PROGRESS"
    | "SUCCEEDED"
    | "FAILED"
    | "CANCELLED"
    | "CANCELLING"

export type ReconcilePhase = "P1" | "P2" | "P3"

export type ReconcileItemAction =
    | "created"
    | "updated"
    | "skipped"
    | "skipped_no_change"
    | "failed"

export const STATUS_LABEL: Record<ReconcileStatus, string> = {
    PENDING: "Pending",
    IN_PROGRESS: "In Progress",
    SUCCEEDED: "Succeeded",
    FAILED: "Failed",
    CANCELLING: "Cancelling",
    CANCELLED: "Cancelled",
}

export const SCOPE_LABEL: Record<ReconcileScope, string> = {
    GAME: "Game",
    LEADERBOARD: "Leaderboard",
    RUN: "Run",
    SERIES: "Series",
}

export const SOURCE_LABEL: Record<SourceOfTruth, string> = {
    SRC: "Speedrun.com",
    THPS_RUN: "thps.run",
}

export interface LeaderboardTarget {
    game_id: string
    category_id: string
    level_id?: string | null
    variable_values?: Record<string, string>
}

export interface ReconcileCounts {
    created?: number
    updated?: number
    skipped?: number
    failed?: number
    [key: string]: number | undefined
}

// POST /api/v1/auth/admin/reconcile
export interface ReconcileRequest {
    scope: ReconcileScope
    source_of_truth?: SourceOfTruth
    target_id?: string | null
    target_descriptor?: LeaderboardTarget | null
}

// JobOut
export interface ReconcileJob {
    id: string
    scope: ReconcileScope
    target_id: string | null
    target_descriptor: Record<string, unknown> | null
    source_of_truth: SourceOfTruth
    status: ReconcileStatus
    phase?: ReconcilePhase | null
    counts: ReconcileCounts
    requested_by: string | null
    created_at: string
    started_at: string | null
    finished_at: string | null
    error_summary: string
    celery_task_id: string
}

// A change-set entry can be either the legacy {old, new} diff shape
// (used by run/leaderboard items) or a flat primitive (used by series_game
// items, where changes is metadata about the imported game).
export type ReconcileChangeValue =
    | { old?: unknown; new?: unknown }
    | string
    | number
    | boolean
    | null

// ItemSummary - included in JobDetailOut.recent_items
export interface ReconcileItemSummary {
    record_type: string
    record_id: string
    action: ReconcileItemAction
    phase?: ReconcilePhase | null
    changes?: Record<string, ReconcileChangeValue>
    error?: string
}

// ItemDetailOut - returned from /reconcile/{job_id}/items
export interface ReconcileItemDetail extends ReconcileItemSummary {
    id: number
    created_at: string
}

// JobDetailOut
export interface ReconcileJobDetail extends ReconcileJob {
    recent_items?: ReconcileItemSummary[]
    breakdown?: Record<string, ReconcileCounts>
}

// JobListOut
export interface ReconcileJobList {
    items: ReconcileJob[]
    total: number
}

// 409 response body from POST /admin/reconcile when a job is already running
// for the same lock key (per-target for GAME/RUN/LEADERBOARD, global for SERIES).
export interface ConflictOut {
    error?: string
    existing_job_id: string
}

// ItemListOut
export interface ReconcileItemList {
    items: ReconcileItemDetail[]
    total: number
}

export interface ReconcileJobsParams {
    status?: ReconcileStatus
    scope?: ReconcileScope
    target_id?: string
    limit?: number
    offset?: number
}

export interface ReconcileItemsParams {
    action?: string
    record_type?: string
    limit?: number
    offset?: number
}
