import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { createApiKeyFn } from "./api-keys-api"
import {
    useInvalidatingMutation,
} from "@/hooks/use-invalidating-mutation"

export function useCreateApiKey() {
    const qc = useQueryClient()
    return useInvalidatingMutation(createApiKeyFn, () =>
        qc.invalidateQueries({ queryKey: queryKeys.auth.apiKeys() }),
    )
}
