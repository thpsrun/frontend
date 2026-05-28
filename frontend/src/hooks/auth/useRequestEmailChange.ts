import { useMutation, useQueryClient } from "@tanstack/react-query"
import { requestEmailChangeFn } from "./email-api"
import { queryKeys } from "@/lib/query-keys"

export function useRequestEmailChange() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (newEmail: string) => requestEmailChangeFn(newEmail),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.auth.email() })
            qc.invalidateQueries({ queryKey: queryKeys.auth.me() })
        },
    })
}
