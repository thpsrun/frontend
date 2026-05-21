import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { createApiKeyFn } from "./api-keys-api"

export function useCreateApiKey() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: createApiKeyFn,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.auth.apiKeys() })
        },
    })
}
