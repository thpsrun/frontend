import { useMutation, useQueryClient } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type {
    RunUpdateRequest, RunUpdateResponse,
} from "@/types/submissions"

const updateRun = (
    runId: string,
    data: RunUpdateRequest,
): Promise<RunUpdateResponse> =>
    apiFetch<RunUpdateResponse>(
        `/runs/${encodeURIComponent(runId)}`,
        { method: "PUT", json: data },
    )

export function useUpdateRun() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (vars: { runId: string; data: RunUpdateRequest }) =>
            updateRun(vars.runId, vars.data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.submissions.all,
            })
            queryClient.invalidateQueries({
                queryKey: queryKeys.runs.all,
            })
            queryClient.invalidateQueries({
                queryKey: queryKeys.player.all,
            })
            queryClient.invalidateQueries({
                queryKey: queryKeys.leaderboard.all,
            })
        },
    })
}
