import {
    useQuery, useMutation, useQueryClient,
} from "@tanstack/react-query"
import { apiFetch } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type {
    SyncLogsResponse, SyncLogsParams, RetryResponse,
} from "@/types/submissions"

const fetchSyncLogs = (
    params: SyncLogsParams,
    signal?: AbortSignal,
): Promise<SyncLogsResponse> => {
    const searchParams = new URLSearchParams()
    if (params.status) searchParams.set("status", params.status)
    if (params.action) searchParams.set("action", params.action)
    if (params.game_id) searchParams.set("game_id", params.game_id)
    if (params.limit) searchParams.set("limit", String(params.limit))
    if (params.offset) searchParams.set("offset", String(params.offset))

    const qs = searchParams.toString()
    const path = `/auth/admin/sync-logs${qs ? `?${qs}` : ""}`

    return apiFetch<SyncLogsResponse>(path, { signal })
}

const retryTask = (taskId: number): Promise<RetryResponse> =>
    apiFetch<RetryResponse>(
        `/auth/admin/sync-logs/${taskId}/retry`,
        { method: "POST" },
    )

export function useSyncLogs(
    params: SyncLogsParams = {},
    options: { enabled?: boolean } = {},
) {
    const queryClient = useQueryClient()

    const logsQuery = useQuery({
        queryKey: queryKeys.admin.syncLogs(params),
        queryFn: ({ signal }) => fetchSyncLogs(params, signal),
        staleTime: 30 * 1000,
        refetchInterval: 15 * 1000,
        enabled: options.enabled ?? true,
    })

    const retry = useMutation({
        mutationFn: retryTask,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.admin.syncLogs(),
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
