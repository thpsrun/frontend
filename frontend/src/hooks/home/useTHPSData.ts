import { useQuery } from "@tanstack/react-query"
import type { ApiResponse } from "@/types/api"
import { API_BASE_URL } from "@/constants"

const fetchTHPSData = async (): Promise<ApiResponse> => {
    const response = await fetch(
        `${API_BASE_URL}/website/main?embed=latest-wrs,latest-pbs,records`,
    )

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
}

export const useTHPSData = () => {
    return useQuery({
        queryKey: ["thps-data"],
        queryFn: fetchTHPSData,
        staleTime: 5 * 60 * 1000,
        refetchInterval: 30 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) =>
            Math.min(1000 * 2 ** attemptIndex, 30000),
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
