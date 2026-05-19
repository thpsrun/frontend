import { useQuery } from "@tanstack/react-query"
import type { GameModerator } from "@/types/moderators"
import { queryKeys } from "@/lib/query-keys"
import { listGameModeratorsFn } from "./moderators-api"

export function useGameModerators(slug: string | undefined) {
    return useQuery<GameModerator[], Error>({
        queryKey: queryKeys.games.moderators(slug ?? ""),
        queryFn: ({ signal }) => listGameModeratorsFn(slug!, signal),
        enabled: !!slug,
    })
}
