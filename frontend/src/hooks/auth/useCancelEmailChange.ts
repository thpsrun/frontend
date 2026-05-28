import { useMutation, useQueryClient } from "@tanstack/react-query"
import { cancelEmailChangeFn } from "./email-api"
import { queryKeys } from "@/lib/query-keys"

export function useCancelEmailChange() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: () => cancelEmailChangeFn(),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.auth.email() })
            qc.invalidateQueries({ queryKey: queryKeys.auth.me() })
        },
    })
}
