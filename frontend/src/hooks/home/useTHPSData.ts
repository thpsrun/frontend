import { useQuery } from "@tanstack/react-query"
import type { ApiResponse } from "@/types/api"
import { apiFetch } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"

const useTHPSData = () => {
    return useQuery({
        queryKey: queryKeys.home.thpsData(),
        queryFn: ({ signal }) =>
            apiFetch<ApiResponse>(
                "/website/main?embed=latest-wrs,latest-pbs,records",
                { signal },
            ),
        staleTime: 5 * 60 * 1000,
        refetchInterval: 30 * 1000,
    })
}

export const useTHPSRuns = () => {
    const { data, ...rest } = useTHPSData()
    return {
        data: data?.records || [],
        ...rest,
    }
}

export const useTHPSNewRuns = () => {
    const { data, ...rest } = useTHPSData()
    return {
        data: data?.latest_pbs || [],
        ...rest,
    }
}

export const useTHPSNewWRs = () => {
    const { data, ...rest } = useTHPSData()
    return {
        data: data?.latest_wrs || [],
        ...rest,
    }
}
