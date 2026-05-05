import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { DETAIL_EMBED, getGuideFn } from "./guides-api"
import type { Guide } from "@/types/guides"

export function useGuide(slug: string | undefined, embed: string = DETAIL_EMBED) {
    return useQuery<Guide>({
        queryKey: queryKeys.guides.detail(slug ?? "", embed),
        queryFn: ({ signal }) => getGuideFn(slug as string, embed, signal),
        enabled: !!slug,
        staleTime: 60_000,
    })
}
