import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ApiError } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import { mapDisconnectSocialError } from "@/lib/auth-errors"
import type { AuthProvider } from "@/types/auth"
import { disconnectSocialAccountFn } from "./auth-methods-api"

export function useDisconnectSocialAccount() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (provider: AuthProvider) =>
            disconnectSocialAccountFn(provider),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.auth.methods() })
            toast.success("Disconnected.")
        },
        onError: (err) => {
            const code = err instanceof ApiError ? err.code : null
            const { silent, toast: msg } = mapDisconnectSocialError(code)
            qc.invalidateQueries({ queryKey: queryKeys.auth.methods() })
            if (!silent && msg) {
                toast.error(msg)
            }
        },
    })
}
