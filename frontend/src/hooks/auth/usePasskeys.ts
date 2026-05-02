import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { useSession } from "./useSession"
import { listAuthenticators } from "./passkey-api"

export function usePasskeys() {
    const { isAuthenticated } = useSession()
    return useQuery({
        queryKey: queryKeys.auth.passkeys(),
        queryFn: async ({ signal }) => {
            const all = await listAuthenticators(signal)
            return all.filter((a) => a.type === "webauthn")
        },
        enabled: isAuthenticated,
        retry: false,
    })
}
