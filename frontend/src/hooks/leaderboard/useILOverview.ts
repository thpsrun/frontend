import { useQuery } from "@tanstack/react-query"
import type { UseQueryOptions } from "@tanstack/react-query"

import type { ILOverviewResponse } from "@/types/api"
import { apiFetch } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"

export interface UseILOverviewParams {
    gameSlug: string
    valueSlugs?: string[]
}

type QueryOptions = Omit<
    UseQueryOptions<ILOverviewResponse, Error>,
    "queryKey" | "queryFn"
>

const fetchILOverview = (
    { gameSlug, valueSlugs }: UseILOverviewParams,
    signal?: AbortSignal,
): Promise<ILOverviewResponse> => {
    if (!gameSlug) throw new Error("gameSlug required")

    const qs = new URLSearchParams()
    if (valueSlugs && valueSlugs.length > 0) {
        qs.set("values", valueSlugs.join(","))
    }
    qs.set("embed", "stats,recent")

    const path = `/website/lbs`
        + `/${encodeURIComponent(gameSlug)}`
        + `/levels?${qs.toString()}`

    return apiFetch<ILOverviewResponse>(path, { signal })
}

export const useILOverview = (
    params: UseILOverviewParams,
    options?: QueryOptions,
) => {
    const enabled = !!params.gameSlug && (options?.enabled ?? true)

    return useQuery<ILOverviewResponse, Error>({
        queryKey: queryKeys.leaderboard.ilOverview({
            gameSlug: params.gameSlug,
            valueSlugs: params.valueSlugs ?? [],
        }),
        queryFn: ({ signal }) => fetchILOverview(params, signal),
        staleTime: 5 * 60 * 1000,
        ...options,
        enabled,
    })
}
