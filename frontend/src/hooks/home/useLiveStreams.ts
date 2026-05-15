import { useQuery } from "@tanstack/react-query"
import type { Stream } from "@/types/api"
import { apiFetch } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"

export const useLiveStreams = () => {
    return useQuery({
        queryKey: queryKeys.home.liveStreams(),
        queryFn: ({ signal }) =>
            apiFetch<Stream[]>("/streams/live", { signal }),
        staleTime: 60 * 1000,
        refetchInterval: 60 * 1000,
    })
}
