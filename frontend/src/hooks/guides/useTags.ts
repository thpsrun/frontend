import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { listTagsFn } from "./tags-api"
import type { Tag } from "@/types/guides"

export function useTags() {
    return useQuery<Tag[]>({
        queryKey: queryKeys.tags.list(),
        queryFn: ({ signal }) => listTagsFn(signal),
        staleTime: 5 * 60_000,
    })
}
