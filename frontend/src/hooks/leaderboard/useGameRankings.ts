import { useQuery } from "@tanstack/react-query"
import type { UseQueryOptions } from "@tanstack/react-query"

import type { GameRankingsResponse } from "@/types/api"
import { apiFetch } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"

export interface UseGameRankingsParams {
    gameSlug: string
    withOldest?: boolean
}

type QueryOptions = Omit<
    UseQueryOptions<GameRankingsResponse, Error>,
    "queryKey" | "queryFn"
>

const fetchGameRankings = (
    { gameSlug, withOldest }: UseGameRankingsParams,
    signal?: AbortSignal,
): Promise<GameRankingsResponse> => {
    if (!gameSlug) throw new Error("gameSlug required")

    let path = `/website/pointslb/${encodeURIComponent(gameSlug)}`
    if (withOldest) {
        path += "?embed=oldest-runs"
    }

    return apiFetch<GameRankingsResponse>(path, { signal })
}

export const useGameRankings = (
    params: UseGameRankingsParams,
    options?: QueryOptions,
) => {
    const withOldest = params.withOldest ?? false
    const enabled = !!params.gameSlug && (options?.enabled ?? true)

    return useQuery<GameRankingsResponse, Error>({
        queryKey: queryKeys.rankings.game(params.gameSlug, withOldest),
        queryFn: ({ signal }) => fetchGameRankings(
            { gameSlug: params.gameSlug, withOldest, },
            signal,
        ),
        refetchInterval: 120 * 1000,
        ...options,
        enabled,
    })
}
