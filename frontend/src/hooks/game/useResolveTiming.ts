import { useQuery } from "@tanstack/react-query"

import type { ResolveTimingResponse } from "@/types/api"
import { apiFetch } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"

const fetchTimings = (
    gameSlug: string,
    categoryId: string,
    levelId: string | null,
    valueIds: string[],
    signal?: AbortSignal,
): Promise<ResolveTimingResponse> => {
    const params = new URLSearchParams({ category_id: categoryId })
    if (levelId) params.set("level_id", levelId)
    for (const valueId of valueIds) params.append("value", valueId)
    const path = `/games/${encodeURIComponent(gameSlug)}/timings`
        + `?${params.toString()}`
    return apiFetch<ResolveTimingResponse>(path, { signal })
}

export const useResolveTiming = (
    gameSlug: string,
    categoryId: string,
    levelId: string | null,
    valueIds: string[],
) => {
    const sortedValueIds = [...valueIds].sort()
    const enabled = !!gameSlug && !!categoryId

    return useQuery<ResolveTimingResponse, Error>({
        queryKey: queryKeys.games.timings(
            gameSlug,
            categoryId,
            levelId,
            sortedValueIds,
        ),
        queryFn: ({ signal }) =>
            fetchTimings(gameSlug, categoryId, levelId, sortedValueIds, signal),
        staleTime: 5 * 60 * 1000,
        enabled,
    })
}
