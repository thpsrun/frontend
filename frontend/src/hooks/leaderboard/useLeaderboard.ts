import { useQuery } from "@tanstack/react-query"
import type { UseQueryOptions } from "@tanstack/react-query"

import type { LbsResponse } from "@/types/api"
import { API_BASE_URL } from "@/constants"

export interface UseLeaderboardParams {
    gameSlug: string
    categorySlug: string
    valueSlugs: string[]
}

type QueryOptions = Omit<
    UseQueryOptions<LbsResponse, Error>,
    "queryKey" | "queryFn"
>

const fetchLeaderboard = async ({
    gameSlug,
    categorySlug,
    valueSlugs,
}: UseLeaderboardParams): Promise<LbsResponse> => {
    if (!gameSlug) throw new Error("gameSlug required")
    if (!categorySlug) throw new Error("categorySlug required")

    const qs = new URLSearchParams()
    if (valueSlugs.length > 0) {
        qs.set("values", valueSlugs.join(","))
    }
    qs.set("embed", "stats,recent")

    const url = `${API_BASE_URL}/website/lbs`
        + `/${encodeURIComponent(gameSlug)}`
        + `/category/${encodeURIComponent(categorySlug)}`
        + `?${qs.toString()}`

    const res = await fetch(url, {
        headers: { "Accept": "application/json" },
    })

    if (!res.ok) {
        throw new Error(`Failed leaderboard (${res.status})`)
    }

    return res.json()
}

export const useLeaderboard = (
    params: UseLeaderboardParams,
    options?: QueryOptions,
) => {
    const enabled = !!params.gameSlug
        && !!params.categorySlug
        && (options?.enabled ?? true)

    return useQuery<LbsResponse, Error>({
        queryKey: [
            "leaderboard",
            params.gameSlug,
            params.categorySlug,
            ...params.valueSlugs,
        ],
        queryFn: () => fetchLeaderboard(params),
        staleTime: 60 * 1000,
        refetchInterval: 120 * 1000,
        retry: 2,
        ...options,
        enabled,
    })
}
