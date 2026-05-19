import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { deletePasswordFn } from "./auth-methods-api"

export function useDeletePassword() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: () => deletePasswordFn(),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.auth.methods() })
            qc.invalidateQueries({ queryKey: queryKeys.auth.session() })
            qc.invalidateQueries({ queryKey: queryKeys.auth.me() })
        },
    })
}
