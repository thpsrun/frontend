import { useQuery } from "@tanstack/react-query"
import type { UseQueryOptions } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type { RunDetail } from "@/types/api"

type QueryOptions = Omit<
    UseQueryOptions<RunDetail, Error>,
    "queryKey" | "queryFn"
>

const fetchRun = (
    runId: string,
    signal?: AbortSignal,
): Promise<RunDetail> => {
    if (!runId) throw new Error("runId required")
    return apiFetch<RunDetail>(
        `/runs/${encodeURIComponent(runId)}`,
        { signal },
    )
}

export const useRun = (runId: string, options?: QueryOptions) => {
    const enabled = !!runId && (options?.enabled ?? true)

    return useQuery<RunDetail, Error>({
        queryKey: queryKeys.runs.detail(runId),
        queryFn: ({ signal }) => fetchRun(runId, signal),
        staleTime: 60 * 1000,
        ...options,
        enabled,
    })
}
