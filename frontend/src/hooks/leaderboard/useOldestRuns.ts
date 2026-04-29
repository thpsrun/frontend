import { useQuery } from "@tanstack/react-query"
import type { UseQueryOptions } from "@tanstack/react-query"

import type { GameRankingsResponse, OldestRun } from "@/types/api"
import { apiFetch } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"

type QueryOptions = Omit<
    UseQueryOptions<OldestRun[], Error>,
    "queryKey" | "queryFn"
>

const fetchOldestRuns = async (
    gameSlug: string,
    signal?: AbortSignal,
): Promise<OldestRun[]> => {
    const path = `/website/pointslb/${encodeURIComponent(gameSlug)}?embed=oldest-runs`
    const data = await apiFetch<GameRankingsResponse>(path, { signal })
    return data.oldest_runs ?? []
}

export const useOldestRuns = (
    gameSlug: string,
    options?: QueryOptions,
) => {
    const enabled = !!gameSlug && (options?.enabled ?? true)
    return useQuery<OldestRun[], Error>({
        queryKey: queryKeys.rankings.oldestRuns(gameSlug),
        queryFn: ({ signal }) => fetchOldestRuns(gameSlug, signal),
        staleTime: 60_000,
        ...options,
        enabled,
    })
}
