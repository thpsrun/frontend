import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { generateRecoveryCodes } from "./recovery-codes-api"

export function useGenerateRecoveryCodes() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: () => generateRecoveryCodes(),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.auth.authenticators() })
            qc.invalidateQueries({ queryKey: queryKeys.auth.recoveryCodes() })
        },
    })
}
