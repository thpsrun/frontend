import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { useSession } from "./useSession"
import { fetchAuthMethodsFn } from "./auth-methods-api"

export function useAuthMethods() {
    const { isAuthenticated } = useSession()
    return useQuery({
        queryKey: queryKeys.auth.methods(),
        queryFn: ({ signal }) => fetchAuthMethodsFn(signal),
        enabled: isAuthenticated,
        retry: false,
    })
}
