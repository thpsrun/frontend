import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "@/hooks/auth/useSession"
import { queryKeys } from "@/lib/query-keys"
import { listMyExportsFn, requestMyExportFn } from "./exports-api"
import type { DataExportItem } from "@/types/exports"

export function useMyExports() {
    const { isAuthenticated } = useSession()
    return useQuery({
        queryKey: queryKeys.auth.exports(),
        queryFn: ({ signal }) => listMyExportsFn(signal),
        enabled: isAuthenticated,
        select: (data): DataExportItem[] => data.exports,
    })
}

export function useRequestExport() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: requestMyExportFn,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.auth.exports() })
        },
    })
}
