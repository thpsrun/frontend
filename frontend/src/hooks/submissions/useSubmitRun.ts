import { useMutation } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api-client"
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
    return useMutation({ mutationFn: submitRun })
}
