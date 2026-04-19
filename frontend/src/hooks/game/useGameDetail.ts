import { useQuery } from "@tanstack/react-query"
import type { UseQueryOptions } from "@tanstack/react-query"

import type { GameDetail } from "@/types/api"
import { apiFetch } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"

type QueryOptions = Omit<
    UseQueryOptions<GameDetail, Error>,
    "queryKey" | "queryFn"
>

const fetchGameDetail = (
    gameSlug: string,
    signal?: AbortSignal,
): Promise<GameDetail> => {
    if (!gameSlug) throw new Error("gameSlug required")
    const path = `/games/${encodeURIComponent(gameSlug)}`
        + `?embed=categories,levels,platforms`
    return apiFetch<GameDetail>(path, { signal })
}

export const useGameDetail = (
    gameSlug: string,
    options?: QueryOptions,
) => {
    const enabled = !!gameSlug && (options?.enabled ?? true)

    return useQuery<GameDetail, Error>({
        queryKey: queryKeys.games.detail(gameSlug),
        queryFn: ({ signal }) => fetchGameDetail(gameSlug, signal),
        staleTime: 5 * 60 * 1000,
        ...options,
        enabled,
    })
}
