import { useQuery } from "@tanstack/react-query"
import type { UseQueryOptions } from "@tanstack/react-query"

import type { LbsResponse } from "@/types/api"
import { apiFetch } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"

export interface UseILLeaderboardParams {
    gameSlug: string
    levelSlug: string
    categorySlug: string
    valueSlugs: string[]
}

type QueryOptions = Omit<
    UseQueryOptions<LbsResponse, Error>,
    "queryKey" | "queryFn"
>

const fetchILLeaderboard = (
    {
        gameSlug,
        levelSlug,
        categorySlug,
        valueSlugs,
    }: UseILLeaderboardParams,
    signal?: AbortSignal,
): Promise<LbsResponse> => {
    if (!gameSlug) throw new Error("gameSlug required")
    if (!levelSlug) throw new Error("levelSlug required")
    if (!categorySlug) throw new Error("categorySlug required")

    const qs = new URLSearchParams()
    if (valueSlugs.length > 0) {
        qs.set("values", valueSlugs.join(","))
    }
    qs.set("embed", "stats,recent")

    const path = `/website/lbs`
        + `/${encodeURIComponent(gameSlug)}`
        + `/level/${encodeURIComponent(levelSlug)}`
        + `/${encodeURIComponent(categorySlug)}`
        + `?${qs.toString()}`

    return apiFetch<LbsResponse>(path, { signal })
}

export const useILLeaderboard = (
    params: UseILLeaderboardParams,
    options?: QueryOptions,
) => {
    const enabled = !!params.gameSlug
        && !!params.levelSlug
        && !!params.categorySlug
        && (options?.enabled ?? true)

    return useQuery<LbsResponse, Error>({
        queryKey: queryKeys.leaderboard.il({
            gameSlug: params.gameSlug,
            levelSlug: params.levelSlug,
            categorySlug: params.categorySlug,
            valueSlugs: params.valueSlugs,
        }),
        queryFn: ({ signal }) => fetchILLeaderboard(params, signal),
        refetchInterval: 120 * 1000,
        ...options,
        enabled,
    })
}
