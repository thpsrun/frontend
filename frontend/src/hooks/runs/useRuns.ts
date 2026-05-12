import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { fetchAllRunsPaginated } from "./runs-api"
import type { AllRunsParams } from "@/types/runs"

export function useAllRunsPaginated(
    params: Omit<AllRunsParams, "limit" | "offset">,
    enabled = true,
) {
    return useQuery({
        queryKey: queryKeys.runs.listPaginated(params),
        queryFn: ({ signal }) => fetchAllRunsPaginated(params, signal),
        enabled,
    })
}
