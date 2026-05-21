import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { useSession } from "@/hooks/auth/useSession"
import { listNotificationsFn } from "./notifications-api"
import type { NotificationListParams } from "@/types/notifications"

export function useNotifications(params: NotificationListParams = {}) {
    const { isAuthenticated } = useSession()

    return useQuery({
        queryKey: queryKeys.notifications.list({
            unread_only: params.unread_only ?? false,
            types: params.types ?? [],
            limit: params.limit ?? 25,
            offset: params.offset ?? 0,
        }),
        queryFn: ({ signal }) => listNotificationsFn(params, signal),
        enabled: isAuthenticated,
        staleTime: 15_000,
        placeholderData: keepPreviousData,
    })
}
