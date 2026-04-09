import {
    useQuery, useMutation, useQueryClient,
} from "@tanstack/react-query"
import { API_BASE_URL } from "@/constants"
import { mutationHeaders, handleApiError } from "@/lib/api"
import type {
    SyncLogsResponse, SyncLogsParams, RetryResponse,
} from "@/types/submissions"

async function fetchSyncLogs(
    params: SyncLogsParams,
): Promise<SyncLogsResponse> {
    const searchParams = new URLSearchParams()
    if (params.status) searchParams.set("status", params.status)
    if (params.action) searchParams.set("action", params.action)
    if (params.game_id) searchParams.set("game_id", params.game_id)
    if (params.limit) {
        searchParams.set("limit", String(params.limit))
    }
    if (params.offset) {
        searchParams.set("offset", String(params.offset))
    }

    const qs = searchParams.toString()
    const url = `${API_BASE_URL}/auth/admin/sync-logs${
        qs ? `?${qs}` : ""
    }`

    const res = await fetch(url, { credentials: "include" })
    if (!res.ok) await handleApiError(res, "Failed to load sync logs")
    return res.json()
}

async function retryTask(
    taskId: number,
): Promise<RetryResponse> {
    const res = await fetch(
        `${API_BASE_URL}/auth/admin/sync-logs/${taskId}/retry`,
        {
            method: "POST",
            credentials: "include",
            headers: mutationHeaders(),
        },
    )
    if (!res.ok) await handleApiError(res, "Failed to retry task")
    return res.json()
}

export function useSyncLogs(
    params: SyncLogsParams = {},
    options: { enabled?: boolean } = {},
) {
    const queryClient = useQueryClient()

    const logsQuery = useQuery({
        queryKey: ["admin", "sync-logs", params],
        queryFn: () => fetchSyncLogs(params),
        staleTime: 30 * 1000,
        refetchInterval: 15 * 1000,
        enabled: options.enabled ?? true,
    })

    const retry = useMutation({
        mutationFn: retryTask,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["admin", "sync-logs"],
            })
        },
    })

    return {
        data: logsQuery.data ?? null,
        isLoading: logsQuery.isLoading,
        error: logsQuery.error,
        retry,
    }
}
