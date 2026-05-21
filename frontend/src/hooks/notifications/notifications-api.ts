import { apiFetch } from "@/lib/api-client"
import type {
    Notification,
    NotificationListParams,
    NotificationListResponse,
    NotificationPreferencesResponse,
    NotificationKindsResponse,
    NotificationTargetType,
    UnreadCountResponse,
    BulkUpdatedResponse,
} from "@/types/notifications"

function buildListQuery(params: NotificationListParams): string {
    const sp = new URLSearchParams()
    if (params.unread_only) sp.set("unread_only", "true")
    if (params.types && params.types.length > 0) {
        sp.set("type", params.types.join(","))
    }
    if (typeof params.limit === "number") sp.set("limit", String(params.limit))
    if (typeof params.offset === "number") sp.set("offset", String(params.offset))
    const qs = sp.toString()
    return qs ? `?${qs}` : ""
}

export const listNotificationsFn = (
    params: NotificationListParams = {},
    signal?: AbortSignal,
): Promise<NotificationListResponse> =>
    apiFetch<NotificationListResponse>(
        `/notifications${buildListQuery(params)}`,
        { signal },
    )

export const unreadCountFn = (
    signal?: AbortSignal,
): Promise<UnreadCountResponse> =>
    apiFetch<UnreadCountResponse>("/notifications/unread-count", { signal })

export const markNotificationReadFn = (id: number): Promise<Notification> =>
    apiFetch<Notification>(
        `/notifications/${id}/read`,
        { method: "POST" },
    )

export const deleteNotificationFn = (id: number): Promise<void> =>
    apiFetch<void>(
        `/notifications/${id}`,
        { method: "DELETE" },
    )

export const markAllReadFn = (): Promise<BulkUpdatedResponse> =>
    apiFetch<BulkUpdatedResponse>(
        "/notifications/read-all",
        { method: "POST" },
    )

export const readByTargetFn = (
    target_type: NotificationTargetType,
    target_id: string,
): Promise<BulkUpdatedResponse> =>
    apiFetch<BulkUpdatedResponse>(
        "/notifications/read-by-target",
        {
            method: "POST",
            json: { target_type, target_id },
        },
    )

export const getPreferencesFn = (
    signal?: AbortSignal,
): Promise<NotificationPreferencesResponse> =>
    apiFetch<NotificationPreferencesResponse>(
        "/notifications/preferences",
        { signal },
    )

export const updatePreferencesFn = (
    prefs: Record<string, boolean>,
): Promise<NotificationPreferencesResponse> =>
    apiFetch<NotificationPreferencesResponse>(
        "/notifications/preferences",
        {
            method: "PUT",
            json: { preferences: prefs },
        },
    )

export const listKindsFn = (
    signal?: AbortSignal,
): Promise<NotificationKindsResponse> =>
    apiFetch<NotificationKindsResponse>(
        "/notifications/kinds",
        { signal },
    )
