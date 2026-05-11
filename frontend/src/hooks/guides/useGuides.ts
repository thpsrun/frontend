import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { LIST_EMBED, listGuidesFn } from "./guides-api"
import type { GuideListItem } from "@/types/guides"

interface Options {
    game?: string
    tag?: string
    playerId?: string
    embed?: string
    enabled?: boolean
}

export function useGuides(options: Options = {}) {
    const { game, tag, playerId, embed = LIST_EMBED, enabled = true } = options
    return useQuery<GuideListItem[]>({
        queryKey: queryKeys.guides.list({ game, tag, player_id: playerId, embed }),
        queryFn: ({ signal }) =>
            listGuidesFn({ game, tag, player_id: playerId, embed }, signal),
        enabled,
        staleTime: 60_000,
    })
}
