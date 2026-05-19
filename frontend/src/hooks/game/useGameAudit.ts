import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import { fetchGameAuditEntry, fetchGameAuditLog } from "./audit-api"
import type { AuditListParams } from "@/types/audit"

export function useGameAuditLog(
    gameSlug: string | undefined,
    params: AuditListParams,
) {
    return useQuery({
        queryKey: queryKeys.games.auditList(gameSlug ?? "", params),
        queryFn: ({ signal }) => fetchGameAuditLog(gameSlug!, params, signal),
        enabled: Boolean(gameSlug),
        staleTime: 30 * 1000,
    })
}

export function useGameAuditEntry(
    gameSlug: string | undefined,
    auditId: number | undefined,
    enabled: boolean = true,
) {
    return useQuery({
        queryKey: queryKeys.games.auditEntry(gameSlug ?? "", auditId ?? 0),
        queryFn: ({ signal }) =>
            fetchGameAuditEntry(gameSlug!, auditId!, signal),
        enabled: Boolean(gameSlug) && Boolean(auditId) && enabled,
        staleTime: 5 * 60 * 1000,
    })
}
