import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { finalizeOauthSignupFn } from "./auth-methods-api"

export function useFinalizeOauthSignup() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: finalizeOauthSignupFn,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.auth.session() })
            qc.invalidateQueries({ queryKey: queryKeys.auth.methods() })
            qc.invalidateQueries({ queryKey: queryKeys.auth.me() })
        },
    })
}
