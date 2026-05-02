import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/lib/query-keys"
import { getErrorMessage } from "@/lib/utils"
import { reauthenticateFn } from "./auth-api"
import { disconnectProvider } from "./social-api"

interface Args {
    provider: string
    account: string
    password: string
}

export function useDisconnectProvider() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async ({ provider, account, password }: Args) => {
            // Disconnecting a social account changes the user's set of auth
            // methods, so allauth requires recent (re)authentication.
            await reauthenticateFn(password)
            await disconnectProvider(provider, account)
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.auth.linkedProviders() })
            toast.success("Disconnected.")
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to disconnect provider."))
        },
    })
}
