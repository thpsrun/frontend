import { useQuery } from "@tanstack/react-query"
import type { UseQueryOptions } from "@tanstack/react-query"

import type { OverallRankingsResponse } from "@/types/api"
import { apiFetch } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"

type QueryOptions = Omit<
    UseQueryOptions<OverallRankingsResponse, Error>,
    "queryKey" | "queryFn"
>

const fetchOverallRankings = (
    signal?: AbortSignal,
): Promise<OverallRankingsResponse> => {
    return apiFetch<OverallRankingsResponse>(
        "/website/pointslb",
        { signal },
    )
}

export const useOverallRankings = (options?: QueryOptions) => {
    return useQuery<OverallRankingsResponse, Error>({
        queryKey: queryKeys.rankings.overall(),
        queryFn: ({ signal }) => fetchOverallRankings(signal),
        refetchInterval: 120 * 1000,
        ...options,
    })
}
