import { useQuery } from "@tanstack/react-query"
import type { UseQueryOptions } from "@tanstack/react-query"

import type { GameDetail } from "@/types/api"
import { API_BASE_URL } from "@/constants"

type QueryOptions = Omit<
    UseQueryOptions<GameDetail, Error>,
    "queryKey" | "queryFn"
>

const fetchGameDetail = async (
    gameSlug: string,
): Promise<GameDetail> => {
    if (!gameSlug) throw new Error("gameSlug required")

    const res = await fetch(
        `${API_BASE_URL}/games/${encodeURIComponent(gameSlug)}`
            + `?embed=categories,levels,platforms`,
        { headers: { "Accept": "application/json" } },
    )

    if (!res.ok) {
        throw new Error(`Failed game detail (${res.status})`)
    }

    return res.json()
}

export const useGameDetail = (
    gameSlug: string,
    options?: QueryOptions,
) => {
    const enabled = !!gameSlug && (options?.enabled ?? true)

    return useQuery<GameDetail, Error>({
        queryKey: ["game-detail", gameSlug],
        queryFn: () => fetchGameDetail(gameSlug),
        staleTime: 5 * 60 * 1000,
        ...options,
        enabled,
    })
}
