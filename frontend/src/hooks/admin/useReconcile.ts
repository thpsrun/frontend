import {
    useQuery, useMutation, useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/lib/query-keys"
import { getErrorMessage } from "@/lib/utils"
import {
    fetchReconcileJobs,
    fetchReconcileJob,
    fetchReconcileItems,
    startReconcileFn,
    cancelReconcileFn,
} from "./reconcile-api"
import type {
    ReconcileJob,
    ReconcileJobsParams,
    ReconcileItemsParams,
    ReconcileStatus,
} from "@/types/reconcile"

const ACTIVE_STATUSES: ReadonlySet<ReconcileStatus> = new Set([
    "PENDING",
    "IN_PROGRESS",
    "CANCELLING",
])

export function isJobActive(status: ReconcileStatus): boolean {
    return ACTIVE_STATUSES.has(status)
}

export function useReconcileJobs(params: ReconcileJobsParams = {}) {
    return useQuery({
        queryKey: queryKeys.admin.reconcileJobs(params),
        queryFn: ({ signal }) => fetchReconcileJobs(params, signal),
        staleTime: 5 * 1000,
        refetchInterval: 15 * 1000,
    })
}

export function useReconcileJob(jobId: string | undefined) {
    return useQuery({
        queryKey: queryKeys.admin.reconcileJob(jobId ?? ""),
        queryFn: ({ signal }) => fetchReconcileJob(jobId!, signal),
        enabled: Boolean(jobId),
        staleTime: 2 * 1000,
        refetchInterval: (query) => {
            const data = query.state.data
            if (!data) return 5 * 1000
            return isJobActive(data.status) ? 5 * 1000 : false
        },
    })
}

export function useReconcileItems(
    jobId: string | undefined,
    params: ReconcileItemsParams = {},
) {
    return useQuery({
        queryKey: queryKeys.admin.reconcileItems(jobId ?? "", params),
        queryFn: ({ signal }) => fetchReconcileItems(jobId!, params, signal),
        enabled: Boolean(jobId),
        staleTime: 5 * 1000,
        refetchInterval: 15 * 1000,
    })
}

export function useStartReconcile() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: startReconcileFn,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.admin.reconcileJobs(),
            })
            toast.success("Reconciliation queued.")
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to start reconciliation."))
        },
    })
}

export function useCancelReconcile() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: cancelReconcileFn,
        onSuccess: (job: ReconcileJob) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.admin.reconcileJobs(),
            })
            queryClient.invalidateQueries({
                queryKey: queryKeys.admin.reconcileJob(job.id),
            })
            queryClient.invalidateQueries({
                queryKey: queryKeys.admin.reconcileItems(job.id),
            })
            toast.success("Cancellation requested.")
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to cancel job."))
        },
    })
}
