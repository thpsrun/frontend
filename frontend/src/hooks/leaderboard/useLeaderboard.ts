import { useQuery } from "@tanstack/react-query"
import type { UseQueryOptions } from "@tanstack/react-query"

import type { LbsResponse } from "@/types/api"
import { apiFetch } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"

export interface UseLeaderboardParams {
    gameSlug: string
    categorySlug: string
    valueSlugs: string[]
}

type QueryOptions = Omit<
    UseQueryOptions<LbsResponse, Error>,
    "queryKey" | "queryFn"
>

const fetchLeaderboard = (
    { gameSlug, categorySlug, valueSlugs }: UseLeaderboardParams,
    signal?: AbortSignal,
): Promise<LbsResponse> => {
    if (!gameSlug) throw new Error("gameSlug required")
    if (!categorySlug) throw new Error("categorySlug required")

    const qs = new URLSearchParams()
    if (valueSlugs.length > 0) {
        qs.set("values", valueSlugs.join(","))
    }
    qs.set("embed", "stats,recent")

    const path = `/website/lbs`
        + `/${encodeURIComponent(gameSlug)}`
        + `/category/${encodeURIComponent(categorySlug)}`
        + `?${qs.toString()}`

    return apiFetch<LbsResponse>(path, { signal })
}

export const useLeaderboard = (
    params: UseLeaderboardParams,
    options?: QueryOptions,
) => {
    const enabled = !!params.gameSlug
        && !!params.categorySlug
        && (options?.enabled ?? true)

    return useQuery<LbsResponse, Error>({
        queryKey: queryKeys.leaderboard.full({
            gameSlug: params.gameSlug,
            categorySlug: params.categorySlug,
            valueSlugs: params.valueSlugs,
        }),
        queryFn: ({ signal }) => fetchLeaderboard(params, signal),
        refetchInterval: 120 * 1000,
        ...options,
        enabled,
    })
}
