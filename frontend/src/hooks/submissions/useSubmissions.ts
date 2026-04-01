import {
    useQuery, useMutation, useQueryClient,
} from "@tanstack/react-query"
import { API_BASE_URL } from "@/constants"
import { mutationHeaders, handleApiError } from "@/lib/api"
import type {
    SubmissionsResponse,
    VerifyRejectRequest,
    VerifyRejectResponse,
    ChangePlayersRequest,
    ChangePlayersResponse,
} from "@/types/submissions"

async function fetchSubmissions(): Promise<SubmissionsResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/submissions`, {
        credentials: "include",
    })
    if (!res.ok) await handleApiError(res, "Failed to load submissions")
    return res.json()
}

async function verifyRejectRun(
    runId: string,
    data: VerifyRejectRequest,
): Promise<VerifyRejectResponse> {
    const res = await fetch(
        `${API_BASE_URL}/auth/submissions/${runId}/status`,
        {
            method: "PUT",
            credentials: "include",
            headers: mutationHeaders(),
            body: JSON.stringify(data),
        },
    )
    if (!res.ok) await handleApiError(res, "Failed to update run status")
    return res.json()
}

async function changeRunPlayers(
    runId: string,
    data: ChangePlayersRequest,
): Promise<ChangePlayersResponse> {
    const res = await fetch(
        `${API_BASE_URL}/auth/submissions/${runId}/players`,
        {
            method: "PUT",
            credentials: "include",
            headers: mutationHeaders(),
            body: JSON.stringify(data),
        },
    )
    if (!res.ok) await handleApiError(res, "Failed to update players")
    return res.json()
}

export function useSubmissions() {
    const queryClient = useQueryClient()

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: ["submissions"] })

    const submissionsQuery = useQuery({
        queryKey: ["submissions"],
        queryFn: fetchSubmissions,
        staleTime: 60 * 1000,
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
