import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { patchApiKeyFn } from "./api-keys-api"
import type { ApiKeyPatchRequest } from "@/types/api-keys"
import {
    useInvalidatingMutation,
} from "@/hooks/use-invalidating-mutation"

export function usePatchApiKey() {
    const qc = useQueryClient()
    return useInvalidatingMutation(
        ({ id, data }: { id: string; data: ApiKeyPatchRequest }) =>
            patchApiKeyFn(id, data),
        () => qc.invalidateQueries({
            queryKey: queryKeys.auth.apiKeys(),
        }),
    )
}
