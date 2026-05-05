import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { LIST_EMBED, listGuidesFn } from "./guides-api"
import type { GuideListItem } from "@/types/guides"

interface Options {
    game?: string
    tag?: string
    embed?: string
    enabled?: boolean
}

export function useGuides(options: Options = {}) {
    const { game, tag, embed = LIST_EMBED, enabled = true } = options
    return useQuery<GuideListItem[]>({
        queryKey: queryKeys.guides.list({ game, tag, embed }),
        queryFn: ({ signal }) =>
            listGuidesFn({ game, tag, embed }, signal),
        enabled,
        staleTime: 60_000,
    })
}
