import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/lib/query-keys"
import { activateTotp, deactivateTotp } from "./totp-api"

export function useActivateTotp() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (code: string) => activateTotp(code),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.auth.methods() })
            qc.invalidateQueries({ queryKey: queryKeys.auth.authenticators() })
            toast.success("Authenticator app enabled.")
        },
    })
}

export function useDeactivateTotp() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: () => deactivateTotp(),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.auth.methods() })
            qc.invalidateQueries({ queryKey: queryKeys.auth.authenticators() })
            toast.success("Authenticator app removed.")
        },
    })
}
