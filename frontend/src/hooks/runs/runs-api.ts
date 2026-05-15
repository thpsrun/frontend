import { apiFetch } from "@/lib/api-client"
import type { AllRunsParams, Run } from "@/types/runs"

const PAGE_SIZE = 100
const MAX_PAGES = 20

const buildQuery = (params: AllRunsParams): string => {
    const search = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
        if (v === undefined || v === null || v === "") continue
        search.set(k, String(v))
    }
    return search.toString()
}

export const fetchAllRunsPaginated = async (
    params: Omit<AllRunsParams, "limit" | "offset">,
    signal?: AbortSignal,
): Promise<Run[]> => {
    const out: Run[] = []
    for (let page = 0; page < MAX_PAGES; page++) {
        const qs = buildQuery({
            ...params,
            limit: PAGE_SIZE,
            offset: page * PAGE_SIZE,
        })
        const batch = await apiFetch<Run[]>(`/runs/all?${qs}`, { signal })
        out.push(...batch)
        if (batch.length < PAGE_SIZE) break
    }
    return out
}
