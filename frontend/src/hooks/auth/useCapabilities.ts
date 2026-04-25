import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { useSession } from "./useSession"
import { fetchCapabilitiesFn } from "./api-keys-api"

export function useCapabilities(enabled: boolean = true) {
    const { isAuthenticated } = useSession()

    return useQuery({
        queryKey: queryKeys.auth.capabilities(),
        queryFn: ({ signal }) => fetchCapabilitiesFn(signal),
        enabled: isAuthenticated && enabled,
        staleTime: 60_000,
    })
}
