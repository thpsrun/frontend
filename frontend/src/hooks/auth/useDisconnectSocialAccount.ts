import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/lib/query-keys"
import type { AuthProvider } from "@/types/auth"
import { disconnectSocialAccountFn } from "./auth-methods-api"

export function useDisconnectSocialAccount() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (provider: AuthProvider) =>
            disconnectSocialAccountFn(provider),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.auth.methods() })
            qc.invalidateQueries({ queryKey: queryKeys.auth.me() })
            toast.success("Disconnected.")
        },
    })
}
