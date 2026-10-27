import { partialMatchKey, useQuery, useQueryClient } from "@tanstack/react-query"
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
        mfaPending: sessionQuery.data?.mfaPending ?? false,
        user: sessionQuery.data?.isAuthenticated
            ? sessionQuery.data.user
            : null,
    }
}

const KEPT_ON_IDENTITY_CHANGE = [queryKeys.auth.session(), queryKeys.home.all]

export function useInvalidateAuth() {
    const queryClient = useQueryClient()
    return () => {
        queryClient.removeQueries({
            predicate: (query) => !KEPT_ON_IDENTITY_CHANGE.some(
                (key) => partialMatchKey(query.queryKey, key),
            ),
        })
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() })
    }
}

export function useInvalidateCurrentPlayer() {
    const queryClient = useQueryClient()
    return () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })
    }
}
