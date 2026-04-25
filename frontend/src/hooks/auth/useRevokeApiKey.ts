import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { revokeApiKeyFn } from "./api-keys-api"
import {
    useInvalidatingMutation,
} from "@/hooks/use-invalidating-mutation"

export function useRevokeApiKey() {
    const qc = useQueryClient()
    return useInvalidatingMutation(revokeApiKeyFn, () =>
        qc.invalidateQueries({ queryKey: queryKeys.auth.apiKeys() }),
    )
}
