import { useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { checkSession } from "./auth-api"

export function useSession() {
    const sessionQuery = useQuery({
        queryKey: queryKeys.auth.session(),
        queryFn: ({ signal }) => checkSession(signal),
        staleTime: 30_000,
        retry: false,
        refetchOnWindowFocus: "always",
    })

    return {
        isAuthenticated: sessionQuery.data?.isAuthenticated ?? false,
        isLoading: sessionQuery.isLoading,
        user: sessionQuery.data?.isAuthenticated
            ? sessionQuery.data.user
            : null,
    }
}

export function useInvalidateAuth() {
    const queryClient = useQueryClient()
    return () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() })
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })
    }
}

export function useInvalidateCurrentPlayer() {
    const queryClient = useQueryClient()
    return () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })
    }
}
