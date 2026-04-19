import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { useSession } from "./useSession"
import { fetchProfile } from "./auth-api"

export function useCurrentPlayer() {
    const { isAuthenticated } = useSession()

    const profileQuery = useQuery({
        queryKey: queryKeys.auth.me(),
        queryFn: ({ signal }) => fetchProfile(signal),
        enabled: isAuthenticated,
        staleTime: 5 * 60 * 1000,
        retry: false,
    })

    return {
        player: profileQuery.data ?? null,
        isLoading: profileQuery.isLoading,
    }
}
