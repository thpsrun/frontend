import { useMutation, useQueryClient } from "@tanstack/react-query"
import { resyncProfileFn } from "./auth-api"
import { queryKeys } from "@/lib/query-keys"

export function useResyncProfile() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: resyncProfileFn,
        onSuccess: (data) =>
            queryClient.setQueryData(queryKeys.auth.me(), data),
    })
}
