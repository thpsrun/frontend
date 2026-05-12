import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type { AwardOption } from "@/types/awards"

export const useAwardsAll = () => {
    return useQuery<AwardOption[]>({
        queryKey: queryKeys.awards.list(),
        queryFn: ({ signal }) => apiFetch<AwardOption[]>("/awards/all", { signal }),
        staleTime: 30 * 60 * 1000,
    })
}
