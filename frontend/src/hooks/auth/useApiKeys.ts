import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { useSession } from "./useSession"
import { listApiKeysFn } from "./api-keys-api"

export function useApiKeys() {
    const { isAuthenticated } = useSession()

    return useQuery({
        queryKey: queryKeys.auth.apiKeys(),
        queryFn: ({ signal }) => listApiKeysFn(signal),
        enabled: isAuthenticated,
        staleTime: 60_000,
    })
}
