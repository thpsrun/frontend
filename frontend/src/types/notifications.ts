export type NotificationTargetType = "run" | "game" | "api_key" | (string & {})

export type NotificationKind =
    | "run_approved"
    | "run_denied"
    | "mod_promoted"
    | "api_key_expiring"
    | "run_review"
    | "run_awaiting_review"
    | "user_data_export"
    | "user_data_export_ready"
    | "user_data_export_failed"
    | (string & {})

export interface RunPayload {
    run_id: string
    game_id: string
    game_name: string
    category_name: string
}

export interface AwaitingReviewPayload extends RunPayload {
    player_names: string[]
}

export interface ModPromotedPayload {
    game_id: string
    game_name: string
    promoted_by_user_id: number | string | null
    promoted_by_username: string
}

export interface ApiKeyExpiringPayload {
    api_key_id: string
    key_label: string
    expiry_date: string
    days_until_expiry: number
}

export interface UserDataExportReadyPayload {
    export_id: string
}

export interface UserDataExportFailedPayload {
    export_id: string
    error: string
}

export type NotificationPayload =
    | RunPayload
    | AwaitingReviewPayload
    | ModPromotedPayload
    | ApiKeyExpiringPayload
    | UserDataExportReadyPayload
    | UserDataExportFailedPayload
    | Record<string, unknown>

export interface Notification {
    id: number
    type: NotificationKind
    target_type: NotificationTargetType | null
    target_id: string | null
    title: string
    body: string
    payload: NotificationPayload
    is_read: boolean
    read_at: string | null
    created_at: string
}

export interface NotificationListParams {
    unread_only?: boolean
    types?: NotificationKind[]
    limit?: number
    offset?: number
}

export interface NotificationListResponse {
    count: number
    limit: number
    offset?: number
    items: Notification[]
}

export interface UnreadCountResponse {
    count: number
}

export type NotificationChannel = "in_app" | "email" | (string & {})

export type NotificationChannelState = Record<string, boolean>

export type NotificationChannelUpdate = Partial<Record<string, boolean>>

export interface NotificationPreference {
    kind: NotificationKind
    label: string
    description?: string
    channels: NotificationChannelState
}

export interface NotificationPreferencesResponse {
    preferences: NotificationPreference[]
}

export interface NotificationKindInfo {
    kind: NotificationKind
    label: string
    description?: string
    default_channels?: NotificationChannelState
}

export interface NotificationKindsResponse {
    kinds: NotificationKindInfo[]
}

export type NotificationPreferenceUpdate = Record<string, NotificationChannelUpdate>

export interface ReadByTargetRequest {
    target_type: NotificationTargetType
    target_id: string
}

export interface BulkUpdatedResponse {
    updated: number
}
