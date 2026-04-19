import {
    useQuery,
    keepPreviousData,
} from "@tanstack/react-query"
import type { UseQueryOptions } from "@tanstack/react-query"

import type { WRHistoryResponse } from "@/types/api"
import { apiFetch } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"

export interface UseWRHistoryParams {
    gameSlug: string
    categorySlug: string
    levelSlug?: string
    valueSlugs: string[]
}

type QueryOptions = Omit<
    UseQueryOptions<WRHistoryResponse, Error>,
    "queryKey" | "queryFn"
>

const fetchWRHistory = (
    {
        gameSlug,
        categorySlug,
        levelSlug,
        valueSlugs,
    }: UseWRHistoryParams,
    signal?: AbortSignal,
): Promise<WRHistoryResponse> => {
    if (!gameSlug) throw new Error("gameSlug required")
    if (!categorySlug) throw new Error("categorySlug required")

    const qs = new URLSearchParams()
    if (valueSlugs.length > 0) {
        qs.set("values", valueSlugs.join(","))
    }

    const pathSegment = levelSlug
        ? `/level/${encodeURIComponent(levelSlug)}`
            + `/${encodeURIComponent(categorySlug)}`
        : `/category/${encodeURIComponent(categorySlug)}`

    const query = qs.toString()
    const path = `/history`
        + `/${encodeURIComponent(gameSlug)}`
        + pathSegment
        + (query ? `?${query}` : "")

    return apiFetch<WRHistoryResponse>(path, { signal })
}

export const useWRHistory = (
    params: UseWRHistoryParams,
    options?: QueryOptions,
) => {
    const enabled = !!params.gameSlug
        && !!params.categorySlug
        && (options?.enabled ?? true)

    return useQuery<WRHistoryResponse, Error>({
        queryKey: queryKeys.leaderboard.wrHistory({
            gameSlug: params.gameSlug,
            categorySlug: params.categorySlug,
            levelSlug: params.levelSlug ?? null,
            valueSlugs: params.valueSlugs,
        }),
        queryFn: ({ signal }) => fetchWRHistory(params, signal),
        placeholderData: keepPreviousData,
        ...options,
        enabled,
    })
}
