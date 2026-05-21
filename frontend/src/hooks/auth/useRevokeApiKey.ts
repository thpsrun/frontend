import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { revokeApiKeyFn } from "./api-keys-api"

export function useRevokeApiKey() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: revokeApiKeyFn,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.auth.apiKeys() })
        },
    })
}
