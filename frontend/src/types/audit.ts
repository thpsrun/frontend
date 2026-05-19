export type AuditEventType =
    | "timing_config_change"
    | "recalc_dispatch"
    | "recalc_board"
    | "run_recalc"
    | "src_sync_attempt"
    | "moderator_added"
    | "moderator_removed"
    | "apikey_revoked"

export const ALL_AUDIT_EVENT_TYPES: ReadonlyArray<AuditEventType> = [
    "timing_config_change",
    "recalc_dispatch",
    "recalc_board",
    "run_recalc",
    "src_sync_attempt",
    "moderator_added",
    "moderator_removed",
    "apikey_revoked",
]

export const EVENT_TYPE_LABEL: Record<AuditEventType, string> = {
    timing_config_change: "Timing change",
    recalc_dispatch: "Recalc dispatched",
    recalc_board: "Board recalc",
    run_recalc: "Run recalc",
    src_sync_attempt: "SRC sync",
    moderator_added: "Mod added",
    moderator_removed: "Mod removed",
    apikey_revoked: "Key revoked",
}

export type AuditEventGroup =
    | "timing"
    | "recalc"
    | "src"
    | "moderators"
    | "keys"

export const EVENT_GROUP_LABEL: Record<AuditEventGroup, string> = {
    timing: "Timing",
    recalc: "Recalcs",
    src: "SRC sync",
    moderators: "Moderators",
    keys: "Keys",
}

export const EVENT_GROUP_TYPES: Record<AuditEventGroup, ReadonlyArray<AuditEventType>> = {
    timing: ["timing_config_change"],
    recalc: ["recalc_dispatch", "recalc_board", "run_recalc"],
    src: ["src_sync_attempt"],
    moderators: ["moderator_added", "moderator_removed"],
    keys: ["apikey_revoked"],
}

export type AuditActorKind = "user" | "api_key" | "system"

export interface TimingConfigChangePayload {
    model: string
    field: string
    previous: unknown
    new: unknown
    recalc_dispatched?: boolean
    rebackfill_dispatched?: boolean
}

export interface RecalcDispatchPayload {
    boards_count: number
    runs_scanned: number
    duration_ms: number
    triggered_by: string
}

export interface RecalcBoardPayload {
    category_id: string
    level_id: string | null
    runtype: string
    variable_value_map: Record<string, string>
    entries_created: number
    runs_processed: number
    runs_updated: number
}

export interface RunRecalcPayload {
    run_id: string
    cause: string
    with_streaks: boolean
}

export interface SrcSyncAttemptPayload {
    run_id: string
    action: string
    status: string
    attempts: number
    error_category: string
    last_error: string
}

export interface ModeratorChangePayload {
    player_id: string
    player_name: string
    user_id: number | null
}

export interface ApiKeyRevokedPayload {
    key_id: number
    key_label: string
    user_id: number | null
    reason: string
    cause: string
}

export type AuditPayload =
    | TimingConfigChangePayload
    | RecalcDispatchPayload
    | RecalcBoardPayload
    | RunRecalcPayload
    | SrcSyncAttemptPayload
    | ModeratorChangePayload
    | ApiKeyRevokedPayload

export interface AuditEntry {
    id: number
    created_at: string
    event_type: AuditEventType
    actor_kind: AuditActorKind
    actor_user_id: number | null
    actor_api_key_id: number | null
    actor_label: string
    actor_username: string | null
    target_app: string | null
    target_model: string | null
    target_id: string | null
    target_repr: string | null
    summary: string
    payload?: AuditPayload
}

export interface AuditListResponse {
    count: number
    results: AuditEntry[]
}

export interface AuditListParams {
    event_type?: AuditEventType[]
    actor_user_id?: number
    target_model?: string
    target_id?: string
    since?: string
    until?: string
    include_payload?: boolean
    limit?: number
    offset?: number
}
