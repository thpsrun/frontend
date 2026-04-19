import { useQuery } from "@tanstack/react-query"
import type { Game } from "@/types/api"
import { apiFetch } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"

export const useGames = () => {
    return useQuery<Game[]>({
        queryKey: queryKeys.games.list(),
        queryFn: ({ signal }) => apiFetch<Game[]>("/games/all", { signal }),
        staleTime: 30 * 60 * 1000,
    })
}
