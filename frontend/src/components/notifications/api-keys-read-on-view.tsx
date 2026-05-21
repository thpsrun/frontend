import { useEffect, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import { useSession } from "@/hooks/auth/useSession"
import { readByTargetFn } from "@/hooks/notifications/notifications-api"
import type { ApiKeyResponse } from "@/types/api-keys"

interface Props {
    keys: ApiKeyResponse[]
}

export function ApiKeysReadOnView({ keys }: Props) {
    const { isAuthenticated } = useSession()
    const qc = useQueryClient()

    const idsKey = useMemo(
        () => keys.map((k) => k.id).sort().join(","),
        [keys],
    )

    useEffect(() => {
        if (!isAuthenticated) return
        if (!idsKey) return
        const ids = idsKey.split(",")
        Promise.allSettled(
            ids.map((id) => readByTargetFn("api_key", id)),
        ).then((results) => {
            const anyUpdated = results.some(
                (r) => r.status === "fulfilled" && r.value.updated > 0,
            )
            if (anyUpdated) {
                qc.invalidateQueries({ queryKey: queryKeys.notifications.all })
            }
        })
    }, [isAuthenticated, idsKey, qc])

    return null
}
