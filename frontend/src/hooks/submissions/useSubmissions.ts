import {
    useQuery, useMutation, useQueryClient,
} from "@tanstack/react-query"
import { apiFetch } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type {
    SubmissionsResponse,
    VerifyRejectRequest,
    VerifyRejectResponse,
    ChangePlayersRequest,
    ChangePlayersResponse,
} from "@/types/submissions"

const fetchSubmissions = (signal?: AbortSignal): Promise<SubmissionsResponse> =>
    apiFetch<SubmissionsResponse>("/auth/submissions", { signal })

const verifyRejectRun = (
    runId: string,
    data: VerifyRejectRequest,
): Promise<VerifyRejectResponse> =>
    apiFetch<VerifyRejectResponse>(
        `/auth/submissions/${runId}/status`,
        { method: "PUT", json: data },
    )

const changeRunPlayers = (
    runId: string,
    data: ChangePlayersRequest,
): Promise<ChangePlayersResponse> =>
    apiFetch<ChangePlayersResponse>(
        `/auth/submissions/${runId}/players`,
        { method: "PUT", json: data },
    )

export function useSubmissions() {
    const queryClient = useQueryClient()

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: queryKeys.submissions.all })

    const submissionsQuery = useQuery({
        queryKey: queryKeys.submissions.list(),
        queryFn: ({ signal }) => fetchSubmissions(signal),
        refetchInterval: 30 * 1000,
    })

    const verifyReject = useMutation({
        mutationFn: (
            vars: { runId: string; data: VerifyRejectRequest },
        ) => verifyRejectRun(vars.runId, vars.data),
        onSuccess: invalidate,
    })

    const changePlayers = useMutation({
        mutationFn: (
            vars: { runId: string; data: ChangePlayersRequest },
        ) => changeRunPlayers(vars.runId, vars.data),
        onSuccess: invalidate,
    })

    return {
        data: submissionsQuery.data ?? null,
        isLoading: submissionsQuery.isLoading,
        error: submissionsQuery.error,
        verifyReject,
        changePlayers,
    }
}
