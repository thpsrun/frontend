import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type {
    SubmitRunPayload,
    SubmitRunResponse,
} from "@/types/submissions"

const submitRun = (data: SubmitRunPayload): Promise<SubmitRunResponse> =>
    apiFetch<SubmitRunResponse>(
        "/auth/submissions/submit",
        { method: "POST", json: data },
    )

export function useSubmitRun() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: submitRun,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.submissions.all })
            queryClient.invalidateQueries({ queryKey: queryKeys.runs.all })
            queryClient.invalidateQueries({ queryKey: queryKeys.player.all })
        },
    })
}
