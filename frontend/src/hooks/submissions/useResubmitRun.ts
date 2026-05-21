import { useMutation, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import { resubmitRunFn } from "@/hooks/submissions/submissions-api"
import type { ResubmitRunResponse } from "@/types/submissions"

interface Vars {
    runId: string
}

export function useResubmitRun() {
    const queryClient = useQueryClient()

    return useMutation<ResubmitRunResponse, Error, Vars>({
        mutationFn: ({ runId }) => resubmitRunFn(runId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.submissions.all })
            queryClient.invalidateQueries({ queryKey: queryKeys.runs.all })
            queryClient.invalidateQueries({ queryKey: queryKeys.player.all })
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
        },
    })
}
