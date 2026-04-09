import { useMutation } from "@tanstack/react-query"
import { API_BASE_URL } from "@/constants"
import { mutationHeaders, handleApiError } from "@/lib/api"
import type {
    SubmitRunPayload,
    SubmitRunResponse,
} from "@/types/submissions"

async function submitRun(
    data: SubmitRunPayload,
): Promise<SubmitRunResponse> {
    const res = await fetch(
        `${API_BASE_URL}/auth/submissions/submit`,
        {
            method: "POST",
            credentials: "include",
            headers: mutationHeaders(),
            body: JSON.stringify(data),
        },
    )
    if (!res.ok) await handleApiError(res, "Failed to submit run")
    return res.json()
}

export function useSubmitRun() {
    return useMutation({
        mutationFn: submitRun,
    })
}
