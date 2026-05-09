import {
    useQuery, useMutation, useQueryClient,
} from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import {
    fetchBotSession,
    refreshBotSessionFn,
    setKillSwitchFn,
} from "./bot-session-api"
import type { BotSessionResponse } from "@/types/bot-session"

export function useBotSession() {
    const queryClient = useQueryClient()

    const sessionQuery = useQuery({
        queryKey: queryKeys.admin.botSession(),
        queryFn: ({ signal }) => fetchBotSession(signal),
        staleTime: 15 * 1000,
        refetchInterval: 20 * 1000,
    })

    const refresh = useMutation({
        mutationFn: refreshBotSessionFn,
        onSuccess: (data: BotSessionResponse) => {
            queryClient.setQueryData(
                queryKeys.admin.botSession(),
                data,
            )
        },
    })

    const updateKillSwitch = useMutation({
        mutationFn: setKillSwitchFn,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.admin.botSession(),
            })
        },
    })

    return {
        data: sessionQuery.data ?? null,
        isLoading: sessionQuery.isLoading,
        error: sessionQuery.error,
        refresh,
        updateKillSwitch,
    }
}
