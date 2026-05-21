import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { useSession } from "@/hooks/auth/useSession"
import { unreadCountFn } from "./notifications-api"

export function useUnreadCount() {
    const { isAuthenticated, isLoading } = useSession()

    return useQuery({
        queryKey: queryKeys.notifications.unreadCount(),
        queryFn: ({ signal }) => unreadCountFn(signal),
        enabled: isAuthenticated && !isLoading,
        staleTime: 0,
        refetchInterval: 15_000,
        refetchIntervalInBackground: false,
        refetchOnWindowFocus: true,
    })
}
