export interface BotSessionResponse {
    status: string
    validated_at: string | null
    last_refresh_attempt_at: string | null
    v2_enabled_override: boolean | null
    v2_effective_enabled: boolean
    disabled_by_circuit_breaker: boolean
    last_severe_error_at: string | null
    last_severe_error_category: string
    queued_edit_count: number
    failed_edit_count: number
}

export interface KillSwitchRequest {
    override: boolean | null
}

export interface KillSwitchResponse {
    v2_enabled_override: boolean | null
    v2_effective_enabled: boolean
    disabled_by_circuit_breaker: boolean
    replay_queued_count: number
}
