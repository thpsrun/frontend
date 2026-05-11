import { apiFetch } from "@/lib/api-client"
import { buildQueryString } from "@/lib/utils"
import type {
    ReconcileJob,
    ReconcileJobDetail,
    ReconcileJobList,
    ReconcileJobsParams,
    ReconcileItemList,
    ReconcileItemsParams,
    ReconcileRequest,
} from "@/types/reconcile"

const BASE = "/auth/admin/reconcile"

export const fetchReconcileJobs = (
    params: ReconcileJobsParams,
    signal?: AbortSignal,
): Promise<ReconcileJobList> =>
    apiFetch<ReconcileJobList>(
        `${BASE}${buildQueryString(params)}`,
        { signal },
    )

export const fetchReconcileJob = (
    jobId: string,
    signal?: AbortSignal,
): Promise<ReconcileJobDetail> =>
    apiFetch<ReconcileJobDetail>(
        `${BASE}/${jobId}`,
        { signal },
    )

export const fetchReconcileItems = (
    jobId: string,
    params: ReconcileItemsParams,
    signal?: AbortSignal,
): Promise<ReconcileItemList> =>
    apiFetch<ReconcileItemList>(
        `${BASE}/${jobId}/items${buildQueryString(params)}`,
        { signal },
    )

export const startReconcileFn = (
    body: ReconcileRequest,
): Promise<ReconcileJob> =>
    apiFetch<ReconcileJob>(BASE, { method: "POST", json: body })

export const cancelReconcileFn = (
    jobId: string,
): Promise<ReconcileJob> =>
    apiFetch<ReconcileJob>(
        `${BASE}/${jobId}/cancel`,
        { method: "POST" },
    )
