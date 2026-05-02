import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { useSession } from "./useSession"
import { listLinkedProviders } from "./social-api"

export function useLinkedProviders() {
    const { isAuthenticated } = useSession()
    return useQuery({
        queryKey: queryKeys.auth.linkedProviders(),
        queryFn: ({ signal }) => listLinkedProviders(signal),
        enabled: isAuthenticated,
        retry: false,
    })
}
