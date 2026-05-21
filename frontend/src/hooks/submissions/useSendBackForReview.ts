import { useMutation, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import { sendBackForReviewFn } from "@/hooks/submissions/submissions-api"
import type { SendBackForReviewResponse } from "@/types/submissions"

interface Vars {
    runId: string
    notes: string
}

export function useSendBackForReview() {
    const queryClient = useQueryClient()

    return useMutation<SendBackForReviewResponse, Error, Vars>({
        mutationFn: ({ runId, notes }) => sendBackForReviewFn(runId, { notes }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.submissions.all })
            queryClient.invalidateQueries({ queryKey: queryKeys.runs.all })
            queryClient.invalidateQueries({ queryKey: queryKeys.player.all })
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
        },
    })
}
