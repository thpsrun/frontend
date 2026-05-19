import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { useSession } from "./useSession"
import { listAuthenticators } from "./passkey-api"

// The v1 endpoint at /api/v1/auth/me/auth/methods returns non-reversible hex IDs that allauth's
// headless delete endpoint won't recognize, so we query allauth directly for
// any operation keyed by id (delete, "is this my last passkey" check).
export function useAuthenticators() {
    const { isAuthenticated } = useSession()
    return useQuery({
        queryKey: queryKeys.auth.authenticators(),
        queryFn: ({ signal }) => listAuthenticators(signal),
        enabled: isAuthenticated,
        retry: false,
    })
}
