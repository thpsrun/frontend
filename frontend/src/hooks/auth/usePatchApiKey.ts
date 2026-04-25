import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { patchApiKeyFn } from "./api-keys-api"
import type { ApiKeyPatchRequest } from "@/types/api-keys"

export function usePatchApiKey() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: ApiKeyPatchRequest }) =>
            patchApiKeyFn(id, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.auth.apiKeys() })
        },
    })
}
