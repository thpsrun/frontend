import { useQuery } from "@tanstack/react-query"
import type { GamePlatform } from "@/types/api"
import { queryKeys } from "@/lib/query-keys"
import { listPlatformsFn } from "./platforms-api"

export function usePlatforms() {
    return useQuery<GamePlatform[], Error>({
        queryKey: queryKeys.games.platforms(),
        queryFn: ({ signal }) => listPlatformsFn(signal),
        staleTime: 30 * 60 * 1000,
    })
}
