import { apiFetch } from "@/lib/api-client"
import type {
    ResubmitRunResponse,
    SendBackForReviewRequest,
    SendBackForReviewResponse,
} from "@/types/submissions"

export function sendBackForReviewFn(
    runId: string,
    data: SendBackForReviewRequest,
): Promise<SendBackForReviewResponse> {
    return apiFetch<SendBackForReviewResponse>(
        `/auth/submissions/${encodeURIComponent(runId)}/review`,
        { method: "POST", json: data },
    )
}

export function resubmitRunFn(
    runId: string,
): Promise<ResubmitRunResponse> {
    return apiFetch<ResubmitRunResponse>(
        `/auth/submissions/${encodeURIComponent(runId)}/resubmit`,
        { method: "POST" },
    )
}
