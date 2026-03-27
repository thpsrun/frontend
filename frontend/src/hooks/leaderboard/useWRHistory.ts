import {
    useQuery,
    keepPreviousData,
} from "@tanstack/react-query"
import type { UseQueryOptions } from "@tanstack/react-query"

import type { WRHistoryResponse } from "@/types/api"
import { API_BASE_URL } from "@/constants"

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

const fetchWRHistory = async ({
    gameSlug,
    categorySlug,
    levelSlug,
    valueSlugs,
}: UseWRHistoryParams): Promise<WRHistoryResponse> => {
    if (!gameSlug) {
        throw new Error("gameSlug required")
    }
    if (!categorySlug) {
        throw new Error("categorySlug required")
    }

    const qs = new URLSearchParams()
    if (valueSlugs.length > 0) {
        qs.set("values", valueSlugs.join(","))
    }

    // IL: /history/{game}/level/{level}/{cat}
    // FG: /history/{game}/category/{cat}
    const pathSegment = levelSlug
        ? `/level/${encodeURIComponent(levelSlug)}`
            + `/${encodeURIComponent(categorySlug)}`
        : `/category/${encodeURIComponent(categorySlug)}`

    const query = qs.toString()
    const url = `${API_BASE_URL}/history`
        + `/${encodeURIComponent(gameSlug)}`
        + pathSegment
        + (query ? `?${query}` : "")

    const res = await fetch(url, {
        headers: { "Accept": "application/json" },
    })

    if (!res.ok) {
        throw new Error(
            `Failed WR history (${res.status})`,
        )
    }

    return res.json()
}

export const useWRHistory = (
    params: UseWRHistoryParams,
    options?: QueryOptions,
) => {
    const enabled = !!params.gameSlug
        && !!params.categorySlug
        && (options?.enabled ?? true)

    return useQuery<WRHistoryResponse, Error>({
        queryKey: [
            "wr-history",
            params.gameSlug,
            params.categorySlug,
            params.levelSlug ?? null,
            ...params.valueSlugs,
        ],
        queryFn: () => fetchWRHistory(params),
        staleTime: 60 * 1000,
        retry: 2,
        placeholderData: keepPreviousData,
        ...options,
        enabled,
    })
}
