import { apiFetch } from "@/lib/api-client"
import type {
    AuditEntry,
    AuditListParams,
    AuditListResponse,
} from "@/types/audit"

function buildAuditQuery(params: AuditListParams): string {
    const sp = new URLSearchParams()
    if (params.event_type) {
        for (const t of params.event_type) sp.append("event_type", t)
    }
    if (params.actor_user_id !== undefined) {
        sp.append("actor_user_id", String(params.actor_user_id))
    }
    if (params.target_model) sp.append("target_model", params.target_model)
    if (params.target_id) sp.append("target_id", params.target_id)
    if (params.since) sp.append("since", params.since)
    if (params.until) sp.append("until", params.until)
    if (params.include_payload) sp.append("include_payload", "true")
    if (params.limit !== undefined) sp.append("limit", String(params.limit))
    if (params.offset !== undefined) sp.append("offset", String(params.offset))
    const qs = sp.toString()
    return qs ? `?${qs}` : ""
}

export const fetchGameAuditLog = (
    gameSlug: string,
    params: AuditListParams,
    signal?: AbortSignal,
): Promise<AuditListResponse> =>
    apiFetch<AuditListResponse>(
        `/games/${encodeURIComponent(gameSlug)}/audit${buildAuditQuery(params)}`,
        { signal },
    )

export const fetchGameAuditEntry = (
    gameSlug: string,
    auditId: number,
    signal?: AbortSignal,
): Promise<AuditEntry> =>
    apiFetch<AuditEntry>(
        `/games/${encodeURIComponent(gameSlug)}/audit/${auditId}`,
        { signal },
    )
