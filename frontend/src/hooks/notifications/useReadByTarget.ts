import { useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { useSession } from "@/hooks/auth/useSession"
import { readByTargetFn } from "./notifications-api"
import type { NotificationTargetType } from "@/types/notifications"

interface ReadByTargetVars {
    tt: NotificationTargetType
    tid: string
}

export function useReadByTarget(
    target_type: NotificationTargetType | null,
    target_id: string | number | null,
) {
    const { isAuthenticated } = useSession()
    const qc = useQueryClient()
    const { mutate } = useMutation({
        mutationFn: ({ tt, tid }: ReadByTargetVars) => readByTargetFn(tt, tid),
        onSuccess: (data) => {
            if (data.updated > 0) {
                qc.invalidateQueries({ queryKey: queryKeys.notifications.all })
            }
        },
    })

    useEffect(() => {
        if (!isAuthenticated) return
        if (!target_type) return
        if (target_id === null || target_id === "" || target_id === undefined) return
        mutate({ tt: target_type, tid: String(target_id) })
    }, [isAuthenticated, target_type, target_id, mutate])
}
