import {
    useQuery, useMutation, useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/lib/query-keys"
import { getErrorMessage } from "@/lib/utils"
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
            toast.success("Session Refreshed!")
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Refresh Failed..."))
        },
    })

    const updateKillSwitch = useMutation({
        mutationFn: setKillSwitchFn,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.admin.botSession(),
            })
            toast.success("Kill Switch Updated!")
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Update Failed..."))
        },
    })

    return {
        data: sessionQuery.data ?? null,
        isLoading: sessionQuery.isLoading,
        error: sessionQuery.error,
        refetch: sessionQuery.refetch,
        refresh,
        updateKillSwitch,
    }
}
