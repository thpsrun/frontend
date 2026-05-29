import { useQuery } from "@tanstack/react-query"
import { getEmailStatusFn } from "./email-api"
import { queryKeys } from "@/lib/query-keys"

export function useEmailStatus(enabled = true) {
    return useQuery({
        queryKey: queryKeys.auth.email(),
        queryFn: ({ signal }) => getEmailStatusFn(signal),
        enabled,
    })
}
